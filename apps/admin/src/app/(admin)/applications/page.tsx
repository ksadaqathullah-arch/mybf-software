import * as React from 'react';
import { SuperAdminApplicationsQueue } from '@/components/views/super-admin-applications-queue';
import { PortalPageHeader } from '@/components/ui/portal-elements';

export const dynamic = 'force-dynamic';

export default function AdminApplicationsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PortalPageHeader
        badge="Final Review Authority"
        tag="Maker-Checker Workflow"
        title="Membership Application Governance Queue"
        description="Super Administrator final review authority. Validates chapter recommendations, verifies youth eligibility, issues permanent Member IDs, and enables member login."
      />

      <SuperAdminApplicationsQueue />
    </div>
  );
}
