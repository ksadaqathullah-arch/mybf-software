'use client';

import * as React from 'react';
import { PortalShell, NavItem } from '@/components/layout/portal-shell';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Users,
  Compass,
  FileCheck,
  Calendar,
  CreditCard,
  BarChart3,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface DistrictAdminPortalShellProps {
  pendingCount: number;
  adminEmail?: string | null;
  children: React.ReactNode;
}

export function DistrictAdminPortalShell({
  pendingCount,
  adminEmail,
  children,
}: DistrictAdminPortalShellProps) {
  const navItems: NavItem[] = React.useMemo(
    () => [
      {
        id: 'district-overview',
        label: 'District Overview',
        href: '/district-admin',
        icon: LayoutDashboard,
      },
      {
        id: 'district-applications',
        label: 'Pending Reviews',
        href: '/district-admin/applications',
        icon: FileCheck,
        badge: pendingCount > 0 ? String(pendingCount) : undefined,
      },
      {
        id: 'district-governance',
        label: 'Member Governance',
        href: '/district-admin/governance',
        icon: ShieldCheck,
      },
      {
        id: 'district-chapters',
        label: '16 Chapters',
        href: '/district-admin/chapters',
        icon: Building2,
      },
      {
        id: 'district-members',
        label: 'Members Directory',
        href: '/district-admin/members',
        icon: Users,
      },
      {
        id: 'district-youth',
        label: 'Youth Discovery',
        href: '/district-admin/youth-discovery',
        icon: Compass,
      },
      {
        id: 'district-geography',
        label: 'Taluk Geography',
        href: '/district-admin/geography',
        icon: MapPin,
      },
      {
        id: 'district-events',
        label: 'Events & Conclaves',
        href: '/district-admin/events',
        icon: Calendar,
      },
      {
        id: 'district-analytics',
        label: 'Growth Analytics',
        href: '/district-admin/reports',
        icon: BarChart3,
      },
      {
        id: 'district-finance',
        label: 'Financial Reports',
        href: '/district-admin/finance',
        icon: CreditCard,
      },
      {
        id: 'district-settings',
        label: 'District Settings',
        href: '/district-admin/settings',
        icon: Settings,
      },
    ],
    [pendingCount]
  );

  return (
    <PortalShell
      portalTitle="District Administration"
      roleBadgeText="DISTRICT ADMIN"
      scopeBadgeText="Malappuram District (MLP)"
      navItems={navItems}
    >
      {children}
    </PortalShell>
  );
}
