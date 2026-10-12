'use client';

import * as React from 'react';
import { PortalShell, NavItem } from '@/components/layout/portal-shell';
import { LayoutDashboard, Building2, MapPin, Users, CreditCard, BarChart3 } from 'lucide-react';

const DISTRICT_NAV_ITEMS: NavItem[] = [
  { id: 'district-overview', label: 'District Overview', href: '/district-admin', icon: LayoutDashboard },
  { id: 'district-chapters', label: '16 Chapters', href: '/chapters', icon: Building2 },
  { id: 'district-geography', label: 'Taluk Geography', href: '/district-admin/geography', icon: MapPin },
  { id: 'district-members', label: 'Members Directory', href: '/district-admin/members', icon: Users },
  { id: 'district-finance', label: 'Financial Reports', href: '/district-admin/finance', icon: CreditCard },
  { id: 'district-analytics', label: 'Growth Analytics', href: '/district-admin/reports', icon: BarChart3 },
];

export default function DistrictAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      portalTitle="District Administration"
      roleBadgeText="DISTRICT ADMIN"
      scopeBadgeText="Malappuram District (MLP)"
      navItems={DISTRICT_NAV_ITEMS}
    >
      {children}
    </PortalShell>
  );
}
