'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Search,
  Filter,
  Download,
  Building2,
  MapPin,
  Award,
  Briefcase,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';
import { TALUKS_OF_MALAPPURAM } from '@/features/geography/constants/malappuram-geo';
import {
  MEMBER_CATEGORIES,
  CURRENT_POSITIONS,
  getMemberCategoryLabel,
  getCurrentPositionLabel,
} from '@/features/memberships/constants/member-classifications';
import {
  getExpectationLabel,
  getTalentLabel,
  getParticipationPreferenceLabel,
} from '@/features/memberships/constants/youth-discovery';

export interface DistrictMemberItem {
  id: string;
  membershipNumber: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  chapterName: string;
  chapterCode: string;
  chapterSlug: string;
  taluk: string;
  memberCategory: string | null;
  currentPosition: string | null;
  occupation: string | null;
  companyName: string | null;
  status: string;
  joinedDate: string;
  expectations: string[];
  talents: string[];
  participationPreferences: string[];
}

interface DistrictMembersViewProps {
  initialMembers: DistrictMemberItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function DistrictMembersView({
  initialMembers,
  total,
  page,
  pageSize,
  totalPages,
}: DistrictMembersViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get('search') || '');
  const [chapterSlug, setChapterSlug] = React.useState(searchParams.get('chapterSlug') || 'ALL');
  const [taluk, setTaluk] = React.useState(searchParams.get('taluk') || 'ALL');
  const [category, setCategory] = React.useState(searchParams.get('category') || 'ALL');
  const [position, setPosition] = React.useState(searchParams.get('position') || 'ALL');
  const [status, setStatus] = React.useState(searchParams.get('status') || 'ALL');

  const [selectedMember, setSelectedMember] = React.useState<DistrictMemberItem | null>(null);

  const applyFilters = (newPage = 1) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (chapterSlug !== 'ALL') params.set('chapterSlug', chapterSlug);
    if (taluk !== 'ALL') params.set('taluk', taluk);
    if (category !== 'ALL') params.set('category', category);
    if (position !== 'ALL') params.set('position', position);
    if (status !== 'ALL') params.set('status', status);
    if (newPage > 1) params.set('page', newPage.toString());

    router.push(`/district-admin/members?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch('');
    setChapterSlug('ALL');
    setTaluk('ALL');
    setCategory('ALL');
    setPosition('ALL');
    setStatus('ALL');
    router.push('/district-admin/members');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters(1);
    }
  };

  const isFiltered =
    search.trim() !== '' ||
    chapterSlug !== 'ALL' ||
    taluk !== 'ALL' ||
    category !== 'ALL' ||
    position !== 'ALL' ||
    status !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-[#035AFC]" /> District Members Directory
            </h1>
            <Badge variant="primary">{total} VERIFIED MEMBERS</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative membership registry across all 16 chapters with classification and constituency scoping
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs text-slate-500">
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Filters
            </Button>
          )}
          <a
            href={`/api/v1/district-admin/export?type=members${chapterSlug !== 'ALL' ? `&chapterSlug=${chapterSlug}` : ''}${status !== 'ALL' ? `&status=${status}` : ''}`}
            download
          >
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export Directory (CSV)
            </Button>
          </a>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search name, ID, phone..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#035AFC]"
              />
            </div>

            {/* Chapter Scope */}
            <div>
              <select
                value={chapterSlug}
                onChange={(e) => setChapterSlug(e.target.value)}
                aria-label="Filter by Chapter Scope"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All 16 Chapters</option>
                {INITIAL_16_CHAPTERS.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Taluk */}
            <div>
              <select
                value={taluk}
                onChange={(e) => setTaluk(e.target.value)}
                aria-label="Filter by Taluk Geography"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All 7 Taluks</option>
                {TALUKS_OF_MALAPPURAM.map((t) => (
                  <option key={t.code} value={t.name}>
                    {t.name} Taluk
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                aria-label="Filter by Membership Status"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Members</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 items-center">
            {/* Category */}
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by Member Category"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All Member Categories</option>
                {MEMBER_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Position */}
            <div>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                aria-label="Filter by Current Position"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All Positions</option>
                {CURRENT_POSITIONS.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Trigger Button */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => applyFilters(1)}
                className="h-8 text-xs font-semibold px-4"
              >
                <Filter className="h-3.5 w-3.5 mr-1" /> Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Directory Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Constituency Members Registry</CardTitle>
              <CardDescription className="text-xs">
                Page {page} of {totalPages} &bull; Showing {initialMembers.length} of {total} registered members
              </CardDescription>
            </div>
            <span className="text-xs text-slate-400 font-mono">Malappuram District (MLP)</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Member ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Chapter & Taluk</th>
                  <th className="py-3 px-4">Category / Interest</th>
                  <th className="py-3 px-4">Current Position</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {initialMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      No members found matching the specified query filters.
                    </td>
                  </tr>
                ) : (
                  initialMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#035AFC]">
                        {m.membershipNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {m.fullName}
                        </div>
                        {m.companyName && (
                          <div className="text-[10px] text-slate-400">
                            {m.companyName}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          {m.chapterName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Taluk: {m.taluk}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {m.memberCategory ? (
                          <Badge variant="primary" className="text-[10px]">
                            {getMemberCategoryLabel(m.memberCategory as any)}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Unclassified</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {m.currentPosition ? (
                          getCurrentPositionLabel(m.currentPosition as any)
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={m.status === 'ACTIVE' ? 'success' : 'neutral'} className="text-[10px]">
                          {m.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {m.joinedDate ? m.joinedDate.split('T')[0] : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMember(m)}
                          className="h-7 text-[10px] px-2 font-medium"
                        >
                          <Eye className="h-3 w-3 mr-1" /> View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Showing {Math.min((page - 1) * pageSize + 1, total)} to {Math.min(page * pageSize, total)} of {total} records
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => applyFilters(page - 1)}
                  className="h-8 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                </Button>
                <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => applyFilters(page + 1)}
                  className="h-8 text-xs"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#0B101B] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedMember.fullName}
                  </h3>
                  <Badge variant="primary">{selectedMember.membershipNumber}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Constituency: {selectedMember.chapterName} ({selectedMember.chapterCode}) &bull; Taluk: {selectedMember.taluk}
                </p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Classification Info */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Category / Interest</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {selectedMember.memberCategory ? getMemberCategoryLabel(selectedMember.memberCategory as any) : 'Unclassified'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Position</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {selectedMember.currentPosition ? getCurrentPositionLabel(selectedMember.currentPosition as any) : 'Not specified'}
                  </span>
                </div>
                {selectedMember.occupation && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Occupation</span>
                    <span className="text-slate-700 dark:text-slate-300 mt-0.5 block">{selectedMember.occupation}</span>
                  </div>
                )}
                {selectedMember.companyName && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Institution / Company</span>
                    <span className="text-slate-700 dark:text-slate-300 mt-0.5 block">{selectedMember.companyName}</span>
                  </div>
                )}
              </div>

              {/* Expectations */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                  Community Expectations from MYBF
                </span>
                {selectedMember.expectations.length === 0 ? (
                  <span className="text-slate-400 italic">None recorded.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMember.expectations.map((exp) => (
                      <Badge key={exp} variant="primary" className="text-[10px]">
                        {getExpectationLabel(exp)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Talents */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                  Discovered Talents & Extracurricular Skills
                </span>
                {selectedMember.talents.length === 0 ? (
                  <span className="text-slate-400 italic">None recorded.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMember.talents.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">
                        {getTalentLabel(t)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Preferences */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                  Participation Preferences
                </span>
                {selectedMember.participationPreferences.length === 0 ? (
                  <span className="text-slate-400 italic">None recorded.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMember.participationPreferences.map((p) => (
                      <Badge key={p} variant="neutral" className="text-[10px]">
                        {getParticipationPreferenceLabel(p)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Status: <strong className="text-emerald-600">{selectedMember.status}</strong></span>
                <span>Member Since: {selectedMember.joinedDate.split('T')[0]}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-right">
              <Button variant="outline" size="sm" onClick={() => setSelectedMember(null)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
