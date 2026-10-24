import { getCurrentAdmin } from '@/server/auth';
import { EventService } from '@shared/features/events/server/event.service';
import { SuperAdminEventsView } from '@/components/views/super-admin-events-view';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;

  const result = await EventService.getEvents({ pageSize: 50 });

  return <SuperAdminEventsView events={result.events} />;
}
