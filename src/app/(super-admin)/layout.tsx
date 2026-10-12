'use client';

import * as React from 'react';
import { PortalShell, NavItem } from '@/components/layout/portal-shell';
import { LayoutDashboard, Shield, Building2, Key, FileText, Database } from 'lucide-react';

const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
  { id: 'super-admin-overview', label: 'System Overview', href: '/super-admin', icon: LayoutDashboard },
  { id: 'super-admin-orgs', label: 'Organizations & Districts', href: '/super-admin/organizations', icon: Building2 },
  { id: 'super-admin-roles', label: 'Roles & Permissions', href: '/super-admin/roles', icon: Key },
  { id: 'super-admin-audit', label: 'Immutable Audit Logs', href: '/super-admin/audit-logs', icon: FileText },
  { id: 'super-admin-capacity', label: 'Database & 5M Capacity', href: '/super-admin/system-config', icon: Database },
  { id: 'super-admin-security', label: 'Security Health', href: '/super-admin/security', icon: Shield, badge: 'PASS' },
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
