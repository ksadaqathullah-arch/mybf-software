import { getCurrentActor } from '@/server/auth/session';
import { DistrictAdminService } from '@/features/district-admin/server/district-admin.service';
import { DistrictReportsView } from '@/features/district-admin/components/district-reports-view';

export const dynamic = 'force-dynamic';

export default async function DistrictReportsPage() {
  const actor = await getCurrentActor();
  if (!actor) return null;

  const analytics = await DistrictAdminService.getDistrictAnalytics(actor);

  return <DistrictReportsView analytics={analytics} />;
}
