'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, Filter, RotateCcw, Search, Eye, AlertCircle, Send, MessageSquare } from 'lucide-react';
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
  occupation?: string;
  companyName?: string;
  businessSector: string;
  submittedAt: string;
  applicantAge?: number;
  requiresAgeException?: boolean;
  ageExceptionStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED';
  expectations?: string[];
  talents?: string[];
  participationPreferences?: string[];
  futureGoal?: string;
  reviewNotes?: string | null;
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

  // Inspector Modal State
  const [inspectingApp, setInspectingApp] = React.useState<ChapterApplicationItem | null>(null);
  const [internalNotes, setInternalNotes] = React.useState<string>('');
  const [rejectionReason, setRejectionReason] = React.useState<string>('');
  const [showRejectPrompt, setShowRejectPrompt] = React.useState(false);
  const [showCorrectionPrompt, setShowCorrectionPrompt] = React.useState(false);
  const [submittingId, setSubmittingId] = React.useState<string | null>(null);

  const filteredApplications = React.useMemo(() => {
    return applications.filter((app) => {
      if (selectedCategory !== 'ALL' && app.memberCategory !== selectedCategory) {
        return false;
      }
      if (selectedPosition !== 'ALL' && app.currentPosition !== selectedPosition) {
        return false;
      }
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

  // Chapter-level recommendation (Maker-Checker step before Super Admin approval)
  const handleRecommendApproval = async (id: string, name: string, notes?: string) => {
    const app = applications.find((a) => a.id === id);
    if (app?.requiresAgeException && app?.ageExceptionStatus === 'PENDING') {
      setActionNotice(`Notice: ${name} is ${app.applicantAge ?? 36}+ and requires Super Admin age exception approval.`);
      setTimeout(() => setActionNotice(null), 5000);
      return;
    }

    setSubmittingId(id);
    try {
      const res = await fetch('/api/v1/memberships/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: id,
          action: 'RECOMMEND_APPROVAL',
          notes: notes || internalNotes || `Recommended for approval by ${chapterName} executive committee.`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit recommendation.');
      }

      setApplications((prev) => prev.filter((a) => a.id !== id));
      setActionNotice(data.message || `Application for ${name} recommended and forwarded to Super Admin for final review!`);
      setInspectingApp(null);
    } catch (err: any) {
      setActionNotice(`Action Notice: ${err.message || 'Operation failed.'}`);
    } finally {
      setSubmittingId(null);
      setTimeout(() => setActionNotice(null), 6000);
    }
  };

  // Request correction from applicant
  const handleRequestCorrection = async (id: string, name: string) => {
    if (!internalNotes.trim()) {
      alert('Please specify the required correction or missing information in the notes.');
      return;
    }

    setSubmittingId(id);
    try {
      const res = await fetch('/api/v1/memberships/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: id,
          action: 'REQUEST_CORRECTION',
          notes: internalNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to request correction.');
      }

      setApplications((prev) => prev.filter((a) => a.id !== id));
      setActionNotice(`Correction requested from ${name}. Application status updated.`);
      setInspectingApp(null);
      setShowCorrectionPrompt(false);
    } catch (err: any) {
      setActionNotice(`Action Notice: ${err.message || 'Failed to request correction.'}`);
    } finally {
      setSubmittingId(null);
      setTimeout(() => setActionNotice(null), 6000);
    }
  };

  // Reject application
  const handleReject = async (id: string, name: string) => {
    const reason = rejectionReason.trim() || 'Does not meet current youth membership criteria';
    setSubmittingId(id);
    try {
      const res = await fetch('/api/v1/memberships/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: id,
          action: 'REJECT',
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reject application.');
      }

      setApplications((prev) => prev.filter((a) => a.id !== id));
      setActionNotice(`Application for ${name} rejected.`);
      setInspectingApp(null);
      setShowRejectPrompt(false);
    } catch (err: any) {
      setActionNotice(`Action Notice: ${err.message || 'Rejection failed.'}`);
    } finally {
      setSubmittingId(null);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const openInspector = (app: ChapterApplicationItem) => {
    setInspectingApp(app);
    setInternalNotes(app.reviewNotes || '');
    setRejectionReason('');
    setShowRejectPrompt(false);
    setShowCorrectionPrompt(false);
  };

  const resetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedPosition('ALL');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory !== 'ALL' || selectedPosition !== 'ALL' || searchQuery.trim() !== '';

  return (
    <>
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-6 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Membership Review Queue (Maker-Checker)</CardTitle>
                <Badge variant="warning">{applications.length} PENDING REVIEW</Badge>
              </div>
              <CardDescription className="text-xs mt-1">
                {chapterName} executive review stage. Recommending an applicant forwards the file to the Super Admin for final approval.
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
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Position</th>
                  <th className="py-3 px-2">Business / Sector</th>
                  <th className="py-3 px-2">Submitted</th>
                  <th className="py-3 px-2 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No pending applications in this chapter queue.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {app.fullName}
                          <button
                            onClick={() => openInspector(app)}
                            className="p-1 rounded text-slate-400 hover:text-[#035AFC] transition-colors"
                            title="Inspect full application file"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {app.email} • {app.phone}
                        </div>
                        {app.requiresAgeException && app.ageExceptionStatus === 'PENDING' && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Age Exception Required ({app.applicantAge ?? 36}+ yrs)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-2">
                        <Badge variant="primary" className="text-[10px]">
                          {getMemberCategoryLabel(app.memberCategory)}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-2">
                        <Badge variant="secondary" className="text-[10px]">
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
                            disabled={submittingId === app.id}
                            onClick={() => handleRecommendApproval(app.id, app.fullName)}
                            className="h-7 text-xs px-2.5"
                            title="Recommend to Super Admin for final approval"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            {submittingId === app.id ? 'Sending...' : 'Recommend'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openInspector(app)}
                            className="h-7 text-xs px-2"
                            title="View complete application & add notes"
                          >
                            Details
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

      {/* Complete Application Inspector Modal */}
      {inspectingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {inspectingApp.fullName}
                  <Badge variant="primary" className="text-[10px]">
                    {getMemberCategoryLabel(inspectingApp.memberCategory)}
                  </Badge>
                </h3>
                <p className="text-xs text-slate-500">
                  {inspectingApp.email} • {inspectingApp.phone}
                </p>
              </div>
              <button
                onClick={() => setInspectingApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Applicant Enterprise & Profile Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Position</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {getCurrentPositionLabel(inspectingApp.currentPosition)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Occupation / Trade</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {inspectingApp.occupation || 'Self-employed'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Business Sector</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {inspectingApp.businessSector}
                  </span>
                </div>
                {inspectingApp.companyName && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Company / Firm</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{inspectingApp.companyName}</span>
                  </div>
                )}
                {inspectingApp.applicantAge && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Age Eligibility</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {inspectingApp.applicantAge} years old{' '}
                      {inspectingApp.requiresAgeException ? '(Age Exception Required)' : '(Standard Youth)'}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Submitted Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{inspectingApp.submittedAt}</span>
                </div>
              </div>

              {/* Youth Discovery Goals */}
              {inspectingApp.futureGoal && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                    Entrepreneurial Goal / Aspirations
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 italic">{inspectingApp.futureGoal}</p>
                </div>
              )}

              {/* Internal Review Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-[#035AFC]" />
                  Chapter Executive Review Notes & Justification
                </label>
                <textarea
                  rows={3}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add notes for the Super Admin or internal chapter executive records (e.g. trade license checked, business active)..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                />
              </div>

              {/* Correction Prompt Sub-view */}
              {showCorrectionPrompt && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-2">
                  <p className="font-semibold flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Requesting Document or Information Correction:
                  </p>
                  <p className="text-[11px]">
                    The notes entered above will be recorded and the application status will change to &quot;Additional Info Requested&quot;.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRequestCorrection(inspectingApp.id, inspectingApp.fullName)}
                      disabled={submittingId === inspectingApp.id}
                    >
                      Send Correction Request
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowCorrectionPrompt(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Rejection Prompt Sub-view */}
              {showRejectPrompt && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-400 space-y-2">
                  <p className="font-semibold">Confirm Application Rejection</p>
                  <input
                    type="text"
                    placeholder="Specific rejection reason..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full rounded-lg border border-red-200 dark:border-red-900/40 bg-white dark:bg-[#070A10] px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleReject(inspectingApp.id, inspectingApp.fullName)}
                      disabled={submittingId === inspectingApp.id}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Confirm Rejection
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowRejectPrompt(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCorrectionPrompt(true);
                      setShowRejectPrompt(false);
                    }}
                    className="text-amber-600 border-amber-300 hover:bg-amber-50"
                  >
                    Request Correction
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowRejectPrompt(true);
                      setShowCorrectionPrompt(false);
                    }}
                    className="text-red-500 border-red-300 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setInspectingApp(null)}>
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={submittingId === inspectingApp.id}
                    onClick={() => handleRecommendApproval(inspectingApp.id, inspectingApp.fullName, internalNotes)}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" />
                    {submittingId === inspectingApp.id ? 'Submitting...' : 'Recommend to Super Admin'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
