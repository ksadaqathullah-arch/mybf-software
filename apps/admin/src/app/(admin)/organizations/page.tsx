import * as React from 'react';
import { getCurrentAdmin } from '@/server/auth';
import { SuperAdminService } from '@shared/features/super-admin/server/super-admin.service';
import { SuperAdminOrganizationsView } from '@/components/views/super-admin-organizations-view';
import { getMainAppBaseUrl } from '@/lib/main-app-url';
import { db } from '@/server/db';

export const dynamic = 'force-dynamic';

export default async function AdminOrganizationsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;

  const [data, rawEligibleUsers] = await Promise.all([
    SuperAdminService.getOrganizationsAndChapters(admin),
    db.user.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        email: true,
        username: true,
        profile: {
          select: { fullName: true, primaryPhone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const eligibleUsers = rawEligibleUsers.map((u) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    fullName: u.profile?.fullName || u.username || u.email || 'Unnamed Member',
  }));

  const mainAppBaseUrl = getMainAppBaseUrl();

  return (
    <SuperAdminOrganizationsView
      organization={data.organization}
      districts={data.districts}
      chapters={data.chapters}
      eligibleUsers={eligibleUsers}
      mainAppBaseUrl={mainAppBaseUrl}
    />
  );
}

