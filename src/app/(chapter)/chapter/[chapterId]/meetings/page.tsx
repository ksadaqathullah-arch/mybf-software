import { notFound } from 'next/navigation';
import { getCurrentActor } from '@/server/auth/session';
import { ChapterService } from '@/features/chapters/server/chapter.service';
import { ChapterAccessDenied } from '@/features/chapters/components/chapter-access-denied';
import { ChapterMeetingsView } from '@/features/chapters/components/chapter-meetings-view';
import { ScheduleMeetingDialog } from '@/features/chapters/components/schedule-meeting-dialog';
import { db } from '@/server/db';

interface MeetingsPageProps {
  params: Promise<{
    chapterId: string;
  }>;
}

export default async function ChapterMeetingsPage({ params }: MeetingsPageProps) {
  const { chapterId: rawChapterId } = await params;
  const actor = await getCurrentActor();

  const chapter = await ChapterService.getChapterBySlugOrId(rawChapterId);
  if (!chapter) {
    notFound();
  }

  // Authorize: Chapter Leadership or Super Admin
  const isSuperAdmin = actor?.roles.includes('SUPER_ADMIN');
  const isChapterAuthorized = actor && (isSuperAdmin || actor.chapterId === chapter.id);

  if (!actor || !isChapterAuthorized) {
    return null;
  }

  // Fetch actual chapter meetings with minutes and action items
  const rawMeetings = await ChapterService.getChapterMeetings(actor, chapter.id);

  const initialMeetings = rawMeetings.map((m) => ({
    id: m.id,
    title: m.title,
    type: m.type,
    scheduledAt: m.scheduledAt.toISOString(),
    venue: m.venue,
    agenda: m.agenda,
    minutes: m.minutes
      ? {
          summary: m.minutes.summary,
          decisions: m.minutes.decisions,
        }
      : null,
    actionItems: m.actionItems.map((ai) => ({
      id: ai.id,
      title: ai.title,
      assigneeName: ai.assigneeName,
      dueDate: ai.dueDate.toISOString(),
      status: ai.status,
    })),
  }));

  // Fetch chapter events
  const rawEvents = await db.event.findMany({
    where: { chapterId: chapter.id },
    orderBy: { startsAt: 'asc' },
    take: 10,
  });

  const events = rawEvents.map((e) => ({
    id: e.id,
    title: e.title,
    category: e.category,
    startsAt: e.startsAt.toISOString(),
    venueName: e.venueName,
    capacity: e.capacity,
    registeredCount: e.registeredCount,
    status: e.status,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#035AFC]/10 text-[#035AFC]">
              {chapter.code}
            </span>
            <span className="text-xs text-slate-500 font-medium">Chapter Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Activities & Meetings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Schedule executive meetups, track agenda items, record minutes, and manage chapter action items for {chapter.name}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ScheduleMeetingDialog chapterSlug={chapter.slug} chapterName={chapter.name} />
        </div>
      </div>

      {/* Main Meetings and Activities View */}
      <ChapterMeetingsView
        initialMeetings={initialMeetings}
        events={events}
        chapterSlug={chapter.slug}
        chapterName={chapter.name}
      />
    </div>
  );
}
