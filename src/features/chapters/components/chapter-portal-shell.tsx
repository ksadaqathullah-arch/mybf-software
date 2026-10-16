'use client';

import * as React from 'react';
import { PortalShell, NavItem } from '@/components/layout/portal-shell';
import { LayoutDashboard, Users, FileCheck, Calendar, CreditCard, Ticket } from 'lucide-react';

interface ChapterPortalShellProps {
  chapterSlug: string;
  chapterName: string;
  chapterCode: string;
  roleBadgeText: string;
  pendingCount: number;
  children: React.ReactNode;
}

export function ChapterPortalShell({
  chapterSlug,
  chapterName,
  chapterCode,
  roleBadgeText,
  pendingCount,
  children,
}: ChapterPortalShellProps) {
  const navItems: NavItem[] = React.useMemo(() => [
    {
      id: 'chapter-dashboard',
      label: 'Executive Dashboard',
      href: `/chapter/${chapterSlug}`,
      icon: LayoutDashboard,
    },
    {
      id: 'chapter-applications',
      label: 'Pending Applications',
      href: `/chapter/${chapterSlug}/applications`,
      icon: FileCheck,
      badge: pendingCount > 0 ? String(pendingCount) : undefined,
    },
    {
      id: 'chapter-roster',
      label: 'Chapter Roster',
      href: `/chapter/${chapterSlug}/members`,
      icon: Users,
    },
    {
      id: 'chapter-events',
      label: 'Chapter Events',
      href: `/chapter/${chapterSlug}/events`,
      icon: Ticket,
    },
    {
      id: 'chapter-meetings',
      label: 'Activities & Meetings',
      href: `/chapter/${chapterSlug}/meetings`,
      icon: Calendar,
    },
    {
      id: 'chapter-finance',
      label: 'Chapter Finance',
      href: `/chapter/${chapterSlug}/finance`,
      icon: CreditCard,
    },
  ], [chapterSlug, pendingCount]);

  return (
    <PortalShell
      portalTitle="Chapter Portal"
      roleBadgeText={roleBadgeText}
      scopeBadgeText={`${chapterName} (${chapterCode})`}
      navItems={navItems}
    >
      {children}
    </PortalShell>
  );
}
