import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { NotificationService } from '@/features/notifications/server/notification.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active session required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const notifications = await NotificationService.getUserNotifications(actor.userId, limit);
    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active session required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await NotificationService.markAllAsRead(actor.userId);
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      await NotificationService.markAsRead(notificationId, actor.userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Expected notificationId or markAll flag.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update notifications.' },
      { status: 500 }
    );
  }
}
