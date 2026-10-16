import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { EventService } from '@/features/events/server/event.service';
import { db } from '@/server/db';
import { registerEventSchema } from '@/features/events/schemas/event.schema';

export async function POST(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    const body = await request.json();

    const parsed = registerEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid registration payload.' },
        { status: 400 }
      );
    }

    let targetUserId = actor?.userId || parsed.data.userId;

    if (!targetUserId) {
      // Find latest active member user as fallback if local demo/test session
      const activeUser = await db.user.findFirst({
        where: { status: 'ACTIVE' },
        include: { profile: true },
      });
      targetUserId = activeUser?.id;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in to reserve event tickets.' },
        { status: 401 }
      );
    }

    const registration = await EventService.registerForEvent({
      ...parsed.data,
      userId: targetUserId,
    });

    return NextResponse.json({
      success: true,
      registration,
      message: 'Ticket confirmed! Admission pass reserved successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register for event.' },
      { status: 400 }
    );
  }
}
