'use client';

import * as React from 'react';
import { PortalShell, NavItem } from '@/components/layout/portal-shell';
import { LayoutDashboard, Award, Building2, Calendar, CreditCard } from 'lucide-react';

const MEMBER_NAV_ITEMS: NavItem[] = [
  { id: 'member-overview', label: 'Overview', href: '/member', icon: LayoutDashboard },
  { id: 'member-id-card', label: 'Digital ID Pass', href: '/member/membership/id-card', icon: Award, badge: 'VERIFIED' },
  { id: 'member-chapter', label: 'My Chapter', href: '/chapters/manjeri', icon: Building2 },
  { id: 'member-events', label: 'Events & Summits', href: '/events', icon: Calendar },
  { id: 'member-dues', label: 'Dues & Receipts', href: '/member/payments', icon: CreditCard },
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
