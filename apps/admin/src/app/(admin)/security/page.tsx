import * as React from 'react';
import { getCurrentAdmin } from '@/server/auth';
import { SuperAdminService } from '@shared/features/super-admin/server/super-admin.service';
import { SuperAdminSecurityView } from '@/components/views/super-admin-security-view';

export const dynamic = 'force-dynamic';

export default async function AdminSecurityPage() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;

  const data = await SuperAdminService.getSecurityHealth(admin);

  return <SuperAdminSecurityView initialData={data} />;
}
