import { IUseCase } from '../../common/use-case.interface';
import { INotificationRepository } from '../../ports/notification.repository.port';
import { AuthActor } from '@/server/auth/types';
import { UnauthorizedError } from '@/server/domain/common/domain-error';

export interface ListNotificationsInput {
  page?: number;
  pageSize?: number;
}

export class ListNotificationsUseCase implements IUseCase<ListNotificationsInput, { notifications: any[]; total: number; unreadCount: number }> {
  constructor(private readonly notificationRepo: INotificationRepository) {}

  public async execute(
    input: ListNotificationsInput,
    actor?: AuthActor
  ): Promise<{ notifications: any[]; total: number; unreadCount: number }> {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new UnauthorizedError('Active session required to fetch notifications.');
    }

    return this.notificationRepo.listByUser(
      actor.userId,
      input.page || 1,
      input.pageSize || 20
    );
  }
}
