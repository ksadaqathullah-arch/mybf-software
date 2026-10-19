import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { SuperAdminGovernanceView } from '@/features/super-admin/components/super-admin-governance-view';
import { ArrowLeft, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SuperAdminGovernancePage() {
  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/super-admin"
              className="text-xs text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Super Admin Console
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-xs font-semibold text-slate-900 dark:text-white">Member Governance Oversight</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Global Membership Governance Oversight
              </h1>
              <p className="text-xs text-slate-500">
                Root tenant administration of identity corrections, chapter transfers, and emergency overrides
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-xs bg-indigo-600">
            ROOT TENANT GOVERNANCE
          </Badge>
          <Badge variant="neutral" className="text-xs">
            16 Chapters Monitored
          </Badge>
        </div>
      </div>

      <SuperAdminGovernanceView />
    </div>
  );
}
