import { getCurrentActor } from '@/server/auth/session';
import { DistrictAdminService } from '@/features/district-admin/server/district-admin.service';
import { DistrictMembersView } from '@/features/district-admin/components/district-members-view';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    chapterSlug?: string;
    taluk?: string;
    category?: string;
    position?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function DistrictMembersPage({ searchParams }: PageProps) {
  const actor = await getCurrentActor();
  if (!actor) return null;

  const sp = await searchParams;
  const page = parseInt(sp.page || '1', 10) || 1;

  const result = await DistrictAdminService.getDistrictMembers(actor, {
    search: sp.search,
    chapterSlug: sp.chapterSlug,
    taluk: sp.taluk,
    category: sp.category,
    position: sp.position,
    status: sp.status,
    page,
    pageSize: 20,
  });

  return (
    <DistrictMembersView
      initialMembers={result.members}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
    />
  );
}
