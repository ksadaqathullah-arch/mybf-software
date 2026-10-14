'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, Filter, RotateCcw, Search } from 'lucide-react';
import {
  MEMBER_CATEGORIES,
  CURRENT_POSITIONS,
  getMemberCategoryLabel,
  getCurrentPositionLabel,
  type MemberCategoryValue,
  type CurrentPositionValue,
} from '@/features/memberships/constants/member-classifications';

export interface ChapterApplicationItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  memberCategory: MemberCategoryValue;
  currentPosition: CurrentPositionValue;
  businessSector: string;
  submittedAt: string;
}

interface ChapterReviewQueueProps {
  initialApplications: ChapterApplicationItem[];
  chapterName: string;
}

export function ChapterReviewQueue({ initialApplications, chapterName }: ChapterReviewQueueProps) {
  const [applications, setApplications] = React.useState<ChapterApplicationItem[]>(initialApplications);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [selectedPosition, setSelectedPosition] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);

  const filteredApplications = React.useMemo(() => {
    return applications.filter((app) => {
      // Category filter
      if (selectedCategory !== 'ALL' && app.memberCategory !== selectedCategory) {
        return false;
      }
      // Position filter
      if (selectedPosition !== 'ALL' && app.currentPosition !== selectedPosition) {
        return false;
      }
      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = app.fullName.toLowerCase().includes(query);
        const matchesSector = app.businessSector.toLowerCase().includes(query);
        const matchesContact = app.email.toLowerCase().includes(query) || app.phone.includes(query);
        if (!matchesName && !matchesSector && !matchesContact) return false;
      }
      return true;
    });
  }, [applications, selectedCategory, selectedPosition, searchQuery]);

  const handleApprove = (id: string, name: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setActionNotice(`Application for ${name} approved. Permanent 10-digit ID issued.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleReject = (id: string, name: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setActionNotice(`Application for ${name} rejected.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const resetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedPosition('ALL');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory !== 'ALL' || selectedPosition !== 'ALL' || searchQuery.trim() !== '';

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="p-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Membership Review Queue (Maker-Checker)</CardTitle>
              <Badge variant="warning">{applications.length} PENDING REVIEW</Badge>
            </div>
            <CardDescription className="text-xs mt-1">
              {chapterName} officers verify trade legitimacy and member classification before permanent ID pass generation.
            </CardDescription>
          </div>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between">
            <span>{actionNotice}</span>
            <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Dual & Combined Filters Toolbar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Member Category Filter */}
          <div className="sm:col-span-4 space-y-1">
            <label htmlFor="filter-category" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Filter className="h-3 w-3 text-[#035AFC]" /> Member Category
            </label>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#035AFC]"
            >
              <option value="ALL">All Categories</option>
              {MEMBER_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Current Position Filter */}
          <div className="sm:col-span-4 space-y-1">
            <label htmlFor="filter-position" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Filter className="h-3 w-3 text-[#FBC206]" /> Current Position
            </label>
            <select
              id="filter-position"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#035AFC]"
            >
              <option value="ALL">All Positions</option>
              {CURRENT_POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Query */}
          <div className="sm:col-span-3 space-y-1">
            <label htmlFor="filter-search" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Search className="h-3 w-3 text-slate-400" /> Search
            </label>
            <input
              id="filter-search"
              type="text"
              placeholder="Search name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#035AFC]"
            />
          </div>

          {/* Reset Filters */}
          <div className="sm:col-span-1">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="w-full h-8 text-[11px] px-2 text-slate-400 hover:text-slate-600"
                title="Reset all filters"
              >
                <RotateCcw className="h-3 w-3 mr-1" /> Reset
              </Button>
            )}
          </div>
        </div>

        {/* Filter Results Summary */}
        <div className="mt-2 text-[11px] text-slate-500">
          Showing <strong>{filteredApplications.length}</strong> of {applications.length} applications
          {selectedCategory !== 'ALL' && ` • Category: ${getMemberCategoryLabel(selectedCategory)}`}
          {selectedPosition !== 'ALL' && ` • Position: ${getCurrentPositionLabel(selectedPosition)}`}
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-2">Applicant</th>
                <th className="py-3 px-2">Field A: Category / Interest</th>
                <th className="py-3 px-2">Field B: Current Position</th>
                <th className="py-3 px-2">Business / Firm</th>
                <th className="py-3 px-2">Submitted</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No pending applications match the selected Category and Position filters.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-2">
                      <div className="font-bold text-slate-900 dark:text-white">{app.fullName}</div>
                      <div className="text-[11px] text-slate-400">
                        {app.email} • {app.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-2">
                      <Badge variant="primary" className="text-[10px]">
                        {getMemberCategoryLabel(app.memberCategory)}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-2">
                      <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {getCurrentPositionLabel(app.currentPosition)}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-2 text-slate-600 dark:text-slate-300">
                      {app.businessSector}
                    </td>
                    <td className="py-3.5 px-2 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {app.submittedAt}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(app.id, app.fullName)}
                          className="h-7 text-xs px-2.5"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(app.id, app.fullName)}
                          className="h-7 text-xs px-2.5 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
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
  );
}
