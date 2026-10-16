import { getCurrentActor } from '@/server/auth/session';
import { DistrictAdminService } from '@/features/district-admin/server/district-admin.service';
import { DistrictClassificationAnalytics, type DistrictMemberRecord } from '@/features/memberships/components/district-classification-analytics';
import { Badge } from '@/components/ui/badge';
import { Target, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DistrictYouthDiscoveryPage() {
  const actor = await getCurrentActor();
  if (!actor) return null;

  const membersResult = await DistrictAdminService.getDistrictMembers(actor, { pageSize: 100 });

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
    joinedDate: m.joinedDate.split('T')[0],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="h-6 w-6 text-[#035AFC]" /> Youth Discovery & Talent Intelligence Hub
          </h1>
          <Badge variant="primary">MALAPPURAM DISTRICT</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Multi-dimensional exploration across youth aspirations, member expectations, extracurricular talents, and engagement channels
        </p>
      </div>

      {/* Interactive Youth Discovery & Classification Engine */}
      <DistrictClassificationAnalytics initialMembers={initialMembers} />
    </div>
  );
}
