import { getCurrentActor } from '@/server/auth/session';
import { DistrictAdminService } from '@/features/district-admin/server/district-admin.service';
import { DistrictEventsView } from '@/features/district-admin/components/district-events-view';

export const dynamic = 'force-dynamic';

export default async function DistrictEventsPage() {
  const actor = await getCurrentActor();
  if (!actor) return null;

  const events = await DistrictAdminService.getDistrictEvents(actor);

  return <DistrictEventsView events={events} />;
}
