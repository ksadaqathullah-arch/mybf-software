import { getCurrentActor } from '@/server/auth/session';
import { DistrictAdminService } from '@/features/district-admin/server/district-admin.service';
import { DistrictClassificationAnalytics, type DistrictMemberRecord } from '@/features/memberships/components/district-classification-analytics';
import { PortalPageHeader } from '@/components/ui/portal-elements';

export const dynamic = 'force-dynamic';

export default async function DistrictYouthDiscoveryPage() {
  const actor = await getCurrentActor();
  if (!DistrictAdminService.isAuthorizedDistrictAdmin(actor)) return null;

  const membersResult = await DistrictAdminService.getDistrictMembers(actor!, { pageSize: 100 });

  const initialMembers: DistrictMemberRecord[] = membersResult.members.map((m) => ({
    id: m.id,
    membershipNumber: m.membershipNumber,
    fullName: m.fullName,
    chapterSlug: m.chapterSlug,
    chapterName: m.chapterName,
    taluk: m.taluk,
    memberCategory: m.memberCategory as any,
    currentPosition: m.currentPosition as any,
    expectations: m.expectations,
    talents: m.talents,
    participationPreferences: m.participationPreferences,
    status: m.status as any,
    joinedDate: m.joinedDate ? m.joinedDate.split('T')[0] : '',
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PortalPageHeader
        tag="MALAPPURAM DISTRICT"
        badge="Talent Intelligence"
        title="Youth Discovery & Talent Intelligence Hub"
        description="Multi-dimensional exploration across youth aspirations, member expectations, extracurricular talents, and engagement channels."
      />

      {/* Interactive Youth Discovery & Classification Engine */}
      <DistrictClassificationAnalytics initialMembers={initialMembers} />
    </div>
  );
}
