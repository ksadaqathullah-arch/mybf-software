'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download, Users, RotateCcw } from 'lucide-react';
import {
  MEMBER_CATEGORIES,
  CURRENT_POSITIONS,
  getMemberCategoryLabel,
  getCurrentPositionLabel,
} from '@/features/memberships/constants/member-classifications';

export interface ChapterMemberItem {
  id: string;
  profileId: string;
  membershipNumber: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  memberCategory: string;
  currentPosition: string;
  occupation: string;
  companyName: string;
  businessSector: string;
  joinedDate: string;
  status: string;
}

interface ChapterRosterTableProps {
  initialMembers: ChapterMemberItem[];
  chapterName: string;
}

export function ChapterRosterTable({ initialMembers, chapterName }: ChapterRosterTableProps) {
  const [members] = React.useState<ChapterMemberItem[]>(initialMembers);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [selectedPosition, setSelectedPosition] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const filteredMembers = React.useMemo(() => {
    return members.filter((member) => {
      if (selectedCategory !== 'ALL' && member.memberCategory !== selectedCategory) {
        return false;
      }
      if (selectedPosition !== 'ALL' && member.currentPosition !== selectedPosition) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = member.fullName.toLowerCase().includes(q);
        const matchesId = member.membershipNumber.toLowerCase().includes(q);
        const matchesCompany = member.companyName.toLowerCase().includes(q);
        const matchesSector = member.businessSector.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesCompany && !matchesSector) return false;
      }
      return true;
    });
  }, [members, selectedCategory, selectedPosition, searchQuery]);

  const handleExportCSV = () => {
    if (filteredMembers.length === 0) {
      alert('No members to export.');
      return;
    }

    const headers = ['Full Name', 'Member ID', 'Category', 'Position', 'Occupation', 'Company', 'Sector', 'Status', 'Joined Date'];
    const rows = filteredMembers.map((m) => [
      `"${m.fullName.replace(/"/g, '""')}"`,
      `"${m.membershipNumber}"`,
      `"${getMemberCategoryLabel(m.memberCategory)}"`,
      `"${getCurrentPositionLabel(m.currentPosition)}"`,
      `"${(m.occupation || '').replace(/"/g, '""')}"`,
      `"${(m.companyName || '').replace(/"/g, '""')}"`,
      `"${(m.businessSector || '').replace(/"/g, '""')}"`,
      `"${m.status}"`,
      `"${new Date(m.joinedDate).toLocaleDateString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${chapterName.toLowerCase().replace(/\s+/g, '-')}-members-roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedPosition('ALL');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory !== 'ALL' || selectedPosition !== 'ALL' || searchQuery.trim() !== '';

  return (
    <Card>
      <CardHeader className="p-6 pb-4 border-b-2 border-ink">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-black font-display uppercase tracking-wider text-ink flex items-center gap-2">
                <Users className="h-5 w-5 text-blue" /> {chapterName} Active Member Directory
              </CardTitle>
              <Badge variant="primary">{members.length} MEMBERS</Badge>
            </div>
            <CardDescription className="text-xs text-ink/70 font-serif mt-1">
              Authorized chapter roster showing active verified members and classifications.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export Roster (CSV)
          </Button>
        </div>

        {/* Toolbar */}
        <div className="mt-4 pt-4 border-t-2 border-ink/10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4 space-y-1">
            <label className="text-[11px] font-black font-display uppercase tracking-wider text-ink flex items-center gap-1">
              <Filter className="h-3 w-3 text-blue" /> Member Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border-2 border-ink bg-paper px-2.5 py-1.5 text-xs text-ink font-display font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue"
            >
              <option value="ALL">All Categories</option>
              {MEMBER_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-[11px] font-black font-display uppercase tracking-wider text-ink flex items-center gap-1">
              <Filter className="h-3 w-3 text-yellow" /> Current Position
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full border-2 border-ink bg-paper px-2.5 py-1.5 text-xs text-ink font-display font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue"
            >
              <option value="ALL">All Positions</option>
              {CURRENT_POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-[11px] font-black font-display uppercase tracking-wider text-ink flex items-center gap-1">
              <Search className="h-3 w-3 text-ink/40" /> Search
            </label>
            <input
              type="text"
              placeholder="Search name, ID, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 border-ink bg-paper px-2.5 py-1.5 text-xs text-ink font-serif focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>

          <div className="sm:col-span-1">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="w-full h-8 text-[11px] px-2 text-ink/60 hover:text-ink"
                title="Reset filters"
              >
                <RotateCcw className="h-3 w-3 mr-1" /> Reset
              </Button>
            )}
          </div>
        </div>

        <div className="mt-2 text-[11px] text-ink/60 font-serif">
          Showing <strong>{filteredMembers.length}</strong> of {members.length} members
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="border-b-2 border-ink bg-paper-sunken text-ink font-display font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Membership ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Company / Sector</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 font-mono text-[11px]">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-ink/50 font-serif italic text-sm">
                    No active members found for {chapterName}.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-yellow/10 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-ink font-sans text-xs">{m.fullName}</div>
                      <div className="text-[10px] text-ink/60 font-mono">
                        {m.email || 'Contact on file'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-blue font-bold">
                      {m.membershipNumber}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="primary" className="text-[10px]">
                        {getMemberCategoryLabel(m.memberCategory)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="text-[10px]">
                        {getCurrentPositionLabel(m.currentPosition)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-ink font-serif">
                      {m.companyName ? `${m.companyName} (${m.businessSector})` : m.businessSector}
                    </td>
                    <td className="py-3 px-4 text-ink/70">
                      {new Date(m.joinedDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant="success" className="text-[10px]">
                        {m.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
