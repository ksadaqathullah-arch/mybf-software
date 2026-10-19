import 'server-only';
import { db } from '@/server/db';
import crypto from 'crypto';
import {
  MemberRegistrationInput,
  ApplicationReviewInput,
  ChapterTransferInput,
  UpdateMemberClassificationInput,
  UpdateYouthProfileInput,
  SuperAdminAgeExceptionReviewInput,
  SuperAdminApplicationReviewInput,
  AccountActivationInput,
} from '../schemas/membership.schema';
import {
  getTalentCategory,
  validateYouthAgeEligibility,
  calculateAge,
  AGE_ELIGIBILITY_ERROR_MESSAGE,
} from '../constants/youth-discovery';
import { assertAuthorized } from '@/server/auth/policy';
import { AuthActor } from '@/server/auth/types';
import { generateVerificationToken } from '@/features/membership-id-cards/server/card-crypto';
import { formatMemberId } from '@/lib/utils';
import { GeographyService } from '@/features/geography/server/geography.service';
import type { Prisma, ApplicationStatus } from '@prisma/client';

async function resolveAuditActorId(tx: Prisma.TransactionClient, actorUserId?: string | null): Promise<string | null> {
  if (!actorUserId) return null;
  const user = await tx.user.findUnique({ where: { id: actorUserId }, select: { id: true } });
  return user ? user.id : null;
}

export class MembershipService {
  /**
   * Submit a new membership application with username, scrypt-hashed password,
   * duplicate detection and independent classifications.
   * Creates a user in PENDING_VERIFICATION status awaiting Super Admin approval.
   */
  static async submitApplication(input: MemberRegistrationInput, userId?: string) {
    // 1. Normalize and validate username uniqueness (case-insensitive)
    const normalizedUsername = input.username.trim().toLowerCase();

    const existingUserWithUsername = await db.user.findFirst({
      where: {
        username: { equals: normalizedUsername, mode: 'insensitive' },
      },
    });
    if (existingUserWithUsername) {
      throw new Error(`Username "${input.username}" is already taken. Please choose another username.`);
    }

    const allApps = await db.membershipApplication.findMany({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      select: { id: true, payloadJson: true },
    });
    const usernameTakenInApp = allApps.some((app) => {
      const p = (app.payloadJson as Record<string, any>) || {};
      return typeof p.username === 'string' && p.username.trim().toLowerCase() === normalizedUsername;
    });
    if (usernameTakenInApp) {
      throw new Error(`Username "${input.username}" is already taken. Please choose another username.`);
    }

    // 2. Duplicate check on verified mobile and email
    const existingProfile = await db.memberProfile.findFirst({
      where: {
        OR: [{ primaryPhone: input.primaryPhone }, { email: input.email }],
      },
    });

    if (existingProfile) {
      throw new Error(
        'A member profile already exists with this phone number or email. Please sign in to manage your membership.'
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

    // 3. Server-side Age Eligibility & Exception Validation
    const ageCheck = validateYouthAgeEligibility(input.dateOfBirth);
    const applicantAge = ageCheck.age;

    if (input.requestAgeException) {
      if (ageCheck.isUnderAge) {
        throw new Error('Applicants must be at least 18 years of age.');
      }
      if (ageCheck.eligible) {
        throw new Error(
          'Applicant is aged 35 or below. Standard membership applies; special age exception is not required.'
        );
      }
      if (!input.ageExceptionReason || input.ageExceptionReason.trim().length < 10) {
        throw new Error(
          'Please provide a clear justification (minimum 10 characters) for requesting an age exception.'
        );
      }
    } else {
      if (!ageCheck.eligible) {
        throw new Error(ageCheck.error || AGE_ELIGIBILITY_ERROR_MESSAGE);
      }
    }

    const isAgeException = Boolean(input.requestAgeException && ageCheck.requiresAgeException);
    const initialStatus: ApplicationStatus = isAgeException ? 'UNDER_REVIEW' : 'SUBMITTED';

    // 3.5. Server-side Location Hierarchy Validation
    if (input.taluk && input.localBody) {
      const geoValidation = await GeographyService.validateLocationHierarchy({
        taluk: input.taluk,
        localBody: input.localBody,
        ward: input.ward,
      });
      if (!geoValidation.valid) {
        throw new Error(geoValidation.error || 'Invalid location hierarchy combination submitted.');
      }
    }

    // 3.6. Server-side Postal Relationship Validation
    if (input.pinCode && input.postOffice) {
      const postalValidation = await GeographyService.validatePostalRelationship({
        pinCode: input.pinCode,
        postOffice: input.postOffice,
        localBody: input.localBody,
        taluk: input.taluk,
      });
      if (!postalValidation.valid) {
        throw new Error(postalValidation.error || 'Invalid postal relationship submitted.');
      }
    }

    // 4. Securely hash password with scrypt
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(input.password, salt, 64);
    const passwordHash = `scrypt$${salt}$${derivedKey.toString('hex')}`;

    // 5. Execute transaction: Create pending user with hashed password, profile & application
    return await db.$transaction(async (tx) => {
      let targetUserId = userId;

      if (!targetUserId) {
        const existingUser = await tx.user.findFirst({
          where: {
            OR: [
              { username: { equals: normalizedUsername, mode: 'insensitive' } },
              { email: input.email },
              { phone: input.primaryPhone },
            ],
          },
        });

        if (existingUser) {
          if (existingUser.status === 'ACTIVE') {
            throw new Error(
              'An active account already exists with this email, phone, or username. Please sign in.'
            );
          }
          await tx.user.update({
            where: { id: existingUser.id },
            data: {
              username: normalizedUsername,
              passwordHash,
              email: input.email,
              phone: input.primaryPhone,
            },
          });
          targetUserId = existingUser.id;
        } else {
          const newUser = await tx.user.create({
            data: {
              username: normalizedUsername,
              email: input.email,
              phone: input.primaryPhone,
              status: 'PENDING_VERIFICATION',
              passwordHash,
            },
          });
          targetUserId = newUser.id;
        }
      }

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
          userId: targetUserId,
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
          addressLine: input.addressLine || (input.localBody ? `${input.localBody}${input.postOffice ? ', ' + input.postOffice : ''}` : undefined),
          district: input.district || 'Malappuram',
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

      // Strip plaintext passwords from stored application payload
      const safeInput = { ...input } as Record<string, unknown>;
      delete safeInput.password;
      delete safeInput.confirmPassword;
      const applicationPayload = {
        ...safeInput,
        username: input.username,
        applicantAge,
        ageException: isAgeException
          ? {
              requested: true,
              applicantAge,
              justification: input.ageExceptionReason,
              status: 'PENDING' as const,
              submittedAt: new Date().toISOString(),
            }
          : null,
      };

      const application = await tx.membershipApplication.create({
        data: {
          userId: targetUserId,
          organizationId: chapter.organizationId,
          chapterId: chapter.id,
          memberCategory: input.memberCategory,
          currentPosition: input.currentPosition,
          categoryId: input.categoryId ?? null,
          status: initialStatus,
          reviewNotes: isAgeException
            ? `Special Age Exception Requested (${applicantAge} years old): ${input.ageExceptionReason}`
            : null,
          payloadJson: applicationPayload as unknown as Prisma.InputJsonValue,
        },
      });

      // Audit log (never log passwords or hashes)
      await tx.auditEvent.create({
        data: {
          organizationId: chapter.organizationId,
          chapterId: chapter.id,
          action: isAgeException ? 'MEMBERSHIP_AGE_EXCEPTION_REQUESTED' : 'MEMBERSHIP_APPLICATION_SUBMITTED',
          resource: 'MembershipApplication',
          resourceId: application.id,
          diffJson: {
            applicantName: input.fullName,
            username: input.username,
            email: input.email,
            phone: input.primaryPhone,
            age: applicantAge,
            isAgeException,
            chapter: chapter.name,
          },
        },
      });

      // Notify Super Admins if age exception is requested
      if (isAgeException) {
        const superAdmins = await tx.userRoleAssignment.findMany({
          where: { role: { code: 'SUPER_ADMIN' } },
          select: { userId: true },
        });

        for (const admin of superAdmins) {
          await tx.notification.create({
            data: {
              userId: admin.userId,
              title: 'Special Age Exception Requested',
              message: `${input.fullName} (${applicantAge} yrs) requested an age exception for ${chapter.name}.`,
              channel: 'IN_APP',
              metadata: { applicationId: application.id, applicantAge },
            },
          });
        }
      }

      return {
        profile,
        application,
        isAgeException,
        applicantAge,
        referenceNumber: application.id,
        username: input.username,
      };
    });
  }

  /**
   * Super Admin Age Exception Review
   * Strictly restricted to actors with SUPER_ADMIN role.
   */
  static async reviewAgeException(actor: AuthActor, input: SuperAdminAgeExceptionReviewInput) {
    if (!actor || !actor.roles.includes('SUPER_ADMIN')) {
      throw new Error('Forbidden: Only Super Administrator can approve or reject age exceptions.');
    }

    const application = await db.membershipApplication.findUnique({
      where: { id: input.applicationId },
      include: { chapter: true, user: true },
    });

    if (!application) {
      throw new Error('Membership application not found.');
    }

    const payload = (application.payloadJson as Record<string, any>) || {};
    if (!payload.ageException || payload.ageException.status !== 'PENDING') {
      throw new Error('This application does not have a pending age exception review.');
    }

    return await db.$transaction(async (tx) => {
      if (input.decision === 'APPROVE') {
        const updatedPayload = {
          ...payload,
          ageException: {
            ...payload.ageException,
            status: 'APPROVED',
            decisionReason: input.reason,
            decidedById: actor.userId,
            decidedAt: new Date().toISOString(),
          },
        };

        const updated = await tx.membershipApplication.update({
          where: { id: input.applicationId },
          data: {
            status: 'SUBMITTED', // Unblock for chapter or district approval
            reviewNotes: `Age exception approved by Super Admin: ${input.reason}`,
            payloadJson: updatedPayload as unknown as Prisma.InputJsonValue,
          },
        });

        await tx.membershipApprovalAction.create({
          data: {
            applicationId: input.applicationId,
            actorId: actor.userId,
            previousStatus: application.status,
            newStatus: 'SUBMITTED',
            reason: `Age exception approved by Super Admin: ${input.reason}`,
          },
        });

        await tx.auditEvent.create({
          data: {
            organizationId: application.organizationId,
            chapterId: application.chapterId,
            actorId: await resolveAuditActorId(tx, actor.userId),
            actorEmail: actor.email,
            action: 'SUPER_ADMIN_AGE_EXCEPTION_APPROVED',
            resource: 'MembershipApplication',
            resourceId: input.applicationId,
            diffJson: { reason: input.reason, applicantId: application.userId },
          },
        });

        return { status: 'APPROVED', application: updated };
      } else {
        const updatedPayload = {
          ...payload,
          ageException: {
            ...payload.ageException,
            status: 'REJECTED',
            decisionReason: input.reason,
            decidedById: actor.userId,
            decidedAt: new Date().toISOString(),
          },
        };

        const updated = await tx.membershipApplication.update({
          where: { id: input.applicationId },
          data: {
            status: 'REJECTED',
            rejectionReason: `Age exception rejected by Super Admin: ${input.reason}`,
            reviewedById: actor.userId,
            reviewedAt: new Date(),
            payloadJson: updatedPayload as unknown as Prisma.InputJsonValue,
          },
        });

        await tx.membershipApprovalAction.create({
          data: {
            applicationId: input.applicationId,
            actorId: actor.userId,
            previousStatus: application.status,
            newStatus: 'REJECTED',
            reason: `Age exception rejected by Super Admin: ${input.reason}`,
          },
        });

        await tx.auditEvent.create({
          data: {
            organizationId: application.organizationId,
            chapterId: application.chapterId,
            actorId: await resolveAuditActorId(tx, actor.userId),
            actorEmail: actor.email,
            action: 'SUPER_ADMIN_AGE_EXCEPTION_REJECTED',
            resource: 'MembershipApplication',
            resourceId: input.applicationId,
            diffJson: { reason: input.reason, applicantId: application.userId },
          },
        });

        return { status: 'REJECTED', application: updated };
      }
    });
  }

  /**
   * Get pending age exceptions for Super Admin queue
   */
  static async getPendingAgeExceptions(actor: AuthActor) {
    if (!actor.roles.includes('SUPER_ADMIN')) {
      throw new Error('Forbidden: Only Super Administrator can access age exception reviews.');
    }

    const applications = await db.membershipApplication.findMany({
      include: {
        chapter: true,
        user: { include: { profile: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return applications
      .filter((app) => {
        const payload = (app.payloadJson as Record<string, any>) || {};
        return payload.ageException && payload.ageException.status === 'PENDING';
      })
      .map((app) => {
        const payload = (app.payloadJson as Record<string, any>) || {};
        const profile = app.user.profile;
        return {
          id: app.id,
          userId: app.userId,
          fullName: profile?.fullName || payload.fullName || 'Applicant',
          email: app.user.email || payload.email,
          phone: app.user.phone || payload.primaryPhone,
          dateOfBirth: profile?.dateOfBirth?.toISOString().split('T')[0] || payload.dateOfBirth,
          age: payload.ageException.applicantAge,
          justification: payload.ageException.justification,
          chapterName: app.chapter.name,
          chapterSlug: app.chapter.slug,
          memberCategory: app.memberCategory,
          currentPosition: app.currentPosition,
          submittedAt: app.submittedAt.toISOString(),
        };
      });
  }

  /**
   * Super Admin Applications Queue
   * Retrieves pending membership applications (SUBMITTED and UNDER_REVIEW).
   * Strictly restricted to actors with SUPER_ADMIN role.
   */
  static async getPendingApplicationsForSuperAdmin(actor: AuthActor) {
    if (!actor || !actor.roles.includes('SUPER_ADMIN')) {
      throw new Error('Forbidden: Only Super Administrator can access membership applications queue.');
    }

    const applications = await db.membershipApplication.findMany({
      where: {
        status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
      },
      orderBy: { submittedAt: 'asc' },
      include: {
        user: { select: { id: true, username: true, email: true, phone: true, status: true } },
        chapter: { select: { id: true, name: true, slug: true } },
      },
    });

    const userIds = applications.map((a) => a.userId);
    const profiles = await db.memberProfile.findMany({
      where: { userId: { in: userIds } },
    });
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

    return applications.map((app) => {
      const profile = profileMap.get(app.userId);
      const payload = (app.payloadJson as Record<string, any>) || {};
      const dob = profile?.dateOfBirth ? profile.dateOfBirth.toISOString().split('T')[0] : payload.dateOfBirth || '';
      const applicantAge = payload.applicantAge ?? (dob ? calculateAge(dob) : 0);
      const isAgeException = app.status === 'UNDER_REVIEW' || Boolean(payload.ageException?.requested);

      return {
        id: app.id,
        userId: app.userId,
        fullName: profile?.fullName || payload.fullName || 'Applicant',
        username: app.user.username || payload.username || 'Not set',
        email: app.user.email || profile?.email || null,
        phone: app.user.phone || profile?.primaryPhone || null,
        chapterName: app.chapter.name,
        chapterSlug: app.chapter.slug,
        memberCategory: app.memberCategory,
        currentPosition: app.currentPosition,
        submittedAt: app.submittedAt.toISOString(),
        dateOfBirth: dob,
        applicantAge,
        isAgeException,
        ageEligibilityStatus: isAgeException
          ? `Age Exception Required (${applicantAge} yrs)`
          : `Eligible Youth (${applicantAge} yrs)`,
        status: app.status,
        justification: payload.ageException?.justification || null,
      };
    });
  }

  /**
   * Super Admin Application Review (Approve or Reject)
   * Strictly restricted to SUPER_ADMIN role.
   * APPROVE: Atomically activates user account, assigns MEMBER role, creates Membership with sequential ID, issues Digital ID.
   * REJECT: Records rejection reason, keeps user account unable to sign in.
   */
  static async reviewApplicationBySuperAdmin(actor: AuthActor, input: SuperAdminApplicationReviewInput) {
    if (!actor || !actor.roles.includes('SUPER_ADMIN')) {
      throw new Error('Forbidden: Only Super Administrator can approve or reject membership applications.');
    }

    const application = await db.membershipApplication.findUnique({
      where: { id: input.applicationId },
      include: { chapter: true, user: true },
    });

    if (!application) {
      throw new Error('Membership application not found.');
    }

    // Idempotency: if already approved, return existing membership
    if (application.status === 'APPROVED' && input.action === 'APPROVE') {
      const profile = await db.memberProfile.findFirst({
        where: { userId: application.userId },
      });
      const existingMembership = profile
        ? await db.membership.findFirst({
            where: { memberProfileId: profile.id },
          })
        : null;
      return {
        status: 'APPROVED',
        membershipNumber: existingMembership?.membershipNumber || 'ALREADY_APPROVED',
        alreadyApproved: true,
      };
    }

    return await db.$transaction(async (tx) => {
      const profile = await tx.memberProfile.findFirst({
        where: { userId: application.userId },
      });

      if (!profile) {
        throw new Error('Member profile not found for this user.');
      }

      const payload = (application.payloadJson as Record<string, any>) || {};

      if (input.action === 'APPROVE') {
        // 1. Allocate next sequential membership number
        const lastMembership = await tx.membership.findFirst({
          orderBy: { sequenceNumber: 'desc' },
          select: { sequenceNumber: true },
        });
        const nextSequence = lastMembership ? Number(lastMembership.sequenceNumber) + 1 : 1;
        const membershipNumber = formatMemberId(nextSequence);

        const validUntil = new Date();
        validUntil.setFullYear(validUntil.getFullYear() + 5);

        // 2. Create permanent Membership record
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

        // 3. Issue Digital ID Card
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

        // 4. Activate User account
        await tx.user.update({
          where: { id: application.userId },
          data: {
            status: 'ACTIVE',
            emailVerified: new Date(),
          },
        });

        // 5. Assign standard MEMBER role
        const memberRole = await tx.role.findUnique({ where: { code: 'MEMBER' } });
        if (memberRole) {
          await tx.userRoleAssignment.upsert({
            where: {
              userId_roleId_organizationId_chapterId: {
                userId: application.userId,
                roleId: memberRole.id,
                organizationId: application.organizationId,
                chapterId: application.chapterId,
              },
            },
            update: {},
            create: {
              userId: application.userId,
              roleId: memberRole.id,
              organizationId: application.organizationId,
              chapterId: application.chapterId,
            },
          });
        }

        // 6. Update application status
        const updatedPayload = {
          ...payload,
          superAdminApproval: {
            approvedBy: actor.userId,
            approvedAt: new Date().toISOString(),
            reason: input.reason,
            membershipNumber,
          },
        };

        const updatedApp = await tx.membershipApplication.update({
          where: { id: input.applicationId },
          data: {
            status: 'APPROVED',
            reviewedById: actor.userId,
            reviewedAt: new Date(),
            reviewNotes: `Approved by Super Admin: ${input.reason}`,
            payloadJson: updatedPayload as unknown as Prisma.InputJsonValue,
          },
        });

        // 7. Record approval action
        await tx.membershipApprovalAction.create({
          data: {
            applicationId: input.applicationId,
            actorId: actor.userId,
            previousStatus: application.status,
            newStatus: 'APPROVED',
            reason: input.reason,
          },
        });

        // 8. Record audit log
        await tx.auditEvent.create({
          data: {
            organizationId: application.organizationId,
            chapterId: application.chapterId,
            actorId: await resolveAuditActorId(tx, actor.userId),
            actorEmail: actor.email,
            action: 'SUPER_ADMIN_MEMBERSHIP_APPLICATION_APPROVED',
            resource: 'MembershipApplication',
            resourceId: input.applicationId,
            diffJson: {
              membershipNumber,
              membershipId: membership.id,
              reason: input.reason,
              applicantUserId: application.userId,
            },
          },
        });

        // 9. Send in-app notification
        await tx.notification.create({
          data: {
            userId: application.userId,
            title: 'Your MYBF Membership has been Approved!',
            message: `Congratulations! Your membership (${membershipNumber}) has been approved by the Super Administrator. You may now sign in with your credentials.`,
            channel: 'IN_APP',
            metadata: { membershipNumber },
          },
        });

        return {
          status: 'APPROVED',
          membershipNumber,
          membershipId: membership.id,
          application: updatedApp,
        };
      } else {
        // REJECT
        const updatedPayload = {
          ...payload,
          superAdminRejection: {
            rejectedBy: actor.userId,
            rejectedAt: new Date().toISOString(),
            reason: input.reason,
          },
        };

        const updatedApp = await tx.membershipApplication.update({
          where: { id: input.applicationId },
          data: {
            status: 'REJECTED',
            rejectionReason: input.reason,
            reviewedById: actor.userId,
            reviewedAt: new Date(),
            reviewNotes: `Rejected by Super Admin: ${input.reason}`,
            payloadJson: updatedPayload as unknown as Prisma.InputJsonValue,
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

        await tx.auditEvent.create({
          data: {
            organizationId: application.organizationId,
            chapterId: application.chapterId,
            actorId: await resolveAuditActorId(tx, actor.userId),
            actorEmail: actor.email,
            action: 'SUPER_ADMIN_MEMBERSHIP_APPLICATION_REJECTED',
            resource: 'MembershipApplication',
            resourceId: input.applicationId,
            diffJson: {
              reason: input.reason,
              applicantUserId: application.userId,
            },
          },
        });

        await tx.notification.create({
          data: {
            userId: application.userId,
            title: 'Membership Application Update',
            message: `Your membership application was not approved: ${input.reason}`,
            channel: 'IN_APP',
            metadata: { reason: input.reason },
          },
        });

        return {
          status: 'REJECTED',
          application: updatedApp,
        };
      }
    });
  }

  /**
   * Review an application (Approve / Reject / Additional Info)
   * Enforces server authorization, chapter isolation, and age-exception guards.
   * On approval, generates permanent ID, creates digital card, and issues account activation invitation.
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

    // Guard: Prevent chapter or district admins from approving unapproved age exceptions
    const payload = (application.payloadJson as Record<string, any>) || {};
    if (payload.ageException?.requested && payload.ageException?.status !== 'APPROVED') {
      if (!actor.roles.includes('SUPER_ADMIN')) {
        throw new Error(
          'This application exceeds 35 years of age and requires Super Admin age exception approval before chapter leadership can approve it.'
        );
      }
    }

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

        await tx.auditEvent.create({
          data: {
            organizationId: application.organizationId,
            chapterId: application.chapterId,
            actorId: await resolveAuditActorId(tx, actor.userId),
            actorEmail: actor.email,
            action: 'MEMBERSHIP_APPLICATION_REJECTED',
            resource: 'MembershipApplication',
            resourceId: input.applicationId,
            diffJson: { reason: input.reason },
          },
        });

        return { status: 'REJECTED', application: updated };
      }

      if (input.action === 'RECOMMEND_APPROVAL') {
        const updatedPayload = {
          ...payload,
          chapterRecommendation: {
            recommendedBy: actor.userId,
            recommendedAt: new Date().toISOString(),
            notes: input.notes,
            decision: 'RECOMMENDED',
          },
        };

        const updated = await tx.membershipApplication.update({
          where: { id: input.applicationId },
          data: {
            status: 'UNDER_REVIEW',
            reviewedById: actor.userId,
            reviewedAt: new Date(),
            reviewNotes: input.notes || 'Recommended for approval by chapter executive committee.',
            payloadJson: updatedPayload as unknown as Prisma.InputJsonValue,
          },
        });

        await tx.membershipApprovalAction.create({
          data: {
            applicationId: input.applicationId,
            actorId: actor.userId,
            previousStatus: application.status,
            newStatus: 'UNDER_REVIEW',
            reason: input.notes || 'Chapter executive recommended approval',
          },
        });

        await tx.auditEvent.create({
          data: {
            organizationId: application.organizationId,
            chapterId: application.chapterId,
            actorId: await resolveAuditActorId(tx, actor.userId),
            actorEmail: actor.email,
            action: 'CHAPTER_APPLICATION_RECOMMENDED',
            resource: 'MembershipApplication',
            resourceId: input.applicationId,
            diffJson: { notes: input.notes },
          },
        });

        return { status: 'UNDER_REVIEW', application: updated, message: 'Application recommended and forwarded to Super Admin for final approval.' };
      }

      if (input.action === 'REQUEST_INFO' || input.action === 'REQUEST_CORRECTION') {
        const updatedPayload = {
          ...payload,
          correctionRequest: {
            requestedBy: actor.userId,
            requestedAt: new Date().toISOString(),
            notes: input.notes || input.reason,
          },
        };

        const updated = await tx.membershipApplication.update({
          where: { id: input.applicationId },
          data: {
            status: 'ADDITIONAL_INFO_REQUESTED',
            reviewedById: actor.userId,
            reviewedAt: new Date(),
            reviewNotes: input.notes || input.reason || 'Additional information or document correction requested.',
            payloadJson: updatedPayload as unknown as Prisma.InputJsonValue,
          },
        });

        await tx.membershipApprovalAction.create({
          data: {
            applicationId: input.applicationId,
            actorId: actor.userId,
            previousStatus: application.status,
            newStatus: 'ADDITIONAL_INFO_REQUESTED',
            reason: input.notes || input.reason,
          },
        });

        await tx.auditEvent.create({
          data: {
            organizationId: application.organizationId,
            chapterId: application.chapterId,
            actorId: await resolveAuditActorId(tx, actor.userId),
            actorEmail: actor.email,
            action: 'CHAPTER_CORRECTION_REQUESTED',
            resource: 'MembershipApplication',
            resourceId: input.applicationId,
            diffJson: { notes: input.notes || input.reason },
          },
        });

        return { status: 'ADDITIONAL_INFO_REQUESTED', application: updated, message: 'Correction requested from applicant.' };
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
        validUntil.setFullYear(validUntil.getFullYear() + 5); // 5-year NGO charter term, continuous free renewal

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

        // Issue single-use, short-lived account activation token (72-hour lifetime)
        const rawActivationToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawActivationToken).digest('hex');
        const activationExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

        const updatedPayload = {
          ...payload,
          activation: {
            tokenHash,
            expiresAt: activationExpiresAt.toISOString(),
            createdAt: new Date().toISOString(),
            usedAt: null,
          },
        };

        // Mark application approved
        await tx.membershipApplication.update({
          where: { id: input.applicationId },
          data: {
            status: 'APPROVED',
            reviewedById: actor.userId,
            reviewedAt: new Date(),
            payloadJson: updatedPayload as unknown as Prisma.InputJsonValue,
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

        // Audit log
        await tx.auditEvent.create({
          data: {
            organizationId: application.organizationId,
            chapterId: application.chapterId,
            actorId: await resolveAuditActorId(tx, actor.userId),
            actorEmail: actor.email,
            action: 'MEMBERSHIP_APPLICATION_APPROVED',
            resource: 'MembershipApplication',
            resourceId: input.applicationId,
            diffJson: {
              membershipNumber,
              membershipId: membership.id,
              notes: input.notes,
            },
          },
        });

        // Create in-app Notification with activation link
        await tx.notification.create({
          data: {
            userId: application.userId,
            title: 'Your MYBF Membership has been Approved!',
            message: `Congratulations! Your membership (${membershipNumber}) is approved. Please activate your account to choose your username and password.`,
            channel: 'IN_APP',
            metadata: {
              membershipNumber,
              activationUrl: `/activate?token=${rawActivationToken}`,
            },
          },
        });

        return {
          status: 'APPROVED',
          membershipNumber,
          membershipId: membership.id,
          activationToken: rawActivationToken,
          activationUrl: `/activate?token=${rawActivationToken}`,
        };
      }

      throw new Error(`Unsupported review action: ${input.action}`);
    });
  }

  /**
   * Verify an Account Activation Token
   * Validates token authenticity, non-expiration, and single-use status.
   */
  static async verifyActivationToken(rawToken: string) {
    if (!rawToken || rawToken.trim().length < 16) {
      throw new Error('Invalid or missing activation token.');
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');

    const applications = await db.membershipApplication.findMany({
      where: {
        status: 'APPROVED',
      },
      include: {
        user: true,
        chapter: true,
      },
    });

    const matchingApp = applications.find((app) => {
      const payload = (app.payloadJson as Record<string, any>) || {};
      return payload.activation?.tokenHash === tokenHash;
    });

    if (!matchingApp) {
      throw new Error('Invalid or unrecognized activation token.');
    }

    const payload = (matchingApp.payloadJson as Record<string, any>) || {};
    const activation = payload.activation;

    if (activation.usedAt) {
      throw new Error('This activation invitation has already been used. Please sign in with your credentials.');
    }

    if (new Date(activation.expiresAt) < new Date()) {
      throw new Error('This activation link has expired (valid for 72 hours). Please request a fresh invitation.');
    }

    const profile = await db.memberProfile.findFirst({
      where: { userId: matchingApp.userId },
    });

    const membership = await db.membership.findFirst({
      where: { memberProfileId: profile?.id },
    });

    return {
      applicationId: matchingApp.id,
      userId: matchingApp.userId,
      fullName: profile?.fullName || 'Applicant',
      email: matchingApp.user.email,
      phone: matchingApp.user.phone,
      chapterName: matchingApp.chapter.name,
      membershipNumber: membership?.membershipNumber || 'PENDING',
    };
  }

  /**
   * Complete Account Activation
   * Sets member's unique username, password hash (scrypt), activates user account,
   * assigns MEMBER role, and invalidates the activation token.
   */
  static async activateAccount(input: AccountActivationInput) {
    const verified = await this.verifyActivationToken(input.token);

    // Validate username uniqueness across existing applications and users
    const cleanedUsername = input.username.trim().toLowerCase();
    const allApps = await db.membershipApplication.findMany({
      select: { id: true, payloadJson: true },
    });

    const usernameTaken = allApps.some((app) => {
      const p = (app.payloadJson as Record<string, any>) || {};
      return p.username && p.username.toLowerCase() === cleanedUsername && app.id !== verified.applicationId;
    });

    if (usernameTaken) {
      throw new Error(`Username "${input.username}" is already taken. Please choose another username.`);
    }

    // Hash password securely with crypto.scryptSync
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(input.password, salt, 64);
    const passwordHash = `scrypt$${salt}$${derivedKey.toString('hex')}`;

    return await db.$transaction(async (tx) => {
      const application = await tx.membershipApplication.findUnique({
        where: { id: verified.applicationId },
      });

      if (!application) {
        throw new Error('Application not found.');
      }

      const payload = (application.payloadJson as Record<string, any>) || {};
      if (payload.activation?.usedAt) {
        throw new Error('This activation token was already used.');
      }

      // Invalidate activation token and record username
      const updatedPayload = {
        ...payload,
        username: input.username.trim(),
        activation: {
          ...payload.activation,
          usedAt: new Date().toISOString(),
        },
      };

      await tx.membershipApplication.update({
        where: { id: verified.applicationId },
        data: { payloadJson: updatedPayload as unknown as Prisma.InputJsonValue },
      });

      // Activate User account with passwordHash
      await tx.user.update({
        where: { id: verified.userId },
        data: {
          passwordHash,
          status: 'ACTIVE',
          emailVerified: new Date(),
          phoneVerified: new Date(),
        },
      });

      // Ensure MEMBER role is assigned
      const memberRole = await tx.role.findUnique({
        where: { code: 'MEMBER' },
      });

      if (memberRole) {
        const existingAssignment = await tx.userRoleAssignment.findFirst({
          where: { userId: verified.userId, roleId: memberRole.id },
        });

        if (!existingAssignment) {
          await tx.userRoleAssignment.create({
            data: {
              userId: verified.userId,
              roleId: memberRole.id,
              chapterId: application.chapterId,
              organizationId: application.organizationId,
            },
          });
        }
      }

      // Audit log
      await tx.auditEvent.create({
        data: {
          organizationId: application.organizationId,
          chapterId: application.chapterId,
          actorId: await resolveAuditActorId(tx, verified.userId),
          actorEmail: verified.email,
          action: 'ACCOUNT_ACTIVATED',
          resource: 'User',
          resourceId: verified.userId,
          diffJson: {
            username: input.username.trim(),
            membershipNumber: verified.membershipNumber,
          },
        },
      });

      return {
        success: true,
        username: input.username.trim(),
        membershipNumber: verified.membershipNumber,
        message: 'Account successfully activated! You may now sign in with your username or email.',
      };
    });
  }

  /**
   * Authenticate Member by Username, Email or Phone Number and Password
   */
  static async authenticateMember(identifier: string, password: string) {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Search User by email, phone, or normalized mobile digits
    const digitsOnly = cleanId.replace(/\D/g, '');
    const phoneCandidates: string[] = [cleanId];
    if (digitsOnly.length === 10) {
      phoneCandidates.push(digitsOnly);
      phoneCandidates.push(`+91${digitsOnly}`);
      phoneCandidates.push(`91${digitsOnly}`);
    } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      const tenDigits = digitsOnly.slice(2);
      phoneCandidates.push(tenDigits);
      phoneCandidates.push(`+91${tenDigits}`);
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
      const tenDigits = digitsOnly.slice(1);
      phoneCandidates.push(tenDigits);
      phoneCandidates.push(`+91${tenDigits}`);
    }

    let targetUser = await db.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanId, mode: 'insensitive' } },
          { email: { equals: cleanId, mode: 'insensitive' } },
          { phone: { in: phoneCandidates } },
          { profile: { primaryPhone: { in: phoneCandidates } } },
        ],
      },
      include: {
        profile: true,
        roleAssignments: { include: { role: true } },
      },
    });

    // 2. If not found by email or phone, match by username in applications
    if (!targetUser) {
      const apps = await db.membershipApplication.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            include: {
              profile: true,
              roleAssignments: { include: { role: true } },
            },
          },
        },
      });

      const matchedApp = apps.find((app) => {
        const p = (app.payloadJson as Record<string, any>) || {};
        return (
          typeof p.username === 'string' &&
          p.username.trim().toLowerCase() === cleanId
        );
      });

      if (matchedApp) {
        targetUser = matchedApp.user;
      }
    }

    if (!targetUser) {
      throw new Error('Invalid username/email or password.');
    }

    // 3. Verify password FIRST (deny-by-default, do not expose account existence / approval state without password)
    if (!targetUser.passwordHash) {
      throw new Error('Invalid username/email or password.');
    }

    const parts = targetUser.passwordHash.split('$');
    let isValid = false;

    if (parts.length === 3 && parts[0] === 'scrypt') {
      const salt = parts[1];
      const originalHash = parts[2];
      const derivedKey = crypto.scryptSync(password, salt, 64);
      isValid = derivedKey.toString('hex') === originalHash;
    } else {
      isValid = targetUser.passwordHash === password;
    }

    if (!isValid) {
      throw new Error('Invalid username/email or password.');
    }

    // 4. Confirmed credentials match. Now evaluate account approval and active status.
    if (targetUser.status === 'PENDING_VERIFICATION') {
      const latestApp = await db.membershipApplication.findFirst({
        where: { userId: targetUser.id },
        orderBy: { submittedAt: 'desc' },
        include: { chapter: true },
      });

      if (latestApp) {
        if (latestApp.status === 'SUBMITTED' || latestApp.status === 'UNDER_REVIEW') {
          throw new Error(
            'Your membership account is pending approval by the MYBF Super Administrator. Please try signing in after approval.'
          );
        }
        if (latestApp.status === 'REJECTED') {
          throw new Error(
            `Your membership application was not approved: ${latestApp.rejectionReason || 'Please contact administration.'}`
          );
        }
      }

      throw new Error(
        'Your membership account is pending approval by the MYBF Super Administrator. Please try signing in after approval.'
      );
    }

    if (targetUser.status === 'SUSPENDED') {
      throw new Error('Your account is currently suspended. Please contact MYBF administration.');
    }

    if (targetUser.status === 'DEACTIVATED') {
      throw new Error('Your account is currently deactivated. Please contact MYBF administration.');
    }

    if (targetUser.status !== 'ACTIVE') {
      throw new Error(
        `Your account is currently ${String(targetUser.status).toLowerCase()}. Please contact administration.`
      );
    }

    // Update last login timestamp
    await db.user.update({
      where: { id: targetUser.id },
      data: { lastLoginAt: new Date() },
    });

    const membership = await db.membership.findFirst({
      where: { memberProfileId: targetUser.profile?.id, status: 'ACTIVE' },
      include: { idCards: true, chapter: true },
    });

    return {
      user: {
        id: targetUser.id,
        email: targetUser.email,
        phone: targetUser.phone,
        username: targetUser.username,
        status: targetUser.status,
        roles: targetUser.roleAssignments.map((ra) => ra.role.code),
      },
      profile: targetUser.profile,
      membership,
      idCard: membership?.idCards[0] || null,
    };
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
