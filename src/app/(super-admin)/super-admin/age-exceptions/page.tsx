import * as React from 'react';
import { SuperAdminAgeExceptionQueue } from '@/features/memberships/components/super-admin-age-exception-queue';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

export default function SuperAdminAgeExceptionsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Bylaw Policy Oversight
            </span>
            <Badge variant="warning">AGE 36+ EXCEPTION REVIEW</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
            Age Exception Review Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standard MYBF membership eligibility terminates at age 35. Candidates aged 36 and above require documented Super Admin justification before chapter leadership consideration.
          </p>
        </div>
      </div>

      <SuperAdminAgeExceptionQueue />
    </div>
  );
}
