import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { EventService } from '@/features/events/server/event.service';
import { checkInAttendeeSchema } from '@/features/events/schemas/event.schema';

export async function POST(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required to perform attendee check-in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = checkInAttendeeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid check-in payload.' },
        { status: 400 }
      );
    }

    const result = await EventService.checkInAttendee(actor, parsed.data);

    return NextResponse.json(result);
  } catch (error: any) {
    const status = error.statusCode || 400;
    return NextResponse.json(
      { success: false, error: error.message || 'Check-in failed.' },
      { status }
    );
  }
}
