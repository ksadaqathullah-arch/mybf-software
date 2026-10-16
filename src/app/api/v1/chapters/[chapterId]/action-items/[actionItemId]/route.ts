import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { ChapterService } from '@/features/chapters/server/chapter.service';
import { ActionItemStatus } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string; actionItemId: string }> }
) {
  try {
    const { chapterId: rawChapterId, actionItemId } = await params;
    const actor = await getCurrentActor();

    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chapter = await ChapterService.getChapterBySlugOrId(rawChapterId);
    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses: ActionItemStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be PENDING, IN_PROGRESS, or COMPLETED.' },
        { status: 400 }
      );
    }

    const updated = await ChapterService.updateActionItemStatus(
      actor,
      chapter.id,
      actionItemId,
      status as ActionItemStatus
    );

    return NextResponse.json({
      success: true,
      actionItem: updated,
    });
  } catch (error: any) {
    const status = error.message?.includes('Unauthorized') || error.message?.includes('Forbidden') ? 403 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to update action item status' },
      { status }
    );
  }
}
