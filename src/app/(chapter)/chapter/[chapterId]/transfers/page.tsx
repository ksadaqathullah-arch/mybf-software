import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { db } from '@/server/db';
import { getCurrentActor } from '@/server/auth/session';
import { ChapterTransfersView } from '@/features/chapters/components/chapter-transfers-view';
import { PortalPageHeader } from '@/components/ui/portal-elements';
import { ArrowLeft } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in">
      <PortalPageHeader
        tag={chapter.code}
        badge="Two-Phase Chapter Protocol"
        title="Chapter Transfer Review"
        description={`Review and recommend incoming and outgoing member constituency transfers for ${chapter.name}.`}
        actions={
          <Link href={`/chapter/${chapter.slug}`}>
            <Button variant="outline" size="sm" className="text-xs">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Chapter Hub
            </Button>
          </Link>
        }
      />

      {/* Main Chapter Transfer Review View */}
      <ChapterTransfersView
        chapterId={chapter.id}
        chapterName={chapter.name}
        chapterSlug={chapter.slug}
      />
    </div>
  );
}
