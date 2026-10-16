import Link from 'next/link';
import { getCurrentActor } from '@/server/auth/session';
import { DistrictAdminService } from '@/features/district-admin/server/district-admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, ShieldCheck, Users, Building, Clock, Calendar } from 'lucide-react';
import { DistrictClassificationAnalytics, type DistrictMemberRecord } from '@/features/memberships/components/district-classification-analytics';

export const dynamic = 'force-dynamic';

export default async function DistrictAdminDashboardPage() {
  const actor = await getCurrentActor();
  if (!actor) return null;

  const [overview, membersResult] = await Promise.all([
    DistrictAdminService.getDistrictOverviewMetrics(actor),
    DistrictAdminService.getDistrictMembers(actor, { pageSize: 100 }),
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
    joinedDate: m.joinedDate.split('T')[0],
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {overview.districtName} District Administration
            </h1>
            <Badge variant="primary">DISTRICT CODE: {overview.districtCode}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central governance, 16 chapter aggregation, taluk geographical distribution and NGO reporting
          </p>
        </div>

        <div className="flex gap-2">
          <a href="/api/v1/district-admin/export?type=overview" download>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1.5" /> Export District Report (CSV)
            </Button>
          </a>
          <Link href="/super-admin">
            <Button variant="secondary" size="sm">
              <ShieldCheck className="h-4 w-4 mr-1.5" /> Super Admin View
            </Button>
          </Link>
        </div>
      </div>

      {/* Aggregate District KPIs - Direct PostgreSQL Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total District Members</span>
              <Users className="h-4 w-4 text-[#035AFC]" />
            </div>
            <div className="text-3xl font-extrabold text-[#035AFC] mt-1">
              {overview.totalDistrictMembers.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {overview.newRegistrationsThisMonth} new registrations this month
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Operational Chapters</span>
              <Building className="h-4 w-4 text-[#FBC206]" />
            </div>
            <div className="text-3xl font-extrabold text-[#FBC206] mt-1">
              {overview.activeChaptersCount} / {overview.totalChaptersCount}
            </div>
            <p className="text-[11px] text-slate-500">100% active coverage across all 7 taluks</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Review Queue</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {overview.pendingDistrictReviews}
            </div>
            <p className="text-[11px] text-slate-500">
              {overview.approvedMemberships} approved memberships in district
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Community Programs</span>
              <Calendar className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">
              {overview.totalEventsCount} Events
            </div>
            <p className="text-[11px] text-slate-500">
              {overview.upcomingEventsCount} upcoming scheduled conclaves
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Member Classification Intelligence & Dual Distributions */}
      <DistrictClassificationAnalytics initialMembers={initialMembers} />

      {/* Geographical Taluk Breakdown */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Geographical Representation across 7 Taluks</CardTitle>
              <CardDescription className="text-xs">
                Verified member residence and commercial footprint in Malappuram
              </CardDescription>
            </div>
            <Badge variant="neutral">MALAPPURAM GEOGRAPHY</Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {overview.taluks.map((t) => (
              <div key={t.code} className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/30 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">{t.name}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">
                  {t.memberCount}
                </span>
                <span className="text-[9px] text-emerald-600 font-semibold">HQ: {t.headquarters}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 16 Chapters Health and Performance Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Founding Chapters Oversight</CardTitle>
              <CardDescription className="text-xs">
                Real-time operational health, active members, and pending approvals per chapter.
              </CardDescription>
            </div>
            <Link href="/district-admin/chapters">
              <Button variant="ghost" size="sm" className="text-xs">
                Full 16 Chapters Management &rarr;
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-2">Code</th>
                  <th className="py-3 px-2">Chapter Name</th>
                  <th className="py-3 px-2">Taluk</th>
                  <th className="py-3 px-2">Active Members</th>
                  <th className="py-3 px-2">Pending Reviews</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {overview.chapters.map((ch) => (
                  <tr key={ch.code} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-2 font-mono text-[10px] text-slate-400 font-bold">
                      {ch.code}
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">
                      {ch.name}
                    </td>
                    <td className="py-3 px-2 text-slate-500">
                      {ch.taluk}
                    </td>
                    <td className="py-3 px-2 font-semibold">
                      {ch.activeMembersCount}
                    </td>
                    <td className="py-3 px-2">
                      {ch.pendingReviewsCount > 0 ? (
                        <Badge variant="warning" className="text-[9px]">
                          {ch.pendingReviewsCount} pending
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-[10px]">0</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={ch.status === 'ACTIVE' ? 'success' : 'neutral'} className="text-[9px]">
                        {ch.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Link href={`/chapter/${ch.slug}`}>
                        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">
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
