import 'server-only';
import { Prisma, TransferStatus, CorrectionRequestStatus } from '@prisma/client';
import { db } from './db';
import type { AuthActor } from './types';
import type { SuperAdminTransferOverrideInput } from './admin-schemas';

export class GovernanceService {
  /**
   * Aggregate governance metrics for super admin dashboard
   */
  static async getGovernanceMetrics(actor: AuthActor) {
    if (!actor || !actor.roles.includes('SUPER_ADMIN')) {
      throw new Error('Forbidden: Super Administrator credentials required.');
    }

    const [
      pendingCorrections,
      pendingTransfers,
      awaitingChapterReview,
      completedTransfers,
      rejectedTransfers,
      recentAuditLogs,
    ] = await Promise.all([
      db.profileCorrectionRequest.count({ where: { status: 'PENDING' } }),
      db.chapterTransfer.count({ where: { status: 'DESTINATION_APPROVED' } }),
      db.chapterTransfer.count({ where: { status: { in: ['REQUESTED', 'CURRENT_APPROVED'] } } }),
      db.chapterTransfer.count({ where: { status: 'COMPLETED' } }),
      db.chapterTransfer.count({ where: { status: 'REJECTED' } }),
      db.auditEvent.findMany({
        where: {
          action: {
            in: [
              'CHAPTER_TRANSFER_REQUESTED',
              'CHAPTER_TRANSFER_RECOMMENDATION_RECOMMEND_APPROVAL',
              'CHAPTER_TRANSFER_APPROVED_AND_EXECUTED',
              'CHAPTER_TRANSFER_REJECTED_BY_DISTRICT',
              'IDENTITY_CORRECTION_REQUESTED',
              'IDENTITY_CORRECTION_APPROVED',
              'IDENTITY_CORRECTION_REJECTED',
              'PHONE_NUMBER_VERIFIED_AND_CHANGED',
              'EMAIL_VERIFIED_AND_CHANGED',
            ],
          },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      pendingCorrections,
      pendingTransfers,
      awaitingChapterReview,
      completedTransfers,
      rejectedTransfers,
      recentAuditLogs: recentAuditLogs.map((l) => ({
        id: l.id,
        action: l.action,
        resource: l.resource,
        actorEmail: l.actorEmail || 'System',
        createdAt: l.createdAt.toISOString(),
        diffJson: l.diffJson,
      })),
    };
  }

  /**
   * Super Admin Chapter Transfers Query
   */
  static async getChapterTransfers(
    actor: AuthActor,
    filters?: {
      status?: TransferStatus;
      chapterId?: string;
      page?: number;
      pageSize?: number;
    }
  ) {
    if (!actor || !actor.roles.includes('SUPER_ADMIN')) {
      throw new Error('Forbidden: Super Administrator credentials required.');
    }

    const page = Math.max(1, filters?.page || 1);
    const pageSize = Math.min(100, Math.max(10, filters?.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const where: Prisma.ChapterTransferWhereInput = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.chapterId && filters.chapterId !== 'ALL') {
      where.OR = [{ fromChapterId: filters.chapterId }, { toChapterId: filters.chapterId }];
    }

    const [total, transfers] = await Promise.all([
      db.chapterTransfer.count({ where }),
      db.chapterTransfer.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { requestedAt: 'desc' },
        include: {
          fromChapter: { select: { id: true, name: true, code: true, slug: true } },
          toChapter: { select: { id: true, name: true, code: true, slug: true } },
          memberProfile: {
            select: {
              id: true,
              fullName: true,
              primaryPhone: true,
              email: true,
              taluk: true,
              memberships: {
                where: { status: 'ACTIVE' },
                select: { membershipNumber: true },
                take: 1,
              },
            },
          },
        },
      }),
    ]);

    return {
      transfers: transfers.map((t) => ({
        id: t.id,
        memberProfileId: t.memberProfileId,
        memberName: t.memberProfile.fullName,
        memberPhone: t.memberProfile.primaryPhone,
        memberEmail: t.memberProfile.email,
        membershipNumber: t.memberProfile.memberships[0]?.membershipNumber || 'N/A',
        memberTaluk: t.memberProfile.taluk || 'Malappuram',
        fromChapter: t.fromChapter,
        toChapter: t.toChapter,
        status: t.status,
        reason: t.reason,
        currentReviewNotes: t.currentReviewNotes,
        destinationReviewNotes: t.destinationReviewNotes,
        districtReviewNotes: t.districtReviewNotes,
        requestedAt: t.requestedAt.toISOString(),
        currentReviewedAt: t.currentReviewedAt ? t.currentReviewedAt.toISOString() : null,
        destinationReviewedAt: t.destinationReviewedAt ? t.destinationReviewedAt.toISOString() : null,
        districtReviewedAt: t.districtReviewedAt ? t.districtReviewedAt.toISOString() : null,
        completedAt: t.completedAt ? t.completedAt.toISOString() : null,
        rejectionReason: t.rejectionReason,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  /**
   * Super Admin Correction Requests Query
   */
  static async getCorrectionRequests(
    actor: AuthActor,
    filters?: {
      status?: CorrectionRequestStatus;
      page?: number;
      pageSize?: number;
    }
  ) {
    if (!actor || !actor.roles.includes('SUPER_ADMIN')) {
      throw new Error('Forbidden: Super Administrator credentials required.');
    }

    const page = Math.max(1, filters?.page || 1);
    const pageSize = Math.min(100, Math.max(10, filters?.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProfileCorrectionRequestWhereInput = {};
    if (filters?.status) where.status = filters.status;

    const [total, requests] = await Promise.all([
      db.profileCorrectionRequest.count({ where }),
      db.profileCorrectionRequest.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          memberProfile: {
            include: {
              chapter: { select: { id: true, name: true, code: true } },
              memberships: {
                where: { status: 'ACTIVE' },
                select: { membershipNumber: true },
                take: 1,
              },
            },
          },
        },
      }),
    ]);

    return {
      requests: requests.map((r) => ({
        id: r.id,
        memberProfileId: r.memberProfileId,
        memberName: r.memberProfile.fullName,
        memberPhone: r.memberProfile.primaryPhone,
        memberEmail: r.memberProfile.email,
        membershipNumber: r.memberProfile.memberships[0]?.membershipNumber || 'N/A',
        chapterName: r.memberProfile.chapter.name,
        field: r.field,
        oldValue: r.oldValue,
        requestedValue: r.requestedValue,
        reason: r.reason,
        documentUrl: r.documentUrl,
        status: r.status,
        reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  /**
   * Super Admin Executive Override on Chapter Transfers
   */
  static async superAdminOverrideTransfer(
    actor: AuthActor,
    input: SuperAdminTransferOverrideInput
  ) {
    if (!actor || !actor.roles.includes('SUPER_ADMIN')) {
      throw new Error('Forbidden: Super Administrator credentials required for governance overrides.');
    }

    return await db.$transaction(async (tx) => {
      const transfer = await tx.chapterTransfer.findUnique({
        where: { id: input.transferId },
        include: { memberProfile: true, toChapter: true },
      });

      if (!transfer) {
        throw new Error('Chapter transfer request not found.');
      }

      if (input.action === 'FORCE_APPROVE') {
        // Update member profile chapter assignment
        await tx.memberProfile.update({
          where: { id: transfer.memberProfileId },
          data: { chapterId: transfer.toChapterId },
        });

        // Update active membership chapter assignment
        await tx.membership.updateMany({
          where: { memberProfileId: transfer.memberProfileId, status: 'ACTIVE' },
          data: { chapterId: transfer.toChapterId },
        });

        const completed = await tx.chapterTransfer.update({
          where: { id: input.transferId },
          data: {
            status: 'COMPLETED',
            districtReviewedAt: new Date(),
            districtReviewNotes: `[SUPER ADMIN OVERRIDE] ${input.justification}`,
            completedAt: new Date(),
          },
        });

        await tx.auditEvent.create({
          data: {
            actorId: actor.userId,
            actorEmail: actor.email,
            action: 'SUPER_ADMIN_TRANSFER_FORCE_APPROVED',
            resource: 'ChapterTransfer',
            resourceId: input.transferId,
            diffJson: { justification: input.justification, newChapterId: transfer.toChapterId },
          },
        });

        return completed;
      }

      if (input.action === 'FORCE_REJECT') {
        const rejected = await tx.chapterTransfer.update({
          where: { id: input.transferId },
          data: {
            status: 'REJECTED',
            districtReviewedAt: new Date(),
            districtReviewNotes: `[SUPER ADMIN OVERRIDE] ${input.justification}`,
            rejectionReason: input.justification,
          },
        });

        await tx.auditEvent.create({
          data: {
            actorId: actor.userId,
            actorEmail: actor.email,
            action: 'SUPER_ADMIN_TRANSFER_FORCE_REJECTED',
            resource: 'ChapterTransfer',
            resourceId: input.transferId,
            diffJson: { justification: input.justification },
          },
        });

        return rejected;
      }

      // RESET TO PENDING
      const reset = await tx.chapterTransfer.update({
        where: { id: input.transferId },
        data: {
          status: 'REQUESTED',
          rejectionReason: null,
          districtReviewNotes: `[Reset by Super Admin] ${input.justification}`,
        },
      });

      await tx.auditEvent.create({
        data: {
          actorId: actor.userId,
          actorEmail: actor.email,
          action: 'SUPER_ADMIN_TRANSFER_RESET',
          resource: 'ChapterTransfer',
          resourceId: input.transferId,
          diffJson: { justification: input.justification },
        },
      });

      return reset;
    });
  }
}
