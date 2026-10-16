import { notFound } from 'next/navigation';
import { getCurrentActor } from '@/server/auth/session';
import { EventService } from '@/features/events/server/event.service';
import { SuperAdminEventsView } from '@/features/super-admin/components/super-admin-events-view';

export const dynamic = 'force-dynamic';

export default async function SuperAdminEventsPage() {
  const actor = await getCurrentActor();
  if (!actor || actor.status !== 'ACTIVE' || !actor.roles.includes('SUPER_ADMIN')) {
    notFound();
  }

  const result = await EventService.getEvents({ pageSize: 50 });

  return <SuperAdminEventsView events={result.events} />;
}
