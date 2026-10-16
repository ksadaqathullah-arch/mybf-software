import { getCurrentActor } from '@/server/auth/session';
import { DistrictAdminService } from '@/features/district-admin/server/district-admin.service';
import { DistrictSettingsView } from '@/features/district-admin/components/district-settings-view';

export const dynamic = 'force-dynamic';

export default async function DistrictSettingsPage() {
  const actor = await getCurrentActor();
  if (!actor) return null;

  DistrictAdminService.assertDistrictAdmin(actor);
  const district = await DistrictAdminService.resolveDistrict();

  return (
    <DistrictSettingsView
      districtName={district.name}
      districtCode={district.code}
      adminEmail={actor.email || 'District Administrator'}
    />
  );
}
