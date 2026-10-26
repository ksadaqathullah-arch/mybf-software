import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileCheck } from 'lucide-react';
import { db } from '@/server/db';
import { getCurrentActor } from '@/server/auth/session';
import { ChapterService } from '@/features/chapters/server/chapter.service';
import { ChapterReviewQueue } from '@/features/memberships/components/chapter-review-queue';

export default async function ChapterApplicationsPage({
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

  const applications = await ChapterService.getChapterApplications(actor, chapter.id);
  const pendingCount = applications.filter((a) => a.status === 'SUBMITTED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-5">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
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
              {chapter.name} Applications Queue
            </h1>
            <Badge
              variant={pendingCount > 0 ? 'warning' : 'success'}
              className="border-ink shadow-[1px_1px_0px_#14161c]"
            >
              {pendingCount} {pendingCount === 1 ? 'AWAITING REVIEW' : 'AWAITING REVIEWS'}
            </Badge>
          </div>
          <p className="text-xs text-ink/70 font-serif mt-1.5 pl-1">
            Review applicant qualifications and forward verified recommendations to the Super Admin.
          </p>
        </div>
      </div>

      <ChapterReviewQueue
        initialApplications={applications as any}
        chapterName={chapter.name}
      />
    </div>
  );
}
