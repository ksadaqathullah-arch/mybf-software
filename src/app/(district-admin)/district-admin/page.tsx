import Link from 'next/link';
import { getCurrentActor } from '@/server/auth/session';
import { DistrictAdminService } from '@/features/district-admin/server/district-admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageHeader, PortalStatCard } from '@/components/ui/portal-elements';
import { Download, ShieldCheck, Users, Building, Clock, Calendar } from 'lucide-react';
import { DistrictClassificationAnalytics, type DistrictMemberRecord } from '@/features/memberships/components/district-classification-analytics';

export const dynamic = 'force-dynamic';

export default async function DistrictAdminDashboardPage() {
  const actor = await getCurrentActor();
  if (!DistrictAdminService.isAuthorizedDistrictAdmin(actor)) return null;

  const [overview, membersResult] = await Promise.all([
    DistrictAdminService.getDistrictOverviewMetrics(actor!),
    DistrictAdminService.getDistrictMembers(actor!, { pageSize: 100 }),
  ]);

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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <PortalPageHeader
        tag={`DISTRICT CODE: ${overview.districtCode}`}
        badge="District Administration Boundary"
        title={`${overview.districtName} District Administration`}
        description="Central governance, 16 chapter aggregation, taluk geographical distribution, and youth entrepreneurship reporting."
        actions={
          <div className="flex flex-wrap gap-2">
            <a href="/api/v1/district-admin/export?type=overview" download>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1.5" /> Export District Report (CSV)
              </Button>
            </a>
          </div>
        }
      />

      {/* Aggregate District KPIs - Direct PostgreSQL Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PortalStatCard
          label="Total District Members"
          value={overview.totalDistrictMembers.toLocaleString()}
          subValue={`${overview.newRegistrationsThisMonth} new this month`}
          icon={Users}
        />

        <PortalStatCard
          label="Operational Chapters"
          value={`${overview.activeChaptersCount} / ${overview.totalChaptersCount}`}
          subValue="100% active across 7 taluks"
          icon={Building}
        />

        <PortalStatCard
          label="Pending Review Queue"
          value={overview.pendingDistrictReviews}
          subValue={`${overview.approvedMemberships} approved in district`}
          icon={Clock}
        />

        <PortalStatCard
          label="Community Programs"
          value={`${overview.totalEventsCount} Events`}
          subValue={`${overview.upcomingEventsCount} upcoming scheduled`}
          icon={Calendar}
        />
      </div>

      {/* Member Classification Intelligence & Dual Distributions */}
      <DistrictClassificationAnalytics initialMembers={initialMembers} />

      {/* Geographical Taluk Breakdown */}
      <Card>
        <CardHeader className="p-6 pb-4 border-b-2 border-ink">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-black font-display uppercase tracking-wider text-ink">
                Geographical Representation across 7 Taluks
              </CardTitle>
              <CardDescription className="text-xs text-ink/70 font-serif mt-1">
                Verified member residence and commercial footprint in Malappuram District
              </CardDescription>
            </div>
            <Badge variant="neutral">MALAPPURAM GEOGRAPHY</Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {overview.taluks.map((t) => (
              <div
                key={t.code}
                className="border-2 border-ink p-3 bg-paper shadow-[2px_2px_0px_#14161c] text-center"
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-ink/60 font-display block">
                  {t.name}
                </span>
                <span className="text-2xl font-black text-ink mt-1 block font-mono">
                  {t.memberCount}
                </span>
                <span className="text-[9px] font-bold text-blue font-display uppercase tracking-wider block mt-1">
                  HQ: {t.headquarters}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 16 Chapters Health and Performance Table */}
      <Card>
        <CardHeader className="p-6 pb-4 border-b-2 border-ink flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl font-black font-display uppercase tracking-wider text-ink">
              Founding Chapters Oversight
            </CardTitle>
            <CardDescription className="text-xs text-ink/70 font-serif mt-1">
              Real-time operational health, active members, and pending approvals per chapter.
            </CardDescription>
          </div>
          <Link href="/district-admin/chapters">
            <Button variant="outline" size="sm" className="text-xs">
              Full 16 Chapters Management &rarr;
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="border-b-2 border-ink bg-paper-sunken text-ink font-display font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Chapter Name</th>
                  <th className="py-3 px-4">Taluk</th>
                  <th className="py-3 px-4">Active Members</th>
                  <th className="py-3 px-4">Pending Reviews</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 font-mono text-[11px]">
                {overview.chapters.map((ch) => (
                  <tr key={ch.code} className="hover:bg-yellow/10 transition-colors">
                    <td className="py-3 px-4 font-mono text-[10px] text-ink/60 font-bold">
                      {ch.code}
                    </td>
                    <td className="py-3 px-4 font-bold text-ink font-sans text-xs">
                      {ch.name}
                    </td>
                    <td className="py-3 px-4 text-ink/70 font-serif">
                      {ch.taluk}
                    </td>
                    <td className="py-3 px-4 font-bold text-ink">
                      {ch.activeMembersCount}
                    </td>
                    <td className="py-3 px-4">
                      {ch.pendingReviewsCount > 0 ? (
                        <Badge variant="warning" className="text-[9px]">
                          {ch.pendingReviewsCount} pending
                        </Badge>
                      ) : (
                        <span className="text-ink/40 text-[10px]">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={ch.status === 'ACTIVE' ? 'success' : 'neutral'} className="text-[9px]">
                        {ch.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/chapter/${ch.slug}`}>
                        <Button variant="outline" size="sm" className="h-7 text-[10px] px-2.5">
                          Portal
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
