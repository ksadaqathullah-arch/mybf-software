import * as React from 'react';
import { SuperAdminAgeExceptionQueue } from '@/components/views/super-admin-age-exception-queue';
import { PortalPageHeader } from '@/components/ui/portal-elements';

export const dynamic = 'force-dynamic';

export default function AdminAgeExceptionsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PortalPageHeader
        badge="BYLAW POLICY OVERSIGHT"
        tag="AGE 36+ EXCEPTION REVIEW"
        title="Age Exception Review Queue"
        description="Standard MYBF membership eligibility is open to candidates aged 35 years or below. Candidates aged above 35 require documented Super Admin exception approval before chapter leadership consideration."
      />

      <SuperAdminAgeExceptionQueue />
    </div>
  );
}
