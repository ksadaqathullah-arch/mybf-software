import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { EventService } from '@/features/events/server/event.service';
import { db } from '@/server/db';

export async function GET(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get('userId');

    let targetUserId: string | null = actor?.userId ?? queryUserId ?? null;

    if (!targetUserId) {
      // Find latest active member for demo/testing fallback
      const activeUser = await db.user.findFirst({
        where: { status: 'ACTIVE' },
      });
      targetUserId = activeUser?.id ?? null;
    }

    if (!targetUserId) {
      return NextResponse.json({ success: true, tickets: [] });
    }

    const tickets = await EventService.getUserTickets(targetUserId);

    return NextResponse.json({
      success: true,
      tickets,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tickets.' },
      { status: 500 }
    );
  }
}
