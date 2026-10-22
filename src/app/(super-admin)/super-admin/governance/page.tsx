import { SuperAdminGovernanceView } from '@/features/super-admin/components/super-admin-governance-view';
import { PortalPageHeader } from '@/components/ui/portal-elements';

export const dynamic = 'force-dynamic';

export default function SuperAdminGovernancePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PortalPageHeader
        badge="ROOT TENANT GOVERNANCE"
        tag="16 CHAPTERS MONITORED"
        title="Global Membership Governance Oversight"
        description="Root tenant administration of identity corrections, chapter transfers, and emergency maker-checker overrides."
      />

      <SuperAdminGovernanceView />
    </div>
  );
}
