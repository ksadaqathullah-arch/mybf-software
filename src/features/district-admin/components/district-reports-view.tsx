'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-[#035AFC]" /> Growth Analytics & Reports
            </h1>
            <Badge variant="primary">{analytics.districtCode} DISTRICT</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative district analytics: monthly trends, chapter benchmarking, and demographic distributions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-8 text-xs font-semibold">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export Full Report (CSV)
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Active Membership</span>
            <div className="text-2xl font-black text-[#035AFC] mt-1">
              {analytics.totalActiveMembers.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500">Across 16 constituency chapters</p>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Approved</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {analytics.totalApprovedApplications.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500">Super Admin approved records</p>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Pending Review Queue</span>
            <div className="text-2xl font-black text-amber-500 mt-1">
              {analytics.totalPendingApplications}
            </div>
            <p className="text-[11px] text-slate-500">Applications under review</p>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">16 Chapters</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              100%
            </div>
            <p className="text-[11px] text-slate-500">Constituency representation</p>
          </CardHeader>
        </Card>
      </div>

      {/* Monthly Timeline & Chapter Benchmarking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Registration Timeline */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#035AFC]" /> Monthly Registration Momentum
            </CardTitle>
            <CardDescription className="text-xs">
              Chronological applicant registrations across Malappuram district
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            {analytics.monthlyTimeline.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No timeline records available.</span>
            ) : (
              analytics.monthlyTimeline.map((item) => (
                <div key={item.month} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{item.month}</span>
                    <span className="font-bold text-[#035AFC]">{item.count} registrations</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-[#035AFC] rounded-full"
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
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#FBC206]" /> 16 Chapter Benchmarking
            </CardTitle>
            <CardDescription className="text-xs">
              Active verified members and pending review throughput
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="overflow-y-auto max-h-[300px]">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2">Constituency</th>
                    <th className="py-2 text-center">Active Members</th>
                    <th className="py-2 text-right">Pending Reviews</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {analytics.chapterComparisons.map((c) => (
                    <tr key={c.code} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-2">
                        <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-1">({c.code})</span>
                      </td>
                      <td className="py-2 text-center font-extrabold text-[#035AFC]">
                        {c.activeMembers}
                      </td>
                      <td className="py-2 text-right">
                        {c.pendingReviews > 0 ? (
                          <Badge variant="warning" className="text-[9px]">
                            {c.pendingReviews}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-[10px]">0</span>
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
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-[#035AFC]" /> Member Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            {analytics.categoryDistribution.map((cg) => {
              const label = cg.category === 'UNCLASSIFIED' ? 'Unclassified (Historical)' : getMemberCategoryLabel(cg.category as any);
              const pct = Math.round((cg.count / totalMembers) * 100);

              return (
                <div key={cg.category} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
                    <span className="font-mono text-slate-500 font-semibold">
                      {cg.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Position Breakdown */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#FBC206]" /> Current Position Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            {analytics.positionDistribution.map((pg) => {
              const label = pg.position === 'UNCLASSIFIED' ? 'Unclassified (Historical)' : getCurrentPositionLabel(pg.position as any);
              const pct = Math.round((pg.count / totalMembers) * 100);

              return (
                <div key={pg.position} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
                    <span className="font-mono text-slate-500 font-semibold">
                      {pg.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
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
