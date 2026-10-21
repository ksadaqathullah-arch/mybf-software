import { IUseCase } from '../../common/use-case.interface';
import { INotificationRepository } from '../../ports/notification.repository.port';
import { AuthActor } from '@/server/auth/types';
import { UnauthorizedError } from '@/server/domain/common/domain-error';

export interface MarkNotificationReadInput {
  notificationId?: string;
  all?: boolean;
}

export class MarkNotificationReadUseCase implements IUseCase<MarkNotificationReadInput, { success: boolean }> {
  constructor(private readonly notificationRepo: INotificationRepository) {}

  public async execute(
    input: MarkNotificationReadInput,
    actor?: AuthActor
  ): Promise<{ success: boolean }> {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new UnauthorizedError('Active session required.');
    }

    if (input.all) {
      await this.notificationRepo.markAllAsRead(actor.userId);
    } else if (input.notificationId) {
      await this.notificationRepo.markAsRead(input.notificationId, actor.userId);
    }

    return { success: true };
  }
}
