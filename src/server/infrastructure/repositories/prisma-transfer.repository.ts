import { db } from '@/server/db';
import {
  ITransferRepository,
  TransferListFilter,
} from '../../application/ports/transfer.repository.port';
import {
  ChapterTransferEntity,
  ChapterTransferStatus,
} from '../../domain/identity/entities/chapter-transfer.entity';

export class PrismaTransferRepository implements ITransferRepository {
  public async findById(id: string): Promise<ChapterTransferEntity | null> {
    const record = await db.chapterTransfer.findUnique({
      where: { id },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  public async findActiveByProfileId(profileId: string): Promise<ChapterTransferEntity | null> {
    const record = await db.chapterTransfer.findFirst({
      where: {
        memberProfileId: profileId,
        status: { in: ['REQUESTED', 'CURRENT_APPROVED', 'DESTINATION_APPROVED'] },
      },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  public async save(transfer: ChapterTransferEntity): Promise<void> {
    const props = transfer.props;
    await db.chapterTransfer.upsert({
      where: { id: transfer.id },
      create: {
        id: transfer.id,
        memberProfileId: props.memberProfileId,
        fromChapterId: props.fromChapterId,
        toChapterId: props.toChapterId,
        status: props.status as any,
        reason: props.reason,
        currentReviewNotes: props.currentReviewNotes,
        currentReviewedAt: props.currentReviewedAt,
        destinationReviewNotes: props.destinationReviewNotes,
        destinationReviewedAt: props.destinationReviewedAt,
        districtReviewNotes: props.districtReviewNotes,
        districtReviewedAt: props.districtReviewedAt,
        rejectionReason: props.rejectionReason,
        requestedAt: props.requestedAt,
        completedAt: props.completedAt,
      },
      update: {
        status: props.status as any,
        currentReviewNotes: props.currentReviewNotes,
        currentReviewedAt: props.currentReviewedAt,
        destinationReviewNotes: props.destinationReviewNotes,
        destinationReviewedAt: props.destinationReviewedAt,
        districtReviewNotes: props.districtReviewNotes,
        districtReviewedAt: props.districtReviewedAt,
        rejectionReason: props.rejectionReason,
        completedAt: props.completedAt,
      },
    });
  }

  public async list(filter: TransferListFilter): Promise<{ transfers: any[]; total: number }> {
    const where: any = {};

    if (filter.chapterId) {
      if (filter.direction === 'OUTGOING') {
        where.fromChapterId = filter.chapterId;
      } else if (filter.direction === 'INCOMING') {
        where.toChapterId = filter.chapterId;
      } else {
        where.OR = [{ fromChapterId: filter.chapterId }, { toChapterId: filter.chapterId }];
      }
    }

    if (filter.status && filter.status !== 'ALL') {
      where.status = filter.status;
    }

    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;

    const [transfers, total] = await Promise.all([
      db.chapterTransfer.findMany({
        where,
        include: {
          fromChapter: true,
          toChapter: true,
          memberProfile: {
            include: {
              user: true,
              memberships: { where: { status: 'ACTIVE' }, take: 1 },
            },
          },
        },
        orderBy: { requestedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.chapterTransfer.count({ where }),
    ]);

    return { transfers, total };
  }

  public async executeAtomicTransfer(
    transferId: string,
    memberProfileId: string,
    newChapterId: string,
    notes: string,
    adminId: string
  ): Promise<void> {
    await db.$transaction(async (tx) => {
      // 1. Mark transfer completed
      await tx.chapterTransfer.update({
        where: { id: transferId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          districtReviewedAt: new Date(),
          districtReviewNotes: notes,
        },
      });

      // 2. Fetch current active chapter assignment
      const currentProfile = await tx.memberProfile.findUnique({
        where: { id: memberProfileId },
        select: { chapterId: true },
      });

      if (currentProfile) {
        // End existing history record
        await tx.memberChapterAssignmentHistory.updateMany({
          where: {
            memberProfileId,
            chapterId: currentProfile.chapterId,
            endedAt: null,
          },
          data: { endedAt: new Date() },
        });

        // Insert new assignment history
        await tx.memberChapterAssignmentHistory.create({
          data: {
            memberProfileId,
            chapterId: newChapterId,
            assignedAt: new Date(),
            reason: `Transfer finalized: ${notes}`,
          },
        });
      }

      // 3. Atomically update Member Profile & Active Membership
      await tx.memberProfile.update({
        where: { id: memberProfileId },
        data: { chapterId: newChapterId },
      });

      await tx.membership.updateMany({
        where: { memberProfileId, status: 'ACTIVE' },
        data: { chapterId: newChapterId },
      });
    });
  }

  private toEntity(record: any): ChapterTransferEntity {
    return new ChapterTransferEntity(
      record.id,
      {
        memberProfileId: record.memberProfileId,
        fromChapterId: record.fromChapterId,
        toChapterId: record.toChapterId,
        status: record.status as ChapterTransferStatus,
        reason: record.reason,
        currentReviewNotes: record.currentReviewNotes,
        currentReviewedAt: record.currentReviewedAt,
        currentReviewedById: record.currentReviewedById,
        destinationReviewNotes: record.destinationReviewNotes,
        destinationReviewedAt: record.destinationReviewedAt,
        destinationReviewedById: record.destinationReviewedById,
        districtReviewNotes: record.districtReviewNotes,
        districtReviewedAt: record.districtReviewedAt,
        districtReviewedById: record.districtReviewedById,
        rejectionReason: record.rejectionReason,
        requestedAt: record.requestedAt,
        completedAt: record.completedAt,
      },
      record.createdAt,
      record.updatedAt
    );
  }
}
