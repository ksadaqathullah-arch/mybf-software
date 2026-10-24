import * as React from 'react';
import { getCurrentAdmin } from '@/server/auth';
import { SuperAdminService } from '@/server/super-admin.service';
import { SuperAdminAuditLogsView } from '@/components/views/super-admin-audit-logs-view';
import { PortalPageHeader } from '@/components/ui/portal-elements';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;

  const actor = {
    userId: admin.id,
    email: admin.email,
    phone: admin.phone,
    status: 'ACTIVE' as const,
    roles: admin.roles as any,
  };

  const data = await SuperAdminService.getAuditLogs(actor, {
    page: 1,
    pageSize: 20,
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <PortalPageHeader
        badge="AUDIT TRAIL TELEMETRY"
        tag="DATABASE PERSISTENT AUDIT"
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
