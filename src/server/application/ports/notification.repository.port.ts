import { NotificationEntity } from '../../domain/notifications/entities/notification.entity';

export interface INotificationRepository {
  create(notification: NotificationEntity): Promise<void>;
  createBatch(notifications: NotificationEntity[]): Promise<void>;
  listByUser(
    userId: string,
    page?: number,
    pageSize?: number
  ): Promise<{ notifications: any[]; total: number; unreadCount: number }>;
  markAsRead(id: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}
