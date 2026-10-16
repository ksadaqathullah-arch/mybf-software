import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { EventService } from '@/features/events/server/event.service';

export async function GET(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID parameter required.' },
        { status: 400 }
      );
    }

    const { event, attendees } = await EventService.getEventAttendanceRoster(actor, eventId);

    // CSV headers
    const headers = [
      'Ticket Code',
      'Delegate Full Name',
      'Email Address',
      'Phone Number',
      'Member Category',
      'Current Position',
      'Ticket Tier',
      'Ticket Price (INR)',
      'Registration Status',
      'Registered Date',
      'Admitted / Checked In',
      'Check-in Timestamp',
    ];

    // Escape and prevent formula injection
    const sanitize = (val: string | number | null | undefined) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      const safeStr = str.replace(/^[+=@-]/, "'$&");
      return `"${safeStr}"`;
    };

    const rows = attendees.map((a) => [
      sanitize(a.qrToken),
      sanitize(a.user.fullName),
      sanitize(a.user.email),
      sanitize(a.user.phone),
      sanitize(a.user.category),
      sanitize(a.user.position),
      sanitize(a.ticketTierName),
      a.ticketPriceINR,
      sanitize(a.status),
      sanitize(a.registeredAt.split('T')[0]),
      sanitize(a.isCheckedIn ? 'YES' : 'NO'),
      sanitize(a.checkedInAt || 'N/A'),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const filename = `MYBF_Event_Roster_${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to export event roster.' },
      { status }
    );
  }
}
