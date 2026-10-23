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
  ShieldCheck,
} from 'lucide-react';

interface AdminShellProps {
  pendingAppsCount: number;
  pendingAgeCount: number;
  adminEmail?: string | null;
  children: React.ReactNode;
}

export function AdminShell({
  pendingAppsCount,
  pendingAgeCount,
  adminEmail,
  children,
}: AdminShellProps) {
  const navItems: NavItem[] = React.useMemo(
    () => [
      {
        id: 'admin-overview',
        label: 'System Overview',
        href: '/',
        icon: LayoutDashboard,
      },
      {
        id: 'admin-applications',
        label: 'Membership Applications',
        href: '/applications',
        icon: UserCheck,
        badge: pendingAppsCount > 0 ? String(pendingAppsCount) : undefined,
      },
      {
        id: 'admin-age-exceptions',
        label: 'Age Exception Reviews',
        href: '/age-exceptions',
        icon: Clock,
        badge: pendingAgeCount > 0 ? String(pendingAgeCount) : undefined,
      },
      {
        id: 'admin-governance',
        label: 'Member Governance',
        href: '/governance',
        icon: ShieldCheck,
      },
      {
        id: 'admin-orgs',
        label: 'Organizations & Districts',
        href: '/organizations',
        icon: Building2,
      },
      {
        id: 'admin-roles',
        label: 'Roles & Permissions',
        href: '/roles',
        icon: Key,
      },
      {
        id: 'admin-events',
        label: 'Events & Programs',
        href: '/events',
        icon: Calendar,
      },
      {
        id: 'admin-audit',
        label: 'Immutable Audit Logs',
        href: '/audit-logs',
        icon: FileText,
      },
      {
        id: 'admin-capacity',
        label: 'Database & 5M Capacity',
        href: '/system-config',
        icon: Database,
      },
      {
        id: 'admin-security',
        label: 'Security Health',
        href: '/security',
        icon: Shield,
      },
    ],
    [pendingAppsCount, pendingAgeCount]
  );

  return (
    <PortalShell
      portalTitle="MYBF Central Workspace"
      roleBadgeText="SUPER_ADMIN"
      scopeBadgeText={adminEmail ? `ROOT: ${adminEmail}` : 'CENTRAL SYSTEM CLOUD'}
      navItems={navItems}
    >
      {children}
    </PortalShell>
  );
}
