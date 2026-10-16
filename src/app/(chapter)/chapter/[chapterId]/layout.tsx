import * as React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/server/db';
import { getCurrentActor } from '@/server/auth/session';
import { ChapterPortalShell } from '@/features/chapters/components/chapter-portal-shell';
import { ChapterAccessDenied } from '@/features/chapters/components/chapter-access-denied';

export const dynamic = 'force-dynamic';

export default async function ChapterExecutiveLayout({
  params,
  children,
}: {
  params: Promise<{ chapterId: string }>;
  children: React.ReactNode;
}) {
  const { chapterId } = await params;

  // 1. Resolve canonical chapter from PostgreSQL database
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

  // 2. Validate authenticated actor
  const actor = await getCurrentActor();
  if (!actor || actor.status !== 'ACTIVE') {
    return (
      <ChapterAccessDenied
        chapterName={chapter.name}
        reason="Authentication required. Please sign in with an authorized MYBF chapter executive account to access this hub."
      />
    );
  }

  // 3. Validate chapter executive authorization
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

  let isAuthorized = false;
  let roleBadgeText = 'OFFICER';

  if (isSuperAdmin) {
    isAuthorized = true;
    roleBadgeText = 'SUPER ADMIN';
  } else if (isDistrictAdmin) {
    isAuthorized = true;
    roleBadgeText = 'DISTRICT ADMIN';
  } else if (isChapterOfficer) {
    if (actor.chapterId === chapter.id) {
      isAuthorized = true;
      const primaryRole = actor.roles.find((r) => r.startsWith('CHAPTER_')) || 'CHAPTER_PRESIDENT';
      roleBadgeText = primaryRole.replace(/_/g, ' ');
    }
  }

  if (!isAuthorized) {
    return (
      <ChapterAccessDenied
        chapterName={chapter.name}
        reason={`Cross-Chapter Access Denied: Your account is not authorized to manage ${chapter.name}. Chapter officers may only manage their assigned constituency chapter.`}
      />
    );
  }

  // 4. Query real-time pending applications count for this chapter
  const pendingCount = await db.membershipApplication.count({
    where: {
      chapterId: chapter.id,
      status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
    },
  });

  return (
    <ChapterPortalShell
      chapterSlug={chapter.slug}
      chapterName={chapter.name}
      chapterCode={chapter.code}
      roleBadgeText={roleBadgeText}
      pendingCount={pendingCount}
    >
      {children}
    </ChapterPortalShell>
  );
}
