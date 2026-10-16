import { getCurrentActor } from '@/server/auth/session';
import { DistrictAdminService } from '@/features/district-admin/server/district-admin.service';
import { DistrictChaptersView } from '@/features/district-admin/components/district-chapters-view';

export const dynamic = 'force-dynamic';

export default async function DistrictChaptersPage() {
  const actor = await getCurrentActor();
  if (!actor) return null;

  const chapters = await DistrictAdminService.getDistrictChapters(actor);

  return <DistrictChaptersView chapters={chapters} />;
}
