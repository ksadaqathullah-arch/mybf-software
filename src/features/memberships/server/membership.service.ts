import 'server-only';
import { db } from '@/server/db';
import { MemberRegistrationInput, ApplicationReviewInput, ChapterTransferInput } from '../schemas/membership.schema';
import { assertAuthorized } from '@/server/auth/policy';
import { AuthActor } from '@/server/auth/types';
import { generateVerificationToken } from '@/features/membership-id-cards/server/card-crypto';
import { formatMemberId } from '@/lib/utils';

export class MembershipService {
  /**
   * Submit a new membership application with duplicate detection
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

    const chapter = await db.chapter.findUnique({
      where: { id: input.chapterId },
      include: { organization: true },
    });

    if (!chapter) {
      throw new Error('Selected chapter not found in Malappuram.');
    }

    // 2. Execute transaction: Create profile & application
    return await db.$transaction(async (tx) => {
      const profile = await tx.memberProfile.create({
        data: {
          userId,
          organizationId: chapter.organizationId,
          chapterId: chapter.id,
          fullName: input.fullName,
          primaryPhone: input.primaryPhone,
          email: input.email,
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
          gender: input.gender,
          occupation: input.occupation,
          companyName: input.companyName,
          businessSector: input.businessSector,
          yearsInBusiness: input.yearsInBusiness,
          isStudent: input.isStudent,
          institutionName: input.institutionName,
          courseName: input.courseName,
          addressLine: input.addressLine,
          taluk: input.taluk,
          ward: input.ward,
          pinCode: input.pinCode,
        },
      });

      const application = await tx.membershipApplication.create({
        data: {
          userId,
          organizationId: chapter.organizationId,
          chapterId: chapter.id,
          categoryId: input.categoryId,
          status: 'SUBMITTED',
          payloadJson: { ...input },
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
        validUntil.setFullYear(validUntil.getFullYear() + 1); // 1-year annual validity

        // Create permanent Membership
        const membership = await tx.membership.create({
          data: {
            memberProfileId: profile.id,
            organizationId: application.organizationId,
            chapterId: application.chapterId,
            categoryId: application.categoryId,
            sequenceNumber: BigInt(nextSequence),
            membershipNumber,
            status: 'ACTIVE',
            validUntil,
          },
        });

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
}
