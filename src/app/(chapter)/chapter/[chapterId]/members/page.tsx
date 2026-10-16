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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/chapter/${chapter.slug}`}>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500">
                <ArrowLeft className="h-4 w-4 mr-1" /> Hub
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {chapter.name} Member Roster
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-1">
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
