import * as React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentActor } from '@/server/auth/session';
import { SuperAdminService } from '@/features/super-admin/server/super-admin.service';
import { SuperAdminSecurityView } from '@/features/super-admin/components/super-admin-security-view';

export const dynamic = 'force-dynamic';

export default async function SuperAdminSecurityPage() {
  const actor = await getCurrentActor();
  if (!actor || actor.status !== 'ACTIVE' || !actor.roles.includes('SUPER_ADMIN')) {
    notFound();
  }

  const data = await SuperAdminService.getSecurityHealth(actor);

  return <SuperAdminSecurityView initialData={data} />;
}
