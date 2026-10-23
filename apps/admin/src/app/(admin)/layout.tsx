import * as React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/server/db';
import { getCurrentAdmin } from '@/server/auth';
import { AdminShell } from '@/components/layout/admin-shell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/login');
  }

  // Live application and age exception counts
  const [pendingAppsCount, allApps] = await Promise.all([
    db.membershipApplication.count({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
    }),
    db.membershipApplication.findMany({
      select: { payloadJson: true },
    }),
  ]);

  const pendingAgeCount = allApps.filter((a) => {
    const payload = (a.payloadJson as Record<string, any>) || {};
    return payload.ageException && payload.ageException.status === 'PENDING';
  }).length;

  return (
    <AdminShell
      pendingAppsCount={pendingAppsCount}
      pendingAgeCount={pendingAgeCount}
      adminEmail={admin.email}
    >
      {children}
    </AdminShell>
  );
}
