import { IUseCase } from '../../common/use-case.interface';
import { ITransferRepository } from '../../ports/transfer.repository.port';
import { IMemberRepository } from '../../ports/member.repository.port';
import { IChapterRepository } from '../../ports/chapter.repository.port';
import { INotificationRepository } from '../../ports/notification.repository.port';
import { IAuditRepository } from '../../ports/audit.repository.port';
import { ChapterTransferEntity } from '@/server/domain/identity/entities/chapter-transfer.entity';
import { NotificationEntity } from '@/server/domain/notifications/entities/notification.entity';
import { AuthActor } from '@/server/auth/types';
import { assertAuthorized } from '@/server/auth/policy';
import {
  UnauthorizedError,
  DomainRuleViolationError,
  ConflictError,
  EntityNotFoundError,
} from '@/server/domain/common/domain-error';
import crypto from 'crypto';

export interface RequestChapterTransferInput {
  toChapterId: string;
  reason: string;
}

export class RequestChapterTransferUseCase implements IUseCase<RequestChapterTransferInput, { success: boolean; message: string; transferId: string }> {
  constructor(
    private readonly transferRepo: ITransferRepository,
    private readonly memberRepo: IMemberRepository,
    private readonly chapterRepo: IChapterRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly auditRepo: IAuditRepository
  ) {}

  public async execute(
    input: RequestChapterTransferInput,
    actor?: AuthActor
  ): Promise<{ success: boolean; message: string; transferId: string }> {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new UnauthorizedError();
    }

    assertAuthorized({
      actor,
      action: 'member.update_own',
      resource: 'membership',
      recordOwnerId: actor.userId,
    });

    const member = await this.memberRepo.findByUserId(actor.userId);
    if (!member) {
      throw new EntityNotFoundError('MemberProfile', actor.userId);
    }

    const targetChapter = await this.chapterRepo.resolve(input.toChapterId);
    if (!targetChapter) {
      throw new EntityNotFoundError('Chapter', input.toChapterId);
    }

    if (member.props.chapterId === targetChapter.id) {
      throw new DomainRuleViolationError('You are already assigned to this chapter.');
    }

    // Check existing pending transfer
    const activeTransfer = await this.transferRepo.findActiveByProfileId(member.id);
    if (activeTransfer) {
      throw new ConflictError('You already have an active pending chapter transfer request.');
    }

    const transfer = ChapterTransferEntity.create(
      crypto.randomUUID(),
      member.id,
      member.props.chapterId,
      targetChapter.id,
      input.reason
    );

    await this.transferRepo.save(transfer);

    const notification = NotificationEntity.create(crypto.randomUUID(), {
      userId: actor.userId,
      type: 'CHAPTER_TRANSFER_SUBMITTED',
      title: 'Chapter Transfer Submitted',
      message: `Your request to transfer to ${targetChapter.props.name} Chapter has been submitted for leadership review.`,
      metadata: { transferId: transfer.id, toChapterId: targetChapter.id },
    });
    await this.notificationRepo.create(notification);

    await this.auditRepo.log({
      action: 'CHAPTER_TRANSFER_REQUESTED',
      entityType: 'ChapterTransfer',
      entityId: transfer.id,
      actorId: actor.userId,
      payload: {
        fromChapterId: member.props.chapterId,
        toChapterId: targetChapter.id,
        reason: input.reason,
      },
    });

    return {
      success: true,
      message: `Chapter transfer request successfully lodged for ${targetChapter.props.name} chapter.`,
      transferId: transfer.id,
    };
  }
}
