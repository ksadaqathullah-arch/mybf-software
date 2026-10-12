'use client';

import * as React from 'react';
import { PortalShell, NavItem } from '@/components/layout/portal-shell';
import { LayoutDashboard, Users, FileCheck, Calendar, CreditCard } from 'lucide-react';

const CHAPTER_NAV_ITEMS: NavItem[] = [
  { id: 'chapter-dashboard', label: 'Executive Dashboard', href: '/chapter/manjeri', icon: LayoutDashboard },
  { id: 'chapter-applications', label: 'Pending Applications', href: '/chapter/manjeri/applications', icon: FileCheck, badge: '3' },
  { id: 'chapter-roster', label: 'Chapter Roster', href: '/chapter/manjeri/members', icon: Users },
  { id: 'chapter-meetings', label: 'Activities & Meetings', href: '/chapter/manjeri/meetings', icon: Calendar },
  { id: 'chapter-finance', label: 'Chapter Finance', href: '/chapter/manjeri/finance', icon: CreditCard },
];

export default function ChapterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      portalTitle="Chapter Portal"
      roleBadgeText="CHAPTER PRESIDENT"
      scopeBadgeText="Manjeri Chapter (CHP-01)"
      navItems={CHAPTER_NAV_ITEMS}
    >
      {children}
    </PortalShell>
  );
}
