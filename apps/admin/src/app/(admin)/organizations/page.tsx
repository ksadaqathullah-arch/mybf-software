import * as React from 'react';
import { getCurrentAdmin } from '@/server/auth';
import { SuperAdminService } from '@/server/super-admin.service';
import { SuperAdminOrganizationsView } from '@/components/views/super-admin-organizations-view';

export const dynamic = 'force-dynamic';

export default async function AdminOrganizationsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;

  const actor = {
    userId: admin.id,
    email: admin.email,
    phone: admin.phone,
    status: 'ACTIVE' as const,
    roles: admin.roles as any,
  };

  const data = await SuperAdminService.getOrganizationsAndChapters(actor);

  return (
    <SuperAdminOrganizationsView
      organization={data.organization}
      districts={data.districts}
      chapters={data.chapters}
    />
  );
}
