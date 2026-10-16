import * as React from 'react';
import { db } from '@/server/db';
import { getCurrentActor } from '@/server/auth/session';
import { DistrictAdminPortalShell } from '@/features/district-admin/components/district-admin-portal-shell';
import { DistrictAdminAccessDenied } from '@/features/district-admin/components/district-admin-access-denied';

export const dynamic = 'force-dynamic';

export default async function DistrictAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await getCurrentActor();

  // Deny-by-default server authorization
  const isAuthorized =
    actor &&
    actor.status === 'ACTIVE' &&
    (actor.roles.includes('DISTRICT_ADMIN') || actor.roles.includes('SUPER_ADMIN'));

  if (!isAuthorized) {
    return (
      <DistrictAdminAccessDenied
        reason="Access Restricted: This portal is reserved exclusively for verified MYBF Malappuram District Administrators. Your current session does not possess the required DISTRICT_ADMIN privilege."
      />
    );
  }

  // Query live pending review count across Malappuram chapters
  const pendingCount = await db.membershipApplication.count({
    where: {
      chapter: { district: { code: 'MLP' } },
      status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
    },
  });

  return (
    <DistrictAdminPortalShell
      pendingCount={pendingCount}
      adminEmail={actor.email}
    >
      {children}
    </DistrictAdminPortalShell>
  );
}
