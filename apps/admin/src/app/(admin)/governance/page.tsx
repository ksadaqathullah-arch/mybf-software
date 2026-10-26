import { SuperAdminGovernanceView } from '@/components/views/super-admin-governance-view';
import { PortalPageHeader } from '@/components/ui/portal-elements';

export const dynamic = 'force-dynamic';

export default function AdminGovernancePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PortalPageHeader
        badge="Root Tenant Governance"
        tag="16 Chapters Monitored"
        title="Global Membership Governance Oversight"
        description="Root tenant administration of identity corrections, chapter transfers, and emergency maker-checker overrides."
      />

      <SuperAdminGovernanceView />
    </div>
  );
}
