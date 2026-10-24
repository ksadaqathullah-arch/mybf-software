import 'server-only';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { db } from './db';
import type { AuthActor } from './types';
import type {
  SuperAdminApplicationReviewInput,
  SuperAdminAgeExceptionReviewInput,
} from './admin-schemas';
import { calculateAge } from '@/constants/youth-discovery';
import { formatMemberId } from '@/lib/utils';

const SIGNING_SECRET =
  process.env.ID_CARD_SIGNING_SECRET ||
  'mybf-id-card-qr-hmac-sha256-verification-secret-production';

function generateVerificationToken(membershipNumber: string, cardVersion: number): string {
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${membershipNumber}:${cardVersion}:${nonce}`;
  const hmac = crypto.createHmac('sha256', SIGNING_SECRET).update(payload).digest('hex');
  return `${nonce}.${hmac}`;
}

async function resolveAuditActorId(tx: any, userId: string) {
  const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
  return user ? user.id : null;
}

export class MembershipService {
  /**
   * Super Admin Applications Queue
   * Retrieves pending membership applications (SUBMITTED and UNDER_REVIEW).
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
        const lastMembership = await tx.membership.findFirst({
          orderBy: { sequenceNumber: 'desc' },
          select: { sequenceNumber: true },
        });
        const nextSequence = lastMembership ? Number(lastMembership.sequenceNumber) + 1 : 1;
        const membershipNumber = formatMemberId(nextSequence);

        const validUntil = new Date();
        validUntil.setFullYear(validUntil.getFullYear() + 5);

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

        await tx.user.update({
          where: { id: application.userId },
          data: {
            status: 'ACTIVE',
            emailVerified: new Date(),
          },
        });

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

        const updatedPayload = {
          ...payload,
          superAdminApproval: {
            approvedBy: actor.userId,
            approvedAt: new Date().toISOString(),
            reason: input.reason,
            membershipNumber,
          },
        };

        await tx.membershipApplication.update({
          where: { id: input.applicationId },
          data: {
            status: 'APPROVED',
            reviewedById: actor.userId,
            reviewedAt: new Date(),
            reviewNotes: `Approved by Super Admin: ${input.reason}`,
            payloadJson: updatedPayload as unknown as Prisma.InputJsonValue,
          },
        });

        await tx.membershipApprovalAction.create({
          data: {
            applicationId: input.applicationId,
            actorId: actor.userId,
            previousStatus: application.status,
            newStatus: 'APPROVED',
            reason: input.reason,
          },
        });

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

        return {
          status: 'APPROVED',
          membershipNumber,
        };
      } else {
        const updatedPayload = {
          ...payload,
          superAdminRejection: {
            rejectedBy: actor.userId,
            rejectedAt: new Date().toISOString(),
            reason: input.reason,
          },
        };

        await tx.membershipApplication.update({
          where: { id: input.applicationId },
          data: {
            status: 'REJECTED',
            reviewedById: actor.userId,
            reviewedAt: new Date(),
            rejectionReason: input.reason,
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
            diffJson: { reason: input.reason, applicantUserId: application.userId },
          },
        });

        return {
          status: 'REJECTED',
          membershipNumber: null,
        };
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
   * Super Admin review of age exceptions
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
            status: 'SUBMITTED',
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
}
