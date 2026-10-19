import { getCurrentActor } from '@/server/auth/session';
import { DistrictAdminService } from '@/features/district-admin/server/district-admin.service';
import { GeographyService } from '@/features/geography/server/geography.service';
import { DistrictGeographyView } from '@/features/district-admin/components/district-geography-view';

export const dynamic = 'force-dynamic';

export default async function DistrictGeographyPage() {
  const actor = await getCurrentActor();
  if (!DistrictAdminService.isAuthorizedDistrictAdmin(actor)) return null;

  const distribution = await GeographyService.getGeographicDistribution();

  return <DistrictGeographyView distribution={distribution} />;
}
