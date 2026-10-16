'use client';

import * as React from 'react';
import { PortalShell, NavItem } from '@/components/layout/portal-shell';
import {
  LayoutDashboard,
  UserCheck,
  Clock,
  Building2,
  Key,
  Calendar,
  FileText,
  Database,
  Shield,
} from 'lucide-react';

interface SuperAdminPortalShellProps {
  pendingAppsCount: number;
  pendingAgeCount: number;
  adminEmail?: string | null;
  children: React.ReactNode;
}

export function SuperAdminPortalShell({
  pendingAppsCount,
  pendingAgeCount,
  adminEmail,
  children,
}: SuperAdminPortalShellProps) {
  const navItems: NavItem[] = React.useMemo(
    () => [
      {
        id: 'super-admin-overview',
        label: 'System Overview',
        href: '/super-admin',
        icon: LayoutDashboard,
      },
      {
        id: 'super-admin-applications',
        label: 'Membership Applications',
        href: '/super-admin/applications',
        icon: UserCheck,
        badge: pendingAppsCount > 0 ? String(pendingAppsCount) : undefined,
      },
      {
        id: 'super-admin-age-exceptions',
        label: 'Age Exception Reviews',
        href: '/super-admin/age-exceptions',
        icon: Clock,
        badge: pendingAgeCount > 0 ? String(pendingAgeCount) : undefined,
      },
      {
        id: 'super-admin-orgs',
        label: 'Organizations & Districts',
        href: '/super-admin/organizations',
        icon: Building2,
      },
      {
        id: 'super-admin-roles',
        label: 'Roles & Permissions',
        href: '/super-admin/roles',
        icon: Key,
      },
      {
        id: 'super-admin-events',
        label: 'Events & Programs',
        href: '/super-admin/events',
        icon: Calendar,
      },
      {
        id: 'super-admin-audit',
        label: 'Immutable Audit Logs',
        href: '/super-admin/audit-logs',
        icon: FileText,
      },
      {
        id: 'super-admin-capacity',
        label: 'Database & 5M Capacity',
        href: '/super-admin/system-config',
        icon: Database,
      },
      {
        id: 'super-admin-security',
        label: 'Security Health',
        href: '/super-admin/security',
        icon: Shield,
      },
    ],
    [pendingAppsCount, pendingAgeCount]
  );

  return (
    <PortalShell
      portalTitle="Super Admin Governance"
      roleBadgeText="SUPER_ADMIN"
      scopeBadgeText={adminEmail ? `ROOT: ${adminEmail}` : 'GLOBAL CLOUD TENANT'}
      navItems={navItems}
    >
      {children}
    </PortalShell>
  );
}
