'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Users,
  Search,
  ExternalLink,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { MybfLogo } from '@/components/brand/mybf-logo';

interface ChapterItem {
  id: string;
  code: string;
  name: string;
  slug: string;
  status: string;
  district: { id: string; name: string; code: string };
  activeMembersCount: number;
  applicationsCount: number;
  eventsCount: number;
  leadership: Array<{
    id: string;
    role: string;
    title: string | null;
    fullName: string;
    email: string;
    phone?: string | null;
    startDate: string;
  }>;
}

interface SuperAdminOrganizationsViewProps {
  organization: {
    id: string;
    name: string;
    code: string;
    slug: string;
    isActive: boolean;
    totalChapters: number;
    totalMemberships: number;
  } | null;
  districts: Array<{
    id: string;
    code: string;
    name: string;
    state: string;
    country: string;
    isActive: boolean;
    chaptersCount: number;
  }>;
  chapters: ChapterItem[];
}

export function SuperAdminOrganizationsView({
  organization,
  districts,
  chapters,
}: SuperAdminOrganizationsViewProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const filteredChapters = React.useMemo(() => {
    return chapters.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [chapters, searchTerm, statusFilter]);

  const totalOfficers = chapters.reduce((acc, c) => acc + c.leadership.length, 0);
  const totalActiveMembers = chapters.reduce((acc, c) => acc + c.activeMembersCount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#035AFC]/10 text-[#035AFC]">
              Global Hierarchy
            </span>
            <Badge variant="primary">16 CONSTITUENCY CHAPTERS</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
            Organizations, Districts & Chapter Roster
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Canonical governance over MYBF parent organization, district boundaries, and all 16 Assembly Constituency Chapters.
          </p>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Chapters</span>
              <Layers className="h-4 w-4 text-[#035AFC]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{chapters.length}</span>
              <span className="text-xs text-emerald-600 font-semibold">100% Active</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Malappuram District Assembly Constituencies</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Districts</span>
              <MapPin className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{districts.length}</span>
              <span className="text-xs text-slate-500">MLP (Kerala)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Founding Administrative District</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Appointed Officers</span>
              <Users className="h-4 w-4 text-purple-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totalOfficers}</span>
              <span className="text-xs text-slate-500">Active</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Presidents, Secretaries & Treasurers</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Active Members</span>
              <ShieldCheck className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totalActiveMembers}</span>
              <span className="text-xs text-slate-500">Enrolled</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Verified Digital Member IDs</p>
          </CardContent>
        </Card>
      </div>

      {/* Parent Organization & District Architecture Card */}
      <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MybfLogo size="sm" />
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  {organization?.name || 'Malappuram Youth Business Forum'}
                </CardTitle>
                <CardDescription className="text-xs">
                  Canonical Code: {organization?.code || 'MYBF'} • Jurisdiction: {districts[0]?.name || 'Malappuram'}, {districts[0]?.state || 'Kerala'}, India
                </CardDescription>
              </div>
            </div>
            <Badge variant="success">ROOT REGISTERED</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Chapters Roster */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                16 Constituency Chapters Roster
              </CardTitle>
              <CardDescription className="text-xs">
                Real database records linked to Chapter Executive Hubs and regional application workflows
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search chapter or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#035AFC] w-56"
                />
              </div>

              <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 text-xs bg-slate-50 dark:bg-slate-900">
                {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      statusFilter === filter
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Chapter Code & Name</th>
                  <th className="py-3 px-4">Constituency Jurisdiction</th>
                  <th className="py-3 px-4">Current Leadership</th>
                  <th className="py-3 px-4 text-center">Active Members</th>
                  <th className="py-3 px-4 text-center">Applications</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredChapters.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No chapters found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredChapters.map((chapter) => {
                    const president = chapter.leadership.find((l) => l.role === 'PRESIDENT');
                    const secretary = chapter.leadership.find((l) => l.role === 'SECRETARY');

                    return (
                      <tr
                        key={chapter.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#035AFC] flex items-center justify-center font-bold text-xs">
                              {chapter.code.replace('CHP-', '').split('-')[0] || 'CH'}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white">
                                {chapter.name}
                              </p>
                              <span className="font-mono text-[10px] text-slate-400">
                                {chapter.code}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {chapter.district.name} District
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Slug: /{chapter.slug}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {chapter.leadership.length === 0 ? (
                            <span className="text-[11px] text-amber-500 font-medium">
                              Vacant (Pending Appointees)
                            </span>
                          ) : (
                            <div className="space-y-1">
                              {president && (
                                <p className="text-[11px] text-slate-800 dark:text-slate-200">
                                  <span className="font-semibold text-slate-500">Pres:</span>{' '}
                                  {president.fullName}
                                </p>
                              )}
                              {secretary && (
                                <p className="text-[11px] text-slate-800 dark:text-slate-200">
                                  <span className="font-semibold text-slate-500">Sec:</span>{' '}
                                  {secretary.fullName}
                                </p>
                              )}
                              {!president && !secretary && (
                                <p className="text-[11px] text-slate-500">
                                  {chapter.leadership[0]?.role}: {chapter.leadership[0]?.fullName}
                                </p>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center font-semibold text-slate-900 dark:text-white">
                          {chapter.activeMembersCount}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {chapter.applicationsCount}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <Badge
                            variant={chapter.status === 'ACTIVE' ? 'success' : 'secondary'}
                            className="text-[10px]"
                          >
                            {chapter.status}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/chapter/${chapter.slug}`} target="_blank">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2.5 text-[11px]"
                                title="Open Chapter Executive Hub"
                              >
                                Hub <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                            <Link href="/super-admin/roles">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-7 px-2.5 text-[11px]"
                                title="Manage Chapter Leadership"
                              >
                                Officers
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
