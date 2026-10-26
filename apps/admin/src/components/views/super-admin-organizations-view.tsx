'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageHeader, PortalStatCard } from '@/components/ui/portal-elements';
import {
  MapPin,
  Users,
  Search,
  ExternalLink,
  ShieldCheck,
  Shield,
  Layers,
} from 'lucide-react';
import { MybfLogo } from '@/components/brand/mybf-logo';
import {
  SuperAdminManageOfficersDialog,
  UserCandidate,
} from './super-admin-manage-officers-dialog';
import { getMainAppBaseUrl } from '@/lib/main-app-url';

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
  eligibleUsers?: UserCandidate[];
  mainAppBaseUrl?: string;
}

export function SuperAdminOrganizationsView({
  organization,
  districts,
  chapters,
  eligibleUsers,
  mainAppBaseUrl,
}: SuperAdminOrganizationsViewProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [managingChapter, setManagingChapter] = React.useState<ChapterItem | null>(null);

  const resolvedBaseUrl = mainAppBaseUrl || getMainAppBaseUrl();

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
      <PortalPageHeader
        badge="Global Hierarchy"
        tag="16 Constituency Chapters"
        title="Organizations, Districts & Chapter Roster"
        description="Canonical governance over MYBF parent organization, district boundaries, and all 16 Assembly Constituency Chapters."
      />

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <PortalStatCard
          label="Chapters"
          value={chapters.length}
          subValue="100% Active"
          detail="Malappuram Assembly Constituencies"
          icon={Layers}
        />
        <PortalStatCard
          label="Districts"
          value={districts.length}
          subValue="MLP (Kerala)"
          detail="Founding Administrative District"
          icon={MapPin}
          accent="yellow"
        />
        <PortalStatCard
          label="Appointed Officers"
          value={totalOfficers}
          subValue="Active"
          detail="Presidents, Secretaries & Treasurers"
          icon={Users}
          accent="blue"
        />
        <PortalStatCard
          label="Active Members"
          value={totalActiveMembers}
          subValue="Enrolled"
          detail="Verified Digital Member IDs"
          icon={ShieldCheck}
          accent="emerald"
        />
      </div>

      {/* Parent Organization & District Architecture Card */}
      <div className="border-2 border-ink bg-paper p-6 shadow-[4px_4px_0px_#14161c]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <MybfLogo size="sm" />
            <div>
              <h3 className="font-sans font-bold text-lg text-ink tracking-tight">
                {organization?.name || 'Malappuram Youth Business Forum'}
              </h3>
              <p className="font-sans text-xs text-muted mt-0.5">
                Canonical Code: <strong className="text-ink">{organization?.code || 'MYBF'}</strong> • Jurisdiction: {districts[0]?.name || 'Malappuram'}, {districts[0]?.state || 'Kerala'}, India
              </p>
            </div>
          </div>
          <Badge variant="secondary">Root Registered NGO</Badge>
        </div>
      </div>

      {/* Chapters Roster */}
      <Card className="border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c]">
        <CardHeader className="p-5 sm:p-6 pb-4 border-b-2 border-ink bg-paper-2/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-sans font-bold text-xl text-ink tracking-tight">
                16 Constituency Chapters Roster
              </CardTitle>
              <CardDescription className="font-sans text-xs sm:text-sm text-muted">
                Real database records linked to Chapter Executive Hubs and regional application workflows.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search chapter or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs border-2 border-ink bg-white text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-yellow font-sans shadow-[2px_2px_0px_#14161c] w-56"
                />
              </div>

              <div className="flex border-2 border-ink p-0.5 bg-paper-2">
                {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1 font-sans text-xs font-semibold tracking-normal transition-colors cursor-pointer ${
                      statusFilter === filter
                        ? 'bg-ink text-paper shadow-[2px_2px_0px_#fcc000]'
                        : 'text-ink hover:bg-ink/10'
                    }`}
                  >
                    {filter === 'ALL' ? 'All' : filter === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b-2 border-ink bg-ink text-paper font-sans text-xs font-semibold tracking-wide">
                <tr>
                  <th className="py-3 px-4 text-paper">Chapter Code & Name</th>
                  <th className="py-3 px-4 text-paper">Constituency Jurisdiction</th>
                  <th className="py-3 px-4 text-paper">Current Leadership</th>
                  <th className="py-3 px-4 text-center text-paper">Active Members</th>
                  <th className="py-3 px-4 text-center text-paper">Applications</th>
                  <th className="py-3 px-4 text-center text-paper">Status</th>
                  <th className="py-3 px-4 text-right text-paper">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/15 font-sans">
                {filteredChapters.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted font-serif">
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
                        className="hover:bg-yellow/15 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-ink">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-blue text-paper border-2 border-ink flex items-center justify-center font-sans font-bold text-xs shadow-[1px_1px_0px_#14161c]">
                              {chapter.code.replace('CHP-', '').split('-')[0] || 'CH'}
                            </div>
                            <div>
                              <p className="font-sans font-bold text-sm text-ink">
                                {chapter.name}
                              </p>
                              <span className="font-mono text-[10px] text-muted font-bold">
                                {chapter.code}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-ink">
                            {chapter.district.name} District
                          </p>
                          <span className="text-[10px] text-muted font-mono">
                            /{chapter.slug}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {chapter.leadership.length === 0 ? (
                            <span className="font-sans text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 border border-amber-700">
                              Vacant
                            </span>
                          ) : (
                            <div className="space-y-0.5 font-sans text-xs">
                              {president && (
                                <p className="text-ink">
                                  <strong className="font-sans font-bold text-muted">Pres:</strong>{' '}
                                  {president.fullName}
                                </p>
                              )}
                              {secretary && (
                                <p className="text-ink">
                                  <strong className="font-sans font-bold text-muted">Sec:</strong>{' '}
                                  {secretary.fullName}
                                </p>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center font-sans font-bold text-sm text-ink">
                          {chapter.activeMembersCount}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-xs bg-yellow/30 px-2 py-0.5 border border-ink">
                            {chapter.applicationsCount}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <Badge variant={chapter.status === 'ACTIVE' ? 'success' : 'neutral'}>
                            {chapter.status}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setManagingChapter(chapter)}
                              className="h-7 text-xs px-2.5 font-sans font-semibold tracking-normal"
                            >
                              <Shield className="h-3 w-3 mr-1 text-ink" /> Manage Officers
                            </Button>
                            <a
                              href={`${resolvedBaseUrl}/chapter/${encodeURIComponent(chapter.slug.toLowerCase())}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center font-sans font-semibold tracking-normal border-2 border-ink transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow cursor-pointer shadow-[2px_2px_0px_#14161c] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 bg-paper text-ink hover:bg-ink hover:text-paper h-7 px-2.5 text-xs"
                              title={`Open ${chapter.name} Executive Hub on Main Application (new tab)`}
                            >
                              Chapter Hub <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Smartphone Card View (< md) */}
          <div className="md:hidden space-y-3 p-3">
            {filteredChapters.length === 0 ? (
              <div className="py-8 text-center text-muted font-serif">
                No chapters found matching filter criteria.
              </div>
            ) : (
              filteredChapters.map((chapter) => {
                const president = chapter.leadership.find((l) => l.role === 'PRESIDENT');
                const secretary = chapter.leadership.find((l) => l.role === 'SECRETARY');

                return (
                  <div
                    key={chapter.id}
                    className="border-2 border-ink bg-white p-4 shadow-[3px_3px_0px_#14161c] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 bg-blue text-paper border-2 border-ink flex items-center justify-center font-sans font-bold text-xs shadow-[1px_1px_0px_#14161c] shrink-0">
                          {chapter.code.replace('CHP-', '').split('-')[0] || 'CH'}
                        </div>
                        <div>
                          <h4 className="font-sans font-bold text-base text-ink leading-tight">
                            {chapter.name}
                          </h4>
                          <span className="font-mono text-[10px] text-muted font-bold block">
                            {chapter.code} • /{chapter.slug}
                          </span>
                        </div>
                      </div>
                      <Badge variant={chapter.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {chapter.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-ink/10 py-2.5">
                      <div>
                        <span className="text-muted block text-[11px]">Active Members</span>
                        <span className="font-bold text-ink text-sm">{chapter.activeMembersCount}</span>
                      </div>
                      <div>
                        <span className="text-muted block text-[11px]">Applications</span>
                        <span className="font-mono font-bold text-xs bg-yellow/30 px-2 py-0.5 border border-ink inline-block">
                          {chapter.applicationsCount}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted block text-[11px]">Leadership</span>
                        {chapter.leadership.length === 0 ? (
                          <span className="font-sans text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 border border-amber-700 inline-block mt-0.5">
                            Vacant (No Officers Appointed)
                          </span>
                        ) : (
                          <div className="space-y-0.5 text-xs text-ink mt-0.5">
                            {president && (
                              <p>
                                <strong className="text-muted">President:</strong> {president.fullName}
                              </p>
                            )}
                            {secretary && (
                              <p>
                                <strong className="text-muted">Secretary:</strong> {secretary.fullName}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Touch Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setManagingChapter(chapter)}
                        className="min-h-11 text-xs font-semibold px-2.5 shadow-[2px_2px_0px_#14161c]"
                      >
                        <Shield className="h-3.5 w-3.5 mr-1 text-ink" /> Manage Officers
                      </Button>
                      <a
                        href={`${resolvedBaseUrl}/chapter/${encodeURIComponent(chapter.slug.toLowerCase())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-11 inline-flex items-center justify-center font-sans font-semibold tracking-normal border-2 border-ink transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow cursor-pointer shadow-[2px_2px_0px_#14161c] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 bg-paper text-ink hover:bg-ink hover:text-paper px-2.5 text-xs text-center"
                        title={`Open ${chapter.name} Executive Hub on Main Application (new tab)`}
                      >
                        Chapter Hub <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Central Chapter Officer Management Dialog */}
      {managingChapter && (
        <SuperAdminManageOfficersDialog
          chapter={managingChapter}
          eligibleUsers={eligibleUsers || []}
          onClose={() => setManagingChapter(null)}
          onOfficerChange={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
