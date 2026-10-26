import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/server/db';
import { getCurrentActor } from '@/server/auth/session';
import { ChapterService } from '@/features/chapters/server/chapter.service';
import { ChapterRosterTable } from '@/features/chapters/components/chapter-roster-table';

export default async function ChapterMembersPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;

  const chapter = await db.chapter.findFirst({
    where: {
      OR: [
        { slug: chapterId.toLowerCase() },
        { id: chapterId },
        { code: chapterId.toUpperCase() },
      ],
    },
  });

  if (!chapter) {
    notFound();
  }

  const actor = await getCurrentActor();
  if (!actor) {
    return null; // Layout renders ChapterAccessDenied
  }

  const isSuperAdmin = actor.roles.includes('SUPER_ADMIN');
  const isDistrictAdmin = actor.roles.includes('DISTRICT_ADMIN');
  const isChapterOfficer = actor.roles.some((r) =>
    [
      'CHAPTER_PRESIDENT',
      'CHAPTER_SECRETARY',
      'CHAPTER_TREASURER',
      'CHAPTER_COORDINATOR',
      'MEMBERSHIP_OFFICER',
      'EVENT_MANAGER',
    ].includes(r)
  );

  const isAuthorized = isSuperAdmin || isDistrictAdmin || (isChapterOfficer && actor.chapterId === chapter.id);
  if (!isAuthorized) {
    return null; // Layout renders ChapterAccessDenied
  }

  const members = await ChapterService.getChapterMembers(actor, chapter.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-5">
        <div>
          <div className="flex items-center gap-3">
            <Link href={`/chapter/${chapter.slug}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 border-2 border-ink bg-paper shadow-[2px_2px_0px_#14161c] hover:bg-yellow/20 text-xs font-display font-black uppercase tracking-wider text-ink"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Hub
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-ink">
              {chapter.name} Member Roster
            </h1>
          </div>
          <p className="text-xs text-ink/70 font-serif mt-1.5 pl-1">
            Complete registry of approved youth business owners and aspiring founders in {chapter.name}.
          </p>
        </div>
      </div>

      <ChapterRosterTable
        initialMembers={members}
        chapterName={chapter.name}
      />
    </div>
  );
}
