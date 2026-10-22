import * as React from 'react';
import { SuperAdminApplicationsQueue } from '@/features/memberships/components/super-admin-applications-queue';
import { PortalPageHeader } from '@/components/ui/portal-elements';

export default function SuperAdminApplicationsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PortalPageHeader
        badge="FINAL REVIEW AUTHORITY"
        tag="MAKER-CHECKER WORKFLOW"
        title="Membership Application Governance Queue"
        description="Super Administrator final review authority. Validates chapter recommendations, verifies youth eligibility, issues permanent Member IDs, and enables member login."
      />

      <SuperAdminApplicationsQueue />
    </div>
  );
}
