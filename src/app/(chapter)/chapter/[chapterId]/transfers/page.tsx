import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { db } from '@/server/db';
import { getCurrentActor } from '@/server/auth/session';
import { ChapterTransfersView } from '@/features/chapters/components/chapter-transfers-view';
import { ArrowLeft, ArrowLeftRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ChapterTransfersPage({
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

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/chapter/${chapter.slug}`}
              className="text-xs text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              {chapter.name} Executive Hub
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-xs font-semibold text-slate-900 dark:text-white">Chapter Transfers</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Chapter Transfer Review
              </h1>
              <p className="text-xs text-slate-500">
                Review and recommend incoming and outgoing member constituency chapter transfers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-xs font-mono">
            {chapter.code}
          </Badge>
          <Badge variant="neutral" className="text-xs">
            Two-Phase Chapter Protocol
          </Badge>
        </div>
      </div>

      {/* Main Chapter Transfer Review View */}
      <ChapterTransfersView
        chapterId={chapter.id}
        chapterName={chapter.name}
        chapterSlug={chapter.slug}
      />
    </div>
  );
}
