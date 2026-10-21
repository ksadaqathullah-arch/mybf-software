import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { container } from '@/server/container';
import { ApiResponse } from '@/server/presentation/http-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return ApiResponse.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await container.listNotifications.execute({ pageSize: limit }, actor);
    return ApiResponse.ok({
      notifications: result.notifications,
      total: result.total,
      unreadCount: result.unreadCount,
    });
  } catch (error: any) {
    return ApiResponse.handle(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return ApiResponse.unauthorized();
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    if (!markAll && !notificationId) {
      return ApiResponse.badRequest('Expected notificationId or markAll flag.');
    }

    const result = await container.markNotificationRead.execute(
      { notificationId, all: !!markAll },
      actor
    );
    return ApiResponse.ok(result);
  } catch (error: any) {
    return ApiResponse.handle(error);
  }
}
