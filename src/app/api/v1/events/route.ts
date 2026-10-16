import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { EventService } from '@/features/events/server/event.service';
import { createEventSchema } from '@/features/events/schemas/event.schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || undefined;
    const chapterId = searchParams.get('chapterId') || undefined;
    const chapterSlug = searchParams.get('chapterSlug') || undefined;
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10) || 20;

    const result = await EventService.getEvents({
      scope,
      chapterId,
      chapterSlug,
      category,
      status,
      search,
      page,
      pageSize,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch events.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = createEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid event input.' },
        { status: 400 }
      );
    }

    const event = await EventService.createEvent(actor, parsed.data);

    return NextResponse.json(
      { success: true, event, message: 'Event created successfully.' },
      { status: 201 }
    );
  } catch (error: any) {
    const status = error.statusCode || 400;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create event.' },
      { status }
    );
  }
}
