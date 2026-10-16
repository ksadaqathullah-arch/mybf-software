import * as React from 'react';
import { db } from '@/server/db';
import { getCurrentActor } from '@/server/auth/session';
import { SuperAdminPortalShell } from '@/features/super-admin/components/super-admin-portal-shell';
import { SuperAdminAccessDenied } from '@/features/super-admin/components/super-admin-access-denied';

export const dynamic = 'force-dynamic';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await getCurrentActor();

  // Deny-by-default server authorization
  if (!actor || actor.status !== 'ACTIVE' || !actor.roles.includes('SUPER_ADMIN')) {
    return (
      <SuperAdminAccessDenied
        reason="Access Restricted: This portal is reserved exclusively for verified MYBF Super Administrators. Your current session does not possess the required SUPER_ADMIN privilege."
      />
    );
  }

  // Query live pending application and age exception counts
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
    <SuperAdminPortalShell
      pendingAppsCount={pendingAppsCount}
      pendingAgeCount={pendingAgeCount}
      adminEmail={actor.email}
    >
      {children}
    </SuperAdminPortalShell>
  );
}
