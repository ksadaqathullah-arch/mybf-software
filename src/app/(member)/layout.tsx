'use client';

import * as React from 'react';
import { PortalShell, NavItem } from '@/components/layout/portal-shell';
import { LayoutDashboard, Award, Building2, Calendar, Users, Settings, CreditCard } from 'lucide-react';

const MEMBER_NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/member', icon: LayoutDashboard },
  { label: 'Digital ID Pass', href: '/member/membership/id-card', icon: Award, badge: 'VERIFIED' },
  { label: 'My Chapter', href: '/chapters/manjeri', icon: Building2 },
  { label: 'Events & Summits', href: '/events', icon: Calendar },
  { label: 'Dues & Receipts', href: '/member', icon: CreditCard },
];

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      portalTitle="Member Workspace"
      roleBadgeText="MEMBER"
      scopeBadgeText="Manjeri Chapter"
      navItems={MEMBER_NAV_ITEMS}
    >
      {children}
    </PortalShell>
  );
}
