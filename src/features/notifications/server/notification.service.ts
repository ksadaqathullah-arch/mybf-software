import 'server-only';
import { db } from '@/server/db';
import type { NotificationChannel } from '@prisma/client';

export interface SendNotificationParams {
  userId: string;
  title: string;
  message: string;
  channel?: NotificationChannel;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Dispatch an in-app or multi-channel notification to a user
   */
  static async send(params: SendNotificationParams) {
    try {
      return await db.notification.create({
        data: {
          userId: params.userId,
          title: params.title,
          message: params.message,
          channel: params.channel || 'IN_APP',
          metadata: params.metadata || {},
        },
      });
    } catch (error) {
      console.error('[NotificationService.send] Error creating notification:', error);
      return null;
    }
  }

  /**
   * Dispatch notifications to multiple users (e.g. chapter leaders or district admins)
   */
  static async sendBatch(recipients: SendNotificationParams[]) {
    try {
      const data = recipients.map((r) => ({
        userId: r.userId,
        title: r.title,
        message: r.message,
        channel: r.channel || 'IN_APP',
        metadata: r.metadata || {},
      }));

      return await db.notification.createMany({ data });
    } catch (error) {
      console.error('[NotificationService.sendBatch] Error creating batch notifications:', error);
      return null;
    }
  }

  /**
   * Get paginated notifications for a user
   */
  static async getUserNotifications(userId: string, limit = 20) {
    return await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    return await db.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Mark all unread notifications as read
   */
  static async markAllAsRead(userId: string) {
    return await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
}
