import * as React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentActor } from '@/server/auth/session';
import { SuperAdminService } from '@/features/super-admin/server/super-admin.service';
import { SuperAdminAuditLogsView } from '@/features/super-admin/components/super-admin-audit-logs-view';
import { PortalPageHeader } from '@/components/ui/portal-elements';

export const dynamic = 'force-dynamic';

export default async function SuperAdminAuditLogsPage() {
  const actor = await getCurrentActor();
  if (!actor || actor.status !== 'ACTIVE' || !actor.roles.includes('SUPER_ADMIN')) {
    notFound();
  }

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
