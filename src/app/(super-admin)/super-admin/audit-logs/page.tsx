import * as React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentActor } from '@/server/auth/session';
import { SuperAdminService } from '@/features/super-admin/server/super-admin.service';
import { SuperAdminAuditLogsView } from '@/features/super-admin/components/super-admin-audit-logs-view';
import { Badge } from '@/components/ui/badge';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#035AFC]/10 text-[#035AFC]">
              Audit Trail Telemetry
            </span>
            <Badge variant="primary">DATABASE PERSISTENT AUDIT</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
            System & Administrative Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Historical trace of membership approvals, age exception decisions, leadership role changes, and security events.
          </p>
        </div>
      </div>

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
