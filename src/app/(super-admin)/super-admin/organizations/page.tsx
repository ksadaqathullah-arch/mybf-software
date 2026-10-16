import * as React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentActor } from '@/server/auth/session';
import { SuperAdminService } from '@/features/super-admin/server/super-admin.service';
import { SuperAdminOrganizationsView } from '@/features/super-admin/components/super-admin-organizations-view';

export const dynamic = 'force-dynamic';

export default async function SuperAdminOrganizationsPage() {
  const actor = await getCurrentActor();
  if (!actor || actor.status !== 'ACTIVE' || !actor.roles.includes('SUPER_ADMIN')) {
    notFound();
  }

  const data = await SuperAdminService.getOrganizationsAndChapters(actor);

  return (
    <SuperAdminOrganizationsView
      organization={data.organization}
      districts={data.districts}
      chapters={data.chapters}
    />
  );
}
