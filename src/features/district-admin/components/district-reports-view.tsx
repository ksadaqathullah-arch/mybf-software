'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageHeader, PortalStatCard } from '@/components/ui/portal-elements';
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  Building2,
  Calendar,
  Award,
  Briefcase,
  Layers,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  getMemberCategoryLabel,
  getCurrentPositionLabel,
} from '@/features/memberships/constants/member-classifications';

export interface DistrictAnalyticsData {
  districtName: string;
  districtCode: string;
  totalActiveMembers: number;
  totalPendingApplications: number;
  totalApprovedApplications: number;
  categoryDistribution: Array<{ category: string; count: number }>;
  positionDistribution: Array<{ position: string; count: number }>;
  chapterComparisons: Array<{
    code: string;
    name: string;
    slug: string;
    activeMembers: number;
    pendingReviews: number;
  }>;
  monthlyTimeline: Array<{ month: string; count: number }>;
}

interface DistrictReportsViewProps {
  analytics: DistrictAnalyticsData;
}

export function DistrictReportsView({ analytics }: DistrictReportsViewProps) {
  const handleExportCsv = () => {
    const lines = [
      `"MYBF District Growth Analytics Report"`,
      `"District: ${analytics.districtName} (${analytics.districtCode})"`,
      `"Generated At: ${new Date().toISOString()}"`,
      `"Total Active Members: ${analytics.totalActiveMembers}"`,
      `"Total Pending Applications: ${analytics.totalPendingApplications}"`,
      `"Total Approved Memberships: ${analytics.totalApprovedApplications}"`,
      ``,
      `"Chapter Comparisons"`,
      `"Code","Chapter Name","Active Members","Pending Reviews"`,
      ...analytics.chapterComparisons.map(
        (c) => `"${c.code}","${c.name}",${c.activeMembers},${c.pendingReviews}`
      ),
      ``,
      `"Member Category Distribution"`,
      `"Category","Member Count"`,
      ...analytics.categoryDistribution.map((cg) => `"${cg.category}",${cg.count}`),
      ``,
      `"Current Position Distribution"`,
      `"Position","Member Count"`,
      ...analytics.positionDistribution.map((pg) => `"${pg.position}",${pg.count}`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MYBF_District_Growth_Analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalMembers = analytics.totalActiveMembers || 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PortalPageHeader
        tag={`${analytics.districtCode} DISTRICT`}
        badge="Analytics Engine"
        title="Growth Analytics & Reports"
        description="Authoritative district analytics: monthly trends, chapter benchmarking, and demographic distributions."
        actions={
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-8 text-xs font-semibold">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export Full Report (CSV)
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PortalStatCard
          label="Active Membership"
          value={analytics.totalActiveMembers.toLocaleString()}
          subValue="Across 16 constituency chapters"
          icon={Users}
        />

        <PortalStatCard
          label="Total Approved"
          value={analytics.totalApprovedApplications.toLocaleString()}
          subValue="Super Admin approved records"
          icon={ShieldCheck}
        />

        <PortalStatCard
          label="Pending Review Queue"
          value={analytics.totalPendingApplications}
          subValue="Applications under review"
          icon={Clock}
        />

        <PortalStatCard
          label="16 Chapters"
          value="100%"
          subValue="Constituency representation"
          icon={Building2}
        />
      </div>

      {/* Monthly Timeline & Chapter Benchmarking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Registration Timeline */}
        <Card>
          <CardHeader className="p-5 pb-3 border-b-2 border-ink">
            <CardTitle className="text-base font-black font-display uppercase tracking-wider text-ink flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue" /> Monthly Registration Momentum
            </CardTitle>
            <CardDescription className="text-xs text-ink/70 font-serif mt-1">
              Chronological applicant registrations across Malappuram district
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {analytics.monthlyTimeline.length === 0 ? (
              <span className="text-xs text-ink/50 italic font-serif">No timeline records available.</span>
            ) : (
              analytics.monthlyTimeline.map((item) => (
                <div key={item.month} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-mono text-ink font-bold">{item.month}</span>
                    <span className="font-bold text-blue font-mono">{item.count} registrations</span>
                  </div>
                  <div className="h-2.5 w-full bg-paper-sunken border border-ink/20 overflow-hidden">
                    <div
                      className="h-full bg-blue transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.round((item.count / Math.max(...analytics.monthlyTimeline.map((m) => m.count))) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chapter Comparison Ranking */}
        <Card>
          <CardHeader className="p-5 pb-3 border-b-2 border-ink">
            <CardTitle className="text-base font-black font-display uppercase tracking-wider text-ink flex items-center gap-2">
              <Building2 className="h-5 w-5 text-yellow" /> 16 Chapter Benchmarking
            </CardTitle>
            <CardDescription className="text-xs text-ink/70 font-serif mt-1">
              Active verified members and pending review throughput
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto max-h-[300px]">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="border-b-2 border-ink bg-paper-sunken text-ink font-display font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Constituency</th>
                    <th className="py-2.5 px-4 text-center">Active Members</th>
                    <th className="py-2.5 px-4 text-right">Pending Reviews</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10 font-mono text-[11px]">
                  {analytics.chapterComparisons.map((c) => (
                    <tr key={c.code} className="hover:bg-yellow/10 transition-colors">
                      <td className="py-2.5 px-4 font-sans">
                        <span className="font-bold text-ink">{c.name}</span>
                        <span className="text-[10px] text-ink/60 font-mono ml-1">({c.code})</span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-black text-ink text-sm">
                        {c.activeMembers}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {c.pendingReviews > 0 ? (
                          <Badge variant="warning" className="text-[9px]">
                            {c.pendingReviews}
                          </Badge>
                        ) : (
                          <span className="text-ink/40 text-[10px]">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographic Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader className="p-5 pb-3 border-b-2 border-ink">
            <CardTitle className="text-base font-black font-display uppercase tracking-wider text-ink flex items-center gap-2">
              <Award className="h-5 w-5 text-blue" /> Member Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {analytics.categoryDistribution.map((cg) => {
              const label = cg.category === 'UNCLASSIFIED' ? 'Unclassified (Historical)' : getMemberCategoryLabel(cg.category as any);
              const pct = Math.round((cg.count / totalMembers) * 100);

              return (
                <div key={cg.category} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium text-ink font-serif">{label}</span>
                    <span className="font-mono text-ink font-bold">
                      {cg.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-paper-sunken border border-ink/20 overflow-hidden">
                    <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Position Breakdown */}
        <Card>
          <CardHeader className="p-5 pb-3 border-b-2 border-ink">
            <CardTitle className="text-base font-black font-display uppercase tracking-wider text-ink flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-yellow" /> Current Position Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {analytics.positionDistribution.map((pg) => {
              const label = pg.position === 'UNCLASSIFIED' ? 'Unclassified (Historical)' : getCurrentPositionLabel(pg.position as any);
              const pct = Math.round((pg.count / totalMembers) * 100);

              return (
                <div key={pg.position} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium text-ink font-serif">{label}</span>
                    <span className="font-mono text-ink font-bold">
                      {pg.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-paper-sunken border border-ink/20 overflow-hidden">
                    <div className="h-full bg-yellow transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
