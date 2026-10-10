'use client';

import * as React from 'react';
import { PortalShell, NavItem } from '@/components/layout/portal-shell';
import { LayoutDashboard, Building2, MapPin, Users, CreditCard, BarChart3, ShieldCheck } from 'lucide-react';

const DISTRICT_NAV_ITEMS: NavItem[] = [
  { label: 'District Overview', href: '/district-admin', icon: LayoutDashboard },
  { label: '16 Chapters', href: '/chapters', icon: Building2 },
  { label: 'Taluk Geography', href: '/district-admin', icon: MapPin },
  { label: 'Members Directory', href: '/district-admin', icon: Users },
  { label: 'Financial Reports', href: '/district-admin', icon: CreditCard },
  { label: 'Growth Analytics', href: '/district-admin', icon: BarChart3 },
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
