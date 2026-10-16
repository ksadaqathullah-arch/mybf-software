import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { db } from '@/server/db';

export async function GET(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get('userId');

    let targetUserId: string | null = actor?.userId ?? queryUserId ?? null;

    if (!targetUserId) {
      // Find latest active member for demo/testing
      const activeUser = await db.user.findFirst({
        where: { status: 'ACTIVE' },
      });
      targetUserId = activeUser?.id ?? null;
    }

    if (!targetUserId) {
      return NextResponse.json({ success: true, tickets: [] });
    }

    const registrations = await db.eventRegistration.findMany({
      where: { userId: targetUserId },
      include: {
        event: {
          include: {
            chapter: { select: { id: true, name: true, slug: true } },
          },
        },
        attendance: true,
      },
      orderBy: { registeredAt: 'desc' },
    });

    const tickets = registrations.map((reg) => ({
      id: reg.id,
      ticketCode: reg.qrToken,
      status: reg.status,
      registeredAt: reg.registeredAt.toISOString(),
      checkedIn: Boolean(reg.attendance),
      checkedInAt: reg.attendance?.scannedAt.toISOString() ?? null,
      event: {
        id: reg.event.id,
        title: reg.event.title,
        slug: reg.event.slug,
        category: reg.event.category,
        venueName: reg.event.venueName,
        venueAddress: reg.event.venueAddress,
        startsAt: reg.event.startsAt.toISOString(),
        endsAt: reg.event.endsAt.toISOString(),
        chapterName: reg.event.chapter?.name ?? 'District Level Event',
        basePriceINR: reg.event.basePriceINR,
      },
    }));

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
