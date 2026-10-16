import { getCurrentActor } from '@/server/auth/session';
import { DistrictAdminService } from '@/features/district-admin/server/district-admin.service';
import { DistrictApplicationsView } from '@/features/district-admin/components/district-applications-view';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    chapterId?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function DistrictApplicationsPage({ searchParams }: PageProps) {
  const actor = await getCurrentActor();
  if (!actor) return null;

  const sp = await searchParams;
  const page = parseInt(sp.page || '1', 10) || 1;

  const result = await DistrictAdminService.getDistrictApplications(actor, {
    search: sp.search,
    chapterId: sp.chapterId,
    status: sp.status,
    page,
    pageSize: 20,
  });

  return (
    <DistrictApplicationsView
      initialApplications={result.applications}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
    />
  );
}
