import { IUseCase } from '../../common/use-case.interface';
import { ITransferRepository } from '../../ports/transfer.repository.port';
import { IAuditRepository } from '../../ports/audit.repository.port';
import { INotificationRepository } from '../../ports/notification.repository.port';
import { IMemberRepository } from '../../ports/member.repository.port';
import { NotificationEntity } from '@/server/domain/notifications/entities/notification.entity';
import { AuthActor } from '@/server/auth/types';
import {
  UnauthorizedError,
  DomainRuleViolationError,
  EntityNotFoundError,
} from '@/server/domain/common/domain-error';
import crypto from 'crypto';

export interface ReviewChapterTransferInput {
  transferId: string;
  stage: 'CURRENT_CHAPTER' | 'DESTINATION_CHAPTER' | 'DISTRICT_ADMIN';
  decision: 'APPROVE' | 'REJECT';
  notes?: string;
}

export class ReviewChapterTransferUseCase implements IUseCase<ReviewChapterTransferInput, { success: boolean; message: string; newStatus: string }> {
  constructor(
    private readonly transferRepo: ITransferRepository,
    private readonly memberRepo: IMemberRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly auditRepo: IAuditRepository
  ) {}

  public async execute(
    input: ReviewChapterTransferInput,
    actor?: AuthActor
  ): Promise<{ success: boolean; message: string; newStatus: string }> {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new UnauthorizedError();
    }

    const transfer = await this.transferRepo.findById(input.transferId);
    if (!transfer) {
      throw new EntityNotFoundError('ChapterTransfer', input.transferId);
    }

    const isSuperAdmin = actor.roles.includes('SUPER_ADMIN');
    const isDistrictAdmin = actor.roles.includes('DISTRICT_ADMIN');
    const isChapterOfficer = actor.roles.some((r) =>
      ['CHAPTER_PRESIDENT', 'CHAPTER_SECRETARY', 'CHAPTER_TREASURER', 'CHAPTER_OFFICER'].includes(r)
    );

    const notes = input.notes || (input.decision === 'APPROVE' ? 'Approved by leadership.' : 'Rejected by leadership.');

    if (input.stage === 'CURRENT_CHAPTER') {
      if (!isSuperAdmin && !isDistrictAdmin) {
        if (!isChapterOfficer || actor.chapterId !== transfer.props.fromChapterId) {
          throw new DomainRuleViolationError('Forbidden: Only current chapter leadership can review outgoing transfers.');
        }
      }
      transfer.recommendByOriginChapter(actor.userId, input.decision === 'APPROVE', notes);
    } else if (input.stage === 'DESTINATION_CHAPTER') {
      if (!isSuperAdmin && !isDistrictAdmin) {
        if (!isChapterOfficer || actor.chapterId !== transfer.props.toChapterId) {
          throw new DomainRuleViolationError('Forbidden: Only destination chapter leadership can review incoming transfers.');
        }
      }
      transfer.recommendByDestinationChapter(actor.userId, input.decision === 'APPROVE', notes);
    } else if (input.stage === 'DISTRICT_ADMIN') {
      if (!isSuperAdmin && !isDistrictAdmin) {
        throw new DomainRuleViolationError('Forbidden: Only District Administrators can grant final transfer completion.');
      }
      if (input.decision === 'APPROVE') {
        // Atomic transfer completion
        await this.transferRepo.executeAtomicTransfer(
          transfer.id,
          transfer.props.memberProfileId,
          transfer.props.toChapterId,
          notes,
          actor.userId
        );
      }
      transfer.finalizeByDistrictAdmin(actor.userId, input.decision === 'APPROVE', notes);
    }

    if (input.stage !== 'DISTRICT_ADMIN' || input.decision === 'REJECT') {
      await this.transferRepo.save(transfer);
    }

    await this.auditRepo.log({
      action: `CHAPTER_TRANSFER_${input.stage}_${input.decision}`,
      entityType: 'ChapterTransfer',
      entityId: transfer.id,
      actorId: actor.userId,
      payload: { stage: input.stage, decision: input.decision, notes: input.notes },
    });

    return {
      success: true,
      message: `Transfer successfully ${input.decision === 'APPROVE' ? 'approved' : 'rejected'} for stage ${input.stage}.`,
      newStatus: transfer.props.status,
    };
  }
}
