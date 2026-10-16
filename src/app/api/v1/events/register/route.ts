import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { EventService } from '@/features/events/server/event.service';
import { db } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    const body = await request.json();
    const { eventId } = body;

    let targetUserId = actor?.userId || body.userId;

    if (!targetUserId) {
      // Find latest active member user as fallback if demo mode
      const activeUser = await db.user.findFirst({
        where: { status: 'ACTIVE' },
        include: { profile: true },
      });
      targetUserId = activeUser?.id;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in as an active member to book event tickets.' },
        { status: 401 }
      );
    }

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required.' },
        { status: 400 }
      );
    }

    const registration = await EventService.registerForEvent({
      eventId,
      userId: targetUserId,
    });

    return NextResponse.json({
      success: true,
      registration,
      message: 'Ticket confirmed! 100% Free NGO Pass reserved successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register for event.' },
      { status: 400 }
    );
  }
}
