'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageHeader, PortalStatCard } from '@/components/ui/portal-elements';
import {
  Building2,
  Search,
  Users,
  Clock,
  Calendar,
  ExternalLink,
  Download,
  Filter,
  UserCheck,
  Phone,
  Mail,
  X,
  MapPin,
} from 'lucide-react';
import { TALUKS_OF_MALAPPURAM } from '@/features/geography/constants/malappuram-geo';

export interface ChapterData {
  id: string;
  code: string;
  name: string;
  slug: string;
  status: string;
  taluk: string;
  activeMembersCount: number;
  pendingApplicationsCount: number;
  eventsCount: number;
  meetingsCount: number;
  leadership: Array<{
    id: string;
    role: string;
    title: string | null;
    fullName: string;
    email: string;
    phone: string | null;
    startDate: string;
  }>;
}

interface DistrictChaptersViewProps {
  chapters: ChapterData[];
}

export function DistrictChaptersView({ chapters }: DistrictChaptersViewProps) {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [talukFilter, setTalukFilter] = React.useState('ALL');
  const [selectedChapter, setSelectedChapter] = React.useState<ChapterData | null>(null);

  // Filtered chapters
  const filteredChapters = React.useMemo(() => {
    return chapters.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (talukFilter !== 'ALL' && c.taluk.toLowerCase() !== talukFilter.toLowerCase()) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesCode = c.code.toLowerCase().includes(q);
        const matchesTaluk = c.taluk.toLowerCase().includes(q);
        const matchesOfficer = c.leadership.some((l) => l.fullName.toLowerCase().includes(q));
        if (!matchesName && !matchesCode && !matchesTaluk && !matchesOfficer) return false;
      }
      return true;
    });
  }, [chapters, search, statusFilter, talukFilter]);

  // Aggregate stats
  const totalActive = chapters.filter((c) => c.status === 'ACTIVE').length;
  const totalMembers = chapters.reduce((sum, c) => sum + c.activeMembersCount, 0);
  const totalPending = chapters.reduce((sum, c) => sum + c.pendingApplicationsCount, 0);

  // Client-side CSV export of 16 chapters
  const handleExportCsv = () => {
    const headers = [
      'Chapter Code',
      'Chapter Name',
      'Slug',
      'Taluk',
      'Status',
      'Active Members',
      'Pending Applications',
      'Events Count',
      'Meetings Count',
      'Key Officers',
    ];

    const rows = filteredChapters.map((c) => [
      c.code,
      `"${c.name.replace(/"/g, '""')}"`,
      c.slug,
      c.taluk,
      c.status,
      c.activeMembersCount,
      c.pendingApplicationsCount,
      c.eventsCount,
      c.meetingsCount,
      `"${c.leadership.map((l) => `${l.role}: ${l.fullName}`).join('; ').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MYBF_Malappuram_16_Chapters_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PortalPageHeader
        tag="16 OF 16 CONSTITUENCIES"
        badge="District Administration"
        title="16 Assembly Constituency Chapters"
        description="Authoritative chapter governance, leadership roster, membership counts, and executive hub oversight."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-8 text-xs font-semibold">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export Chapters (CSV)
            </Button>
            <a href="/chapters" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm" className="h-8 text-xs font-semibold">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Public Directory
              </Button>
            </a>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PortalStatCard
          label="Total Constituencies"
          value={`${chapters.length} Chapters`}
          subValue={`${totalActive} Operational / Active`}
          icon={Building2}
        />

        <PortalStatCard
          label="Total Active Members"
          value={totalMembers.toLocaleString()}
          subValue="Across 16 constituency chapters"
          icon={Users}
        />

        <PortalStatCard
          label="Pending Approvals Queue"
          value={totalPending}
          subValue="Applications under chapter review"
          icon={Clock}
        />

        <PortalStatCard
          label="Geographic Coverage"
          value="7 Taluks"
          subValue="100% Malappuram district presence"
          icon={MapPin}
        />
      </div>

      {/* Search & Filter Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-ink/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chapter name, code, or officer..."
                className="w-full pl-9 pr-3 py-1.5 border-2 border-ink bg-paper text-xs text-ink font-serif focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </div>

            {/* Taluk Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-ink/60 shrink-0" />
              <select
                value={talukFilter}
                onChange={(e) => setTalukFilter(e.target.value)}
                aria-label="Filter by Taluk"
                className="w-full border-2 border-ink bg-paper px-2.5 py-1.5 text-xs text-ink font-display font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue"
              >
                <option value="ALL">All Taluks (7)</option>
                {TALUKS_OF_MALAPPURAM.map((t) => (
                  <option key={t.code} value={t.name}>
                    {t.name} Taluk
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by Chapter Status"
                className="w-full border-2 border-ink bg-paper px-2.5 py-1.5 text-xs text-ink font-display font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapters Table */}
      <Card>
        <CardHeader className="p-5 pb-3 border-b-2 border-ink flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl font-black font-display uppercase tracking-wider text-ink">16 Chapters Operational Registry</CardTitle>
            <CardDescription className="text-xs text-ink/70 font-serif mt-1">
              Authoritative database records for Malappuram district constituency chapters
            </CardDescription>
          </div>
          <span className="text-[10px] font-bold text-ink/60 font-mono uppercase bg-paper-sunken border border-ink/20 px-2 py-1">
            Showing {filteredChapters.length} of {chapters.length} Chapters
          </span>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="border-b-2 border-ink bg-paper-sunken text-ink font-display font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Constituency Chapter</th>
                  <th className="py-3 px-4">Taluk</th>
                  <th className="py-3 px-4 text-center">Active Members</th>
                  <th className="py-3 px-4 text-center">Pending Reviews</th>
                  <th className="py-3 px-4 text-center">Activities</th>
                  <th className="py-3 px-4">Appointed Officers</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 font-mono text-[11px]">
                {filteredChapters.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-ink/50 font-serif italic text-sm">
                      No chapters match the selected search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredChapters.map((ch) => (
                    <tr key={ch.id} className="hover:bg-yellow/10 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-ink/60">
                        {ch.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-ink font-sans text-xs">
                          {ch.name}
                        </div>
                        <div className="text-[10px] text-ink/60 font-mono">
                          slug: {ch.slug}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-ink/80 font-serif font-medium">
                        {ch.taluk}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-black text-ink text-sm">
                          {ch.activeMembersCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {ch.pendingApplicationsCount > 0 ? (
                          <Badge variant="warning" className="text-[10px]">
                            {ch.pendingApplicationsCount} Pending
                          </Badge>
                        ) : (
                          <span className="text-ink/40 text-[10px]">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-[10px] text-ink/70 font-serif">
                        <div>{ch.eventsCount} Events</div>
                        <div>{ch.meetingsCount} Meetings</div>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        {ch.leadership.length > 0 ? (
                          <div className="space-y-0.5">
                            {ch.leadership.slice(0, 2).map((lead) => (
                              <div key={lead.id} className="text-[11px] flex items-center gap-1 text-ink">
                                <span className="font-black text-[10px] text-ink/60 font-display uppercase">{lead.role}:</span>
                                <span className="font-medium">{lead.fullName}</span>
                              </div>
                            ))}
                            {ch.leadership.length > 2 && (
                              <span className="text-[9px] text-blue font-bold font-display uppercase tracking-wider">
                                +{ch.leadership.length - 2} more officers
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-ink/40 text-[10px] italic font-serif">Not Appointed</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={ch.status === 'ACTIVE' ? 'success' : 'neutral'} className="text-[10px]">
                          {ch.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedChapter(ch)}
                            className="h-7 text-[10px] px-2.5 font-semibold"
                          >
                            Details
                          </Button>
                          <Link href={`/chapter/${ch.slug}`}>
                            <Button variant="secondary" size="sm" className="h-7 text-[10px] px-2.5 font-semibold">
                              Portal &rarr;
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Chapter Details Modal */}
      {selectedChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl bg-paper border-2 border-ink shadow-[8px_8px_0px_#14161c] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b-2 border-ink flex items-center justify-between bg-paper-sunken">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black font-display uppercase tracking-wider text-ink">
                    {selectedChapter.name}
                  </h3>
                  <Badge variant="primary">{selectedChapter.code}</Badge>
                  <Badge variant={selectedChapter.status === 'ACTIVE' ? 'success' : 'neutral'}>
                    {selectedChapter.status}
                  </Badge>
                </div>
                <p className="text-xs text-ink/70 font-serif mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-ink/60" /> Taluk: {selectedChapter.taluk} | Slug: {selectedChapter.slug}
                </p>
              </div>
              <button
                onClick={() => setSelectedChapter(null)}
                className="border-2 border-ink p-1 bg-paper text-ink hover:bg-yellow shadow-[1px_1px_0px_#14161c] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="border-2 border-ink p-3 bg-paper shadow-[2px_2px_0px_#14161c]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-ink/60 font-display">Members</span>
                  <div className="text-2xl font-black text-ink mt-0.5 font-mono">
                    {selectedChapter.activeMembersCount}
                  </div>
                </div>
                <div className="border-2 border-ink p-3 bg-paper shadow-[2px_2px_0px_#14161c]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-ink/60 font-display">Pending</span>
                  <div className="text-2xl font-black text-amber-600 mt-0.5 font-mono">
                    {selectedChapter.pendingApplicationsCount}
                  </div>
                </div>
                <div className="border-2 border-ink p-3 bg-paper shadow-[2px_2px_0px_#14161c]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-ink/60 font-display">Events</span>
                  <div className="text-2xl font-black text-emerald-700 mt-0.5 font-mono">
                    {selectedChapter.eventsCount}
                  </div>
                </div>
                <div className="border-2 border-ink p-3 bg-paper shadow-[2px_2px_0px_#14161c]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-ink/60 font-display">Meetings</span>
                  <div className="text-2xl font-black text-purple-700 mt-0.5 font-mono">
                    {selectedChapter.meetingsCount}
                  </div>
                </div>
              </div>

              {/* Leadership Roster */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider font-display text-ink mb-2 flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-blue" /> Appointed Chapter Leadership
                </h4>
                {selectedChapter.leadership.length === 0 ? (
                  <p className="text-xs text-ink/50 italic py-2 font-serif">
                    No active chapter officers currently appointed in database records.
                  </p>
                ) : (
                  <div className="divide-y-2 divide-ink border-2 border-ink">
                    {selectedChapter.leadership.map((l) => (
                      <div key={l.id} className="p-3 text-xs flex items-center justify-between bg-paper">
                        <div>
                          <div className="font-bold text-ink font-sans">
                            {l.fullName}
                          </div>
                          <div className="text-[10px] text-ink/70 flex items-center gap-3 mt-0.5 font-mono">
                            {l.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-ink/40" /> {l.email}
                              </span>
                            )}
                            {l.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-ink/40" /> {l.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="primary" className="text-[10px]">
                          {l.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Navigation Links */}
              <div className="pt-2 flex flex-wrap gap-2">
                <Link href={`/district-admin/members?chapterSlug=${selectedChapter.slug}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Users className="h-3.5 w-3.5 mr-1" /> View Members ({selectedChapter.activeMembersCount})
                  </Button>
                </Link>
                <Link href={`/district-admin/applications?chapterId=${selectedChapter.id}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Clock className="h-3.5 w-3.5 mr-1" /> Review Queue ({selectedChapter.pendingApplicationsCount})
                  </Button>
                </Link>
                <Link href={`/chapter/${selectedChapter.slug}`}>
                  <Button variant="primary" size="sm" className="text-xs">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open Chapter Executive Hub
                  </Button>
                </Link>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t-2 border-ink bg-paper-sunken text-right">
              <Button variant="outline" size="sm" onClick={() => setSelectedChapter(null)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
