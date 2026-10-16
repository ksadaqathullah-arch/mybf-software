import { notFound } from 'next/navigation';
import { getCurrentActor } from '@/server/auth/session';
import { ChapterService } from '@/features/chapters/server/chapter.service';
import { ChapterAccessDenied } from '@/features/chapters/components/chapter-access-denied';
import { ChapterEventsView } from '@/features/chapters/components/chapter-events-view';
import { db } from '@/server/db';

interface ChapterEventsPageProps {
  params: Promise<{
    chapterId: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ChapterEventsPage({ params }: ChapterEventsPageProps) {
  const { chapterId: rawChapterId } = await params;
  const actor = await getCurrentActor();

  const chapter = await ChapterService.getChapterBySlugOrId(rawChapterId);
  if (!chapter) {
    notFound();
  }

  // Authorize: Chapter Leadership, District Admin, or Super Admin
  const isSuperAdmin = actor?.roles.includes('SUPER_ADMIN');
  const isDistrictAdmin = actor?.roles.includes('DISTRICT_ADMIN');
  const isChapterAuthorized =
    actor && (isSuperAdmin || isDistrictAdmin || actor.chapterId === chapter.id);

  if (!actor || !isChapterAuthorized) {
    return (
      <ChapterAccessDenied
        chapterName={chapter.name}
        reason={`Cross-Chapter Access Denied: You are not authorized to view or manage events for ${chapter.name}.`}
      />
    );
  }

  // Fetch chapter events
  const rawEvents = await db.event.findMany({
    where: { chapterId: chapter.id },
    orderBy: { startsAt: 'desc' },
  });

  const events = rawEvents.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    category: e.category,
    description: e.description,
    venueName: e.venueName,
    venueAddress: e.venueAddress,
    eventType: e.eventType,
    basePriceINR: e.basePriceINR,
    capacity: e.capacity,
    registeredCount: e.registeredCount,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt.toISOString(),
    status: e.status,
  }));

  return (
    <ChapterEventsView
      events={events}
      chapterId={chapter.id}
      chapterSlug={chapter.slug}
      chapterName={chapter.name}
      chapterCode={chapter.code}
    />
  );
}
