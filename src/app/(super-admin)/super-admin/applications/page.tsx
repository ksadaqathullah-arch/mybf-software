import * as React from 'react';
import { SuperAdminApplicationsQueue } from '@/features/memberships/components/super-admin-applications-queue';
import { Badge } from '@/components/ui/badge';
import { UserCheck } from 'lucide-react';

export default function SuperAdminApplicationsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#035AFC]/10 text-[#035AFC]">
              Final Review Authority
            </span>
            <Badge variant="primary">MAKER-CHECKER WORKFLOW</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
            Membership Application Governance Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Super Administrator final review authority. Validates chapter recommendations, verifies youth eligibility, issues permanent Member IDs, and enables member login.
          </p>
        </div>
      </div>

      <SuperAdminApplicationsQueue />
    </div>
  );
}
