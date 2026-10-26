import * as React from 'react';
import { getCurrentAdmin } from '@/server/auth';
import { SuperAdminService } from '@shared/features/super-admin/server/super-admin.service';
import { SuperAdminAuditLogsView } from '@/components/views/super-admin-audit-logs-view';
import { PortalPageHeader } from '@/components/ui/portal-elements';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;

  const data = await SuperAdminService.getAuditLogs(admin, {
    page: 1,
    pageSize: 20,
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <PortalPageHeader
        badge="Audit Trail Telemetry"
        tag="Database Persistent Audit"
        title="System & Administrative Audit Logs"
        description="Historical trace of membership approvals, age exception decisions, leadership role changes, and security events."
      />

      <SuperAdminAuditLogsView
        initialLogs={data.logs}
        initialTotal={data.total}
        initialPage={data.page}
        initialPageSize={data.pageSize}
        initialTotalPages={data.totalPages}
      />
    </div>
  );
}
