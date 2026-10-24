import * as React from 'react';
import { getCurrentAdmin } from '@/server/auth';
import { SuperAdminService } from '@/server/super-admin.service';
import { SuperAdminDatabaseHealthView } from '@/components/views/super-admin-database-health-view';

export const dynamic = 'force-dynamic';

export default async function AdminSystemConfigPage() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;

  const actor = {
    userId: admin.id,
    email: admin.email,
    phone: admin.phone,
    status: 'ACTIVE' as const,
    roles: admin.roles as any,
  };

  const metrics = await SuperAdminService.getDatabaseHealth(actor);

  return <SuperAdminDatabaseHealthView initialData={metrics} />;
}
