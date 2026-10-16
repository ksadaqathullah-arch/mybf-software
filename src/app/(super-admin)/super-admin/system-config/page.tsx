import * as React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentActor } from '@/server/auth/session';
import { SuperAdminService } from '@/features/super-admin/server/super-admin.service';
import { SuperAdminDatabaseHealthView } from '@/features/super-admin/components/super-admin-database-health-view';

export const dynamic = 'force-dynamic';

export default async function SuperAdminSystemConfigPage() {
  const actor = await getCurrentActor();
  if (!actor || actor.status !== 'ACTIVE' || !actor.roles.includes('SUPER_ADMIN')) {
    notFound();
  }

  const metrics = await SuperAdminService.getDatabaseHealth(actor);

  return <SuperAdminDatabaseHealthView initialData={metrics} />;
}
