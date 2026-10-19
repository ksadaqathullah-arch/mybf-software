import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DistrictGovernanceView } from '@/features/district-admin/components/district-governance-view';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DistrictAdminGovernancePage() {
  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/district-admin"
              className="text-xs text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              District Administration
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-xs font-semibold text-slate-900 dark:text-white">Member Governance</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Member Governance Center
              </h1>
              <p className="text-xs text-slate-500">
                Official Malappuram District Approval Center for Identity Corrections and Chapter Transfers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-xs">
            MLP DISTRICT SECRETARIAT
          </Badge>
          <Badge variant="neutral" className="text-xs">
            Statutory Approval Authority
          </Badge>
        </div>
      </div>

      {/* Main Governance View */}
      <DistrictGovernanceView />
    </div>
  );
}
