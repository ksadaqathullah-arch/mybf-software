import { db } from '@/server/db';
import { INotificationRepository } from '../../application/ports/notification.repository.port';
import { NotificationEntity } from '../../domain/notifications/entities/notification.entity';

export class PrismaNotificationRepository implements INotificationRepository {
  public async create(notification: NotificationEntity): Promise<void> {
    const props = notification.props;
    await db.notification.create({
      data: {
        id: notification.id,
        userId: props.userId,
        title: props.title,
        message: props.message,
        metadata: (props.metadata as any) ?? {},
        readAt: props.readAt ?? null,
        isRead: !!props.readAt,
      },
    });
  }

  public async createBatch(notifications: NotificationEntity[]): Promise<void> {
    if (notifications.length === 0) return;
    await db.notification.createMany({
      data: notifications.map((n) => ({
        id: n.id,
        userId: n.props.userId,
        title: n.props.title,
        message: n.props.message,
        metadata: (n.props.metadata as any) ?? {},
        readAt: n.props.readAt ?? null,
        isRead: !!n.props.readAt,
      })),
    });
  }

  public async listByUser(
    userId: string,
    page = 1,
    pageSize = 20
  ): Promise<{ notifications: any[]; total: number; unreadCount: number }> {
    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.notification.count({ where: { userId } }),
      db.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount };
  }

  public async markAsRead(id: string, userId: string): Promise<void> {
    await db.notification.updateMany({
      where: { id, userId, isRead: false },
      data: { readAt: new Date(), isRead: true },
    });
  }

  public async markAllAsRead(userId: string): Promise<void> {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { readAt: new Date(), isRead: true },
    });
  }
}
