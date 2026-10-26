import * as React from 'react';
import { getCurrentAdmin } from '@/server/auth';
import { SuperAdminService } from '@shared/features/super-admin/server/super-admin.service';
import { SuperAdminDatabaseHealthView } from '@/components/views/super-admin-database-health-view';

export const dynamic = 'force-dynamic';

export default async function AdminSystemConfigPage() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;

  const metrics = await SuperAdminService.getDatabaseHealth(admin);

  return <SuperAdminDatabaseHealthView initialData={metrics} />;
}
