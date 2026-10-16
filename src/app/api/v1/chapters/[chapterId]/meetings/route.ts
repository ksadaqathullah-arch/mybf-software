import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { db } from '@/server/db';
import { ChapterService } from '@/features/chapters/server/chapter.service';
import { MeetingType } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const actor = await getCurrentActor();
    if (!actor) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const chapter = await db.chapter.findFirst({
      where: {
        OR: [{ slug: chapterId.toLowerCase() }, { id: chapterId }],
      },
    });

    if (!chapter) {
      return NextResponse.json({ success: false, error: 'Chapter not found' }, { status: 404 });
    }

    const meetings = await ChapterService.getChapterMeetings(actor, chapter.id);
    return NextResponse.json({ success: true, meetings });
  } catch (error: any) {
    const statusCode = error.statusCode || (error.message?.includes('Forbidden') ? 403 : 400);
    return NextResponse.json({ success: false, error: error.message }, { status: statusCode });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const actor = await getCurrentActor();
    if (!actor) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const chapter = await db.chapter.findFirst({
      where: {
        OR: [{ slug: chapterId.toLowerCase() }, { id: chapterId }],
      },
    });

    if (!chapter) {
      return NextResponse.json({ success: false, error: 'Chapter not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, type, date, time, venue, agenda, coordinatorName } = body;

    if (!title || !date || !time || !venue) {
      return NextResponse.json(
        { success: false, error: 'Title, date, time, and venue are required.' },
        { status: 422 }
      );
    }

    const scheduledAt = new Date(`${date}T${time}:00`);
    if (isNaN(scheduledAt.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid meeting date or time.' },
        { status: 422 }
      );
    }

    const validTypes: MeetingType[] = ['CHAPTER_EXECUTIVE', 'GENERAL_BODY', 'CORE_COMMITTEE'];
    const meetingType = validTypes.includes(type) ? type : 'CHAPTER_EXECUTIVE';

    const meeting = await ChapterService.scheduleMeeting(actor, chapter.id, {
      title,
      type: meetingType,
      scheduledAt,
      venue,
      agenda,
      coordinatorName,
    });

    return NextResponse.json({ success: true, meeting });
  } catch (error: any) {
    const statusCode = error.statusCode || (error.message?.includes('Forbidden') ? 403 : 400);
    return NextResponse.json({ success: false, error: error.message }, { status: statusCode });
  }
}
