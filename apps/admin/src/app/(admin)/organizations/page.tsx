import * as React from 'react';
import { getCurrentAdmin } from '@/server/auth';
import { SuperAdminService } from '@shared/features/super-admin/server/super-admin.service';
import { SuperAdminOrganizationsView } from '@/components/views/super-admin-organizations-view';

export const dynamic = 'force-dynamic';

export default async function AdminOrganizationsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;

  const data = await SuperAdminService.getOrganizationsAndChapters(admin);

  return (
    <SuperAdminOrganizationsView
      organization={data.organization}
      districts={data.districts}
      chapters={data.chapters}
    />
  );
}
