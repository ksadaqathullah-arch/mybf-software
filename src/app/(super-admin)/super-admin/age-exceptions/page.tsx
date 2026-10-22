import * as React from 'react';
import { SuperAdminAgeExceptionQueue } from '@/features/memberships/components/super-admin-age-exception-queue';
import { PortalPageHeader } from '@/components/ui/portal-elements';

export default function SuperAdminAgeExceptionsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PortalPageHeader
        badge="BYLAW POLICY OVERSIGHT"
        tag="AGE 36+ EXCEPTION REVIEW"
        title="Age Exception Review Queue"
        description="Standard MYBF membership eligibility terminates at age 35. Candidates aged 36 and above require documented Super Admin justification before chapter leadership consideration."
      />

      <SuperAdminAgeExceptionQueue />
    </div>
  );
}
