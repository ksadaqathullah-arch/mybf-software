'use client';

import * as React from 'react';
import { PortalShell, NavItem } from '@/components/layout/portal-shell';
import { LayoutDashboard, Users, FileCheck, Calendar, CreditCard, Award, Settings } from 'lucide-react';

const CHAPTER_NAV_ITEMS: NavItem[] = [
  { label: 'Executive Dashboard', href: '/chapter/manjeri', icon: LayoutDashboard },
  { label: 'Pending Applications', href: '/chapter/manjeri', icon: FileCheck, badge: '3' },
  { label: 'Chapter Roster', href: '/chapter/manjeri', icon: Users },
  { label: 'Activities & Meetings', href: '/chapter/manjeri', icon: Calendar },
  { label: 'Chapter Finance', href: '/chapter/manjeri', icon: CreditCard },
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
