import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageHeader } from '@/components/ui/portal-elements';
import { DistrictGovernanceView } from '@/features/district-admin/components/district-governance-view';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DistrictAdminGovernancePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PortalPageHeader
        tag="STATUTORY APPROVAL AUTHORITY"
        badge="MLP District Secretariat"
        title="Member Governance Center"
        description="Official Malappuram District Approval Center for Identity Corrections and Chapter Transfers."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/district-admin">
              <Button variant="outline" size="sm" className="text-xs">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> District Overview
              </Button>
            </Link>
          </div>
        }
      />

      {/* Main Governance View */}
      <DistrictGovernanceView />
    </div>
  );
}
