'use client';

import * as React from 'react';
import { PortalShell, NavItem } from '@/components/layout/portal-shell';
import { LayoutDashboard, Shield, Building2, Key, Activity, FileText, Database } from 'lucide-react';

const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'System Overview', href: '/super-admin', icon: LayoutDashboard },
  { label: 'Organizations & Districts', href: '/district-admin', icon: Building2 },
  { label: 'Roles & Permissions', href: '/super-admin', icon: Key },
  { label: 'Immutable Audit Logs', href: '/super-admin', icon: FileText },
  { label: 'Database & 5M Capacity', href: '/super-admin', icon: Database },
  { label: 'Security Health', href: '/super-admin', icon: Shield, badge: 'PASS' },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      portalTitle="Super Admin Governance"
      roleBadgeText="SUPER_ADMIN"
      scopeBadgeText="GLOBAL CLOUD TENANT"
      navItems={SUPER_ADMIN_NAV_ITEMS}
    >
      {children}
    </PortalShell>
  );
}
