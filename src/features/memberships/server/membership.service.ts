import 'server-only';
import { db } from '@/server/db';
import {
  MemberRegistrationInput,
  ApplicationReviewInput,
  ChapterTransferInput,
  UpdateMemberClassificationInput,
  UpdateYouthProfileInput,
} from '../schemas/membership.schema';
import { getTalentCategory } from '../constants/youth-discovery';
import { assertAuthorized } from '@/server/auth/policy';
import { AuthActor } from '@/server/auth/types';
import { generateVerificationToken } from '@/features/membership-id-cards/server/card-crypto';
import { formatMemberId } from '@/lib/utils';
import type { Prisma } from '@prisma/client';

export class MembershipService {
  /**
   * Submit a new membership application with duplicate detection and independent classifications
   */
  static async submitApplication(input: MemberRegistrationInput, userId: string) {
    // 1. Duplicate check on verified mobile and email
    const existingProfile = await db.memberProfile.findFirst({
      where: {
        OR: [{ primaryPhone: input.primaryPhone }, { email: input.email }],
      },
    });

    if (existingProfile) {
      throw new Error(
        'A member profile already exists with this phone number or email. Please log in to manage your membership.'
      );
    }

    const chapter = await db.chapter.findFirst({
      where: {
        OR: [
          { id: input.chapterId },
          { slug: input.chapterId },
          { code: input.chapterId },
        ],
      },
      include: { organization: true },
    });

    if (!chapter) {
      throw new Error('Selected chapter not found in Malappuram.');
    }

    // 2. Execute transaction: Create profile & application with independent classifications and youth data
    return await db.$transaction(async (tx) => {
      const expectationsData = (input.expectations || []).map((key) => ({
        expectationKey: key,
        customText: key === 'OTHER' ? input.otherExpectationText || null : null,
      }));

      const talentsData = (input.talents || []).map((key) => ({
        talentKey: key,
        category: getTalentCategory(key),
        customDescription: key === 'OTHER_TALENT' ? input.otherTalentDescription || null : null,
      }));

      const participationData = (input.participationPreferences || []).map((key) => ({
        preferenceKey: key,
      }));

      const profile = await tx.memberProfile.create({
        data: {
          userId,
          organizationId: chapter.organizationId,
          chapterId: chapter.id,
          fullName: input.fullName,
          primaryPhone: input.primaryPhone,
          email: input.email,
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
          gender: input.gender ?? null,
          futureGoal: input.futureGoal ?? null,
          memberCategory: input.memberCategory,
          currentPosition: input.currentPosition,
          occupation: input.occupation,
          companyName: input.companyName,
          businessSector: input.businessSector,
          yearsInBusiness: input.yearsInBusiness,
          isStudent: input.isStudent || input.memberCategory === 'STUDENT' || input.currentPosition === 'STUDENT',
          institutionName: input.institutionName,
          courseName: input.courseName,
          addressLine: input.addressLine,
          taluk: input.taluk,
          ward: input.ward,
          pinCode: input.pinCode,
          expectations: {
            create: expectationsData,
          },
          talents: {
            create: talentsData,
          },
          participationPreferences: {
            create: participationData,
          },
        },
      });

      const application = await tx.membershipApplication.create({
        data: {
          userId,
          organizationId: chapter.organizationId,
          chapterId: chapter.id,
          memberCategory: input.memberCategory,
          currentPosition: input.currentPosition,
          categoryId: input.categoryId ?? null,
          status: 'SUBMITTED',
          payloadJson: { ...input } as unknown as Prisma.InputJsonValue,
        },
      });

      return { profile, application };
    });
  }

  /**
   * Review an application (Approve / Reject / Additional Info)
   * Enforces server authorization and chapter isolation
   */
  static async reviewApplication(actor: AuthActor, input: ApplicationReviewInput) {
    const application = await db.membershipApplication.findUnique({
      where: { id: input.applicationId },
      include: { chapter: true, category: true },
    });

    if (!application) {
      throw new Error('Application not found.');
    }

    // Assert chapter leadership or central admin authority
    assertAuthorized({
      actor,
      action: input.action === 'APPROVE' ? 'member.approve_application' : 'member.reject_application',
      resource: 'membership_application',
      organizationId: application.organizationId,
      chapterId: application.chapterId,
    });

    return await db.$transaction(async (tx) => {
      if (input.action === 'REJECT') {
        const updated = await tx.membershipApplication.update({
          where: { id: input.applicationId },
          data: {
            status: 'REJECTED',
            rejectionReason: input.reason || 'Does not meet current membership criteria',
            reviewedById: actor.userId,
            reviewedAt: new Date(),
          },
        });

        await tx.membershipApprovalAction.create({
          data: {
            applicationId: input.applicationId,
            actorId: actor.userId,
            previousStatus: application.status,
            newStatus: 'REJECTED',
            reason: input.reason,
          },
        });

        return { status: 'REJECTED', application: updated };
      }

      if (input.action === 'APPROVE') {
        // Find existing highest sequence number
        const lastMembership = await tx.membership.findFirst({
          orderBy: { sequenceNumber: 'desc' },
          select: { sequenceNumber: true },
        });

        const nextSequence = lastMembership ? Number(lastMembership.sequenceNumber) + 1 : 1;
        const membershipNumber = formatMemberId(nextSequence);

        const profile = await tx.memberProfile.findFirst({
          where: { userId: application.userId },
        });

        if (!profile) {
          throw new Error('Member profile not found for this user.');
        }

        const validUntil = new Date();
        validUntil.setFullYear(validUntil.getFullYear() + 5); // 5-year NGO charter term, independent of fees (continuous free renewal)

        // Create permanent Membership
        const membership = await tx.membership.create({
          data: {
            memberProfileId: profile.id,
            organizationId: application.organizationId,
            chapterId: application.chapterId,
            categoryId: application.categoryId ?? null,
            sequenceNumber: BigInt(nextSequence),
            membershipNumber,
            status: 'ACTIVE',
            validUntil,
          },
        });

        // Ensure profile has classifications synced from application if missing
        if (
          (!profile.memberCategory && application.memberCategory) ||
          (!profile.currentPosition && application.currentPosition)
        ) {
          await tx.memberProfile.update({
            where: { id: profile.id },
            data: {
              memberCategory: profile.memberCategory ?? application.memberCategory,
              currentPosition: profile.currentPosition ?? application.currentPosition,
            },
          });
        }

        // Issue Initial Digital ID Card with cryptographic token
        const verificationToken = generateVerificationToken(membershipNumber, 1);
        await tx.membershipIdCard.create({
          data: {
            membershipId: membership.id,
            cardVersion: 1,
            verificationToken,
            expiresAt: validUntil,
            status: 'ACTIVE',
          },
        });

        // Mark application approved
        await tx.membershipApplication.update({
          where: { id: input.applicationId },
          data: {
            status: 'APPROVED',
            reviewedById: actor.userId,
            reviewedAt: new Date(),
          },
        });

        await tx.membershipApprovalAction.create({
          data: {
            applicationId: input.applicationId,
            actorId: actor.userId,
            previousStatus: application.status,
            newStatus: 'APPROVED',
            reason: input.notes || 'Approved by chapter leadership',
          },
        });

        return { status: 'APPROVED', membershipNumber, membershipId: membership.id };
      }

      throw new Error(`Unsupported review action: ${input.action}`);
    });
  }

  /**
   * Update member classification
   * Allows members to self-update their classification or authorized admins to update historical records.
   */
  static async updateMemberClassification(
    actor: AuthActor,
    memberProfileId: string,
    input: UpdateMemberClassificationInput
  ) {
    const profile = await db.memberProfile.findUnique({
      where: { id: memberProfileId },
    });

    if (!profile) {
      throw new Error('Member profile not found.');
    }

    assertAuthorized({
      actor,
      action: 'member.update_classification',
      resource: 'membership',
      recordOwnerId: profile.userId,
      chapterId: profile.chapterId,
      organizationId: profile.organizationId,
    });

    return await db.memberProfile.update({
      where: { id: memberProfileId },
      data: {
        memberCategory: input.memberCategory,
        currentPosition: input.currentPosition,
        isStudent: input.memberCategory === 'STUDENT' || input.currentPosition === 'STUDENT',
      },
    });
  }

  /**
   * Get member classification distribution statistics
   * Aggregates by MemberCategory and CurrentPosition, including unclassified historical records.
   */
  static async getClassificationDistribution(
    actor: AuthActor,
    filters?: {
      organizationId?: string;
      chapterId?: string;
      taluk?: string;
      startDate?: Date;
      endDate?: Date;
      memberCategory?: string;
      currentPosition?: string;
    }
  ) {
    const isSuperAdmin = actor.roles.includes('SUPER_ADMIN');
    const isDistrictAdmin = actor.roles.includes('DISTRICT_ADMIN');
    const isOrgAdmin = actor.roles.includes('ORGANIZATION_ADMIN');
    const isChapterLeader = actor.roles.some((r) =>
      ['CHAPTER_PRESIDENT', 'CHAPTER_SECRETARY', 'CHAPTER_TREASURER', 'CHAPTER_COORDINATOR', 'MEMBERSHIP_OFFICER'].includes(r)
    );

    const where: Prisma.MemberProfileWhereInput = {};

    if (!isSuperAdmin) {
      where.organizationId = actor.organizationId || undefined;
    } else if (filters?.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (isChapterLeader && !isDistrictAdmin && !isOrgAdmin && !isSuperAdmin) {
      where.chapterId = actor.chapterId || undefined;
    } else if (filters?.chapterId) {
      where.chapterId = filters.chapterId;
    }

    if (filters?.taluk) {
      where.taluk = filters.taluk;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters?.memberCategory) {
      where.memberCategory = filters.memberCategory as Prisma.EnumMemberCategoryNullableFilter;
    }

    if (filters?.currentPosition) {
      where.currentPosition = filters.currentPosition as Prisma.EnumCurrentPositionNullableFilter;
    }

    const totalMembers = await db.memberProfile.count({ where });

    const categoryGroup = await db.memberProfile.groupBy({
      by: ['memberCategory'],
      where,
      _count: { id: true },
    });

    const positionGroup = await db.memberProfile.groupBy({
      by: ['currentPosition'],
      where,
      _count: { id: true },
    });

    const categoryCounts: Record<string, number> = {
      STUDENT: 0,
      ASPIRING_ENTREPRENEUR: 0,
      ENTREPRENEUR_BUSINESS_OWNER: 0,
      OTHER: 0,
      UNCLASSIFIED: 0,
    };

    for (const item of categoryGroup) {
      if (item.memberCategory) {
        categoryCounts[item.memberCategory] = item._count.id;
      } else {
        categoryCounts.UNCLASSIFIED += item._count.id;
      }
    }

    const positionCounts: Record<string, number> = {
      STUDENT: 0,
      EMPLOYEE: 0,
      WORKER: 0,
      BUSINESS_OWNER: 0,
      ENTREPRENEUR: 0,
      SELF_EMPLOYED: 0,
      OTHER: 0,
      UNCLASSIFIED: 0,
    };

    for (const item of positionGroup) {
      if (item.currentPosition) {
        positionCounts[item.currentPosition] = item._count.id;
      } else {
        positionCounts.UNCLASSIFIED += item._count.id;
      }
    }

    return {
      totalMembers,
      categoryDistribution: [
        { key: 'STUDENT', label: 'Students', count: categoryCounts.STUDENT },
        { key: 'ASPIRING_ENTREPRENEUR', label: 'Interested in Starting a Business', count: categoryCounts.ASPIRING_ENTREPRENEUR },
        { key: 'ENTREPRENEUR_BUSINESS_OWNER', label: 'Entrepreneurs / Business Owners', count: categoryCounts.ENTREPRENEUR_BUSINESS_OWNER },
        { key: 'OTHER', label: 'Other', count: categoryCounts.OTHER },
        { key: 'UNCLASSIFIED', label: 'Unclassified (Historical)', count: categoryCounts.UNCLASSIFIED },
      ],
      positionDistribution: [
        { key: 'STUDENT', label: 'Students', count: positionCounts.STUDENT },
        { key: 'EMPLOYEE', label: 'Employees', count: positionCounts.EMPLOYEE },
        { key: 'WORKER', label: 'Workers', count: positionCounts.WORKER },
        { key: 'BUSINESS_OWNER', label: 'Business Owners', count: positionCounts.BUSINESS_OWNER },
        { key: 'ENTREPRENEUR', label: 'Entrepreneurs', count: positionCounts.ENTREPRENEUR },
        { key: 'SELF_EMPLOYED', label: 'Self-Employed', count: positionCounts.SELF_EMPLOYED },
        { key: 'OTHER', label: 'Other', count: positionCounts.OTHER },
        { key: 'UNCLASSIFIED', label: 'Unclassified (Historical)', count: positionCounts.UNCLASSIFIED },
      ],
    };
  }

  /**
   * Request transfer to another chapter
   * Preserves permanent member ID (does not generate new identity)
   */
  static async requestChapterTransfer(actor: AuthActor, input: ChapterTransferInput) {
    const profile = await db.memberProfile.findUnique({
      where: { id: input.memberProfileId },
    });

    if (!profile) {
      throw new Error('Profile not found.');
    }

    assertAuthorized({
      actor,
      action: 'member.transfer_request',
      resource: 'membership',
      recordOwnerId: profile.userId,
    });

    return await db.chapterTransfer.create({
      data: {
        memberProfileId: profile.id,
        fromChapterId: profile.chapterId,
        toChapterId: input.destinationChapterId,
        reason: input.reason,
        status: 'REQUESTED',
      },
    });
  }

  /**
   * Update youth expectations, talents, and participation preferences
   */
  static async updateYouthProfile(
    actor: AuthActor,
    memberProfileId: string,
    input: UpdateYouthProfileInput
  ) {
    const profile = await db.memberProfile.findUnique({
      where: { id: memberProfileId },
    });

    if (!profile) {
      throw new Error('Member profile not found.');
    }

    assertAuthorized({
      actor,
      action: 'member.update_own',
      resource: 'membership',
      recordOwnerId: profile.userId,
      chapterId: profile.chapterId,
      organizationId: profile.organizationId,
    });

    return await db.$transaction(async (tx) => {
      // Clear previous youth selections
      await tx.memberExpectation.deleteMany({ where: { memberProfileId } });
      await tx.memberTalent.deleteMany({ where: { memberProfileId } });
      await tx.memberParticipationPreference.deleteMany({ where: { memberProfileId } });

      // Create new selections
      const expectationsData = (input.expectations || []).map((key) => ({
        memberProfileId,
        expectationKey: key,
        customText: key === 'OTHER' ? input.otherExpectationText || null : null,
      }));

      const talentsData = (input.talents || []).map((key) => ({
        memberProfileId,
        talentKey: key,
        category: getTalentCategory(key),
        customDescription: key === 'OTHER_TALENT' ? input.otherTalentDescription || null : null,
      }));

      const participationData = (input.participationPreferences || []).map((key) => ({
        memberProfileId,
        preferenceKey: key,
      }));

      if (expectationsData.length > 0) {
        await tx.memberExpectation.createMany({ data: expectationsData });
      }
      if (talentsData.length > 0) {
        await tx.memberTalent.createMany({ data: talentsData });
      }
      if (participationData.length > 0) {
        await tx.memberParticipationPreference.createMany({ data: participationData });
      }

      return await tx.memberProfile.update({
        where: { id: memberProfileId },
        data: {
          futureGoal: input.futureGoal ?? null,
          gender: input.gender !== undefined ? input.gender : profile.gender,
        },
        include: {
          expectations: true,
          talents: true,
          participationPreferences: true,
        },
      });
    });
  }

  /**
   * Get youth discovery profile with normalized relations
   */
  static async getYouthProfile(memberProfileId: string) {
    return await db.memberProfile.findUnique({
      where: { id: memberProfileId },
      include: {
        expectations: true,
        talents: true,
        participationPreferences: true,
      },
    });
  }
}
