import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';
import { TALUKS_OF_MALAPPURAM } from '@/features/geography/constants/malappuram-geo';
import { DistrictClassificationAnalytics } from '@/features/memberships/components/district-classification-analytics';

export default function DistrictAdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Malappuram District Administration
            </h1>
            <Badge variant="primary">DISTRICT CODE: MLP</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central governance, 16 chapter aggregation, geographical distribution and financial reconciliation
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1.5" /> Export District Report (CSV)
          </Button>
          <Link href="/super-admin">
            <Button variant="secondary" size="sm">
              Super Admin View
            </Button>
          </Link>
        </div>
      </div>

      {/* Aggregate District KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total District Members</span>
            <div className="text-3xl font-extrabold text-[#035AFC] mt-1">2,480</div>
            <p className="text-[11px] text-emerald-600 font-medium">+14% month-over-month</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Operational Chapters</span>
            <div className="text-3xl font-extrabold text-[#FBC206] mt-1">16 / 16</div>
            <p className="text-[11px] text-slate-500">100% active coverage in 7 taluks</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Review Queue</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">18</div>
            <p className="text-[11px] text-slate-500">Across all chapter officers</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Community Programs</span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">48 Summits</div>
            <p className="text-[11px] text-slate-500">100% Free NGO community events</p>
          </CardHeader>
        </Card>
      </div>

      {/* Member Classification Intelligence & Dual Distributions */}
      <DistrictClassificationAnalytics />

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
            {TALUKS_OF_MALAPPURAM.map((t, idx) => (
              <div key={t.code} className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/30 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">{t.name}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">
                  {300 + idx * 45}
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
            <Link href="/chapters">
              <Button variant="ghost" size="sm" className="text-xs">
                Public Directory &rarr;
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
                  <th className="py-3 px-2">Health</th>
                  <th className="py-3 px-2 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {INITIAL_16_CHAPTERS.map((ch, idx) => (
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
                      {120 + ((idx * 17) % 60)}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="success" className="text-[9px]">
                        OPTIMAL
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
