'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Clock,
  Filter,
  RotateCcw,
  Search,
  Eye,
  AlertCircle,
  Send,
  MessageSquare,
  Building,
  User,
  ShieldCheck,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
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
  userId?: string;
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
  ageExceptionStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED' | string;
  status?: string;
  expectations?: string[];
  talents?: string[];
  participationPreferences?: string[];
  futureGoal?: string;
  reviewNotes?: string | null;
  rejectionReason?: string | null;
  chapterRecommendation?: {
    recommendedBy?: string;
    recommendedAt?: string;
    notes?: string;
    decision?: string;
  } | null;
}

interface ChapterReviewQueueProps {
  initialApplications: ChapterApplicationItem[];
  chapterName: string;
}

function formatSubmittedDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function ChapterReviewQueue({ initialApplications, chapterName }: ChapterReviewQueueProps) {
  const [applications, setApplications] = React.useState<ChapterApplicationItem[]>(initialApplications);
  const [activeTab, setActiveTab] = React.useState<'PENDING' | 'FORWARDED' | 'HISTORY' | 'ALL'>('PENDING');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [selectedPosition, setSelectedPosition] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [actionNotice, setActionNotice] = React.useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  // Inspector Modal State
  const [inspectingApp, setInspectingApp] = React.useState<ChapterApplicationItem | null>(null);
  const [internalNotes, setInternalNotes] = React.useState<string>('');
  const [rejectionReason, setRejectionReason] = React.useState<string>('');
  const [showRejectPrompt, setShowRejectPrompt] = React.useState(false);
  const [showCorrectionPrompt, setShowCorrectionPrompt] = React.useState(false);
  const [submittingId, setSubmittingId] = React.useState<string | null>(null);

  // Group applications by workflow state
  const pendingApps = React.useMemo(() => {
    return applications.filter(
      (a) => a.status === 'SUBMITTED' && (!a.chapterRecommendation || a.chapterRecommendation.decision !== 'RECOMMENDED')
    );
  }, [applications]);

  const forwardedApps = React.useMemo(() => {
    return applications.filter(
      (a) =>
        a.status === 'UNDER_REVIEW' ||
        (a.chapterRecommendation && a.chapterRecommendation.decision === 'RECOMMENDED')
    );
  }, [applications]);

  const historyApps = React.useMemo(() => {
    return applications.filter((a) => a.status === 'APPROVED' || a.status === 'REJECTED');
  }, [applications]);

  // Tab-filtered applications
  const currentTabApplications = React.useMemo(() => {
    if (activeTab === 'PENDING') return pendingApps;
    if (activeTab === 'FORWARDED') return forwardedApps;
    if (activeTab === 'HISTORY') return historyApps;
    return applications;
  }, [activeTab, pendingApps, forwardedApps, historyApps, applications]);

  // Secondary memory filters (Category, Position, Search)
  const filteredApplications = React.useMemo(() => {
    return currentTabApplications.filter((app) => {
      if (selectedCategory !== 'ALL' && app.memberCategory !== selectedCategory) {
        return false;
      }
      if (selectedPosition !== 'ALL' && app.currentPosition !== selectedPosition) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = app.fullName.toLowerCase().includes(query);
        const matchesSector = app.businessSector.toLowerCase().includes(query);
        const matchesContact = app.email.toLowerCase().includes(query) || app.phone.includes(query);
        const matchesCompany = app.companyName ? app.companyName.toLowerCase().includes(query) : false;
        if (!matchesName && !matchesSector && !matchesContact && !matchesCompany) return false;
      }
      return true;
    });
  }, [currentTabApplications, selectedCategory, selectedPosition, searchQuery]);

  // Chapter-level recommendation (Maker-Checker step before Super Admin approval)
  const handleRecommendApproval = async (id: string, name: string, notes?: string) => {
    const app = applications.find((a) => a.id === id);
    if (app?.requiresAgeException && app?.ageExceptionStatus === 'PENDING') {
      setActionNotice({
        type: 'warning',
        message: `Notice: ${name} is ${app.applicantAge ?? 36}+ and requires Super Admin age exception approval before recommendation.`,
      });
      setTimeout(() => setActionNotice(null), 6000);
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

      // Update persisted application state in React state
      setApplications((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            return {
              ...a,
              status: 'UNDER_REVIEW',
              chapterRecommendation: {
                decision: 'RECOMMENDED',
                recommendedAt: new Date().toISOString(),
                notes: notes || internalNotes || 'Recommended for approval',
              },
            };
          }
          return a;
        })
      );

      setActionNotice({
        type: 'success',
        message: `Application for ${name} recommended and forwarded to Super Admin for final review!`,
      });
      setInspectingApp(null);
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: `Action Notice: ${err.message || 'Operation failed.'}`,
      });
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

      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'ADDITIONAL_INFO_REQUESTED' } : a))
      );
      setActionNotice({
        type: 'success',
        message: `Correction requested from ${name}. Application status updated.`,
      });
      setInspectingApp(null);
      setShowCorrectionPrompt(false);
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: `Action Notice: ${err.message || 'Failed to request correction.'}`,
      });
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

      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'REJECTED', rejectionReason: reason } : a))
      );
      setActionNotice({
        type: 'success',
        message: `Application for ${name} rejected.`,
      });
      setInspectingApp(null);
      setShowRejectPrompt(false);
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: `Action Notice: ${err.message || 'Rejection failed.'}`,
      });
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
      <Card className="border-2 border-ink bg-paper text-ink shadow-[4px_4px_0px_#14161c]">
        <CardHeader className="p-6 pb-4 border-b-2 border-ink">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl font-black font-display uppercase tracking-wider text-ink">
                  Membership Review Queue
                </CardTitle>
                <Badge variant={pendingApps.length > 0 ? 'warning' : 'neutral'} className="text-[10px]">
                  {pendingApps.length} {pendingApps.length === 1 ? 'APPLICATION PENDING' : 'APPLICATIONS PENDING'}
                </Badge>
              </div>
              <CardDescription className="text-xs text-ink/70 font-serif mt-1">
                {chapterName} Executive Maker-Checker Stage • Recommending an applicant validates qualifications and forwards the file to the Super Admin for final activation.
              </CardDescription>
            </div>

            {/* Workflow Navigation Tabs */}
            <div className="flex items-center gap-1 bg-paper-2 p-1 border-2 border-ink shadow-[2px_2px_0px_#14161c]">
              <button
                type="button"
                onClick={() => setActiveTab('PENDING')}
                className={`px-3 py-1 text-xs font-display font-extrabold uppercase tracking-wider transition-colors ${
                  activeTab === 'PENDING'
                    ? 'bg-yellow text-ink border border-ink shadow-[1px_1px_0px_#14161c]'
                    : 'text-ink/70 hover:text-ink'
                }`}
              >
                Pending ({pendingApps.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('FORWARDED')}
                className={`px-3 py-1 text-xs font-display font-extrabold uppercase tracking-wider transition-colors ${
                  activeTab === 'FORWARDED'
                    ? 'bg-yellow text-ink border border-ink shadow-[1px_1px_0px_#14161c]'
                    : 'text-ink/70 hover:text-ink'
                }`}
              >
                Forwarded ({forwardedApps.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('HISTORY')}
                className={`px-3 py-1 text-xs font-display font-extrabold uppercase tracking-wider transition-colors ${
                  activeTab === 'HISTORY'
                    ? 'bg-yellow text-ink border border-ink shadow-[1px_1px_0px_#14161c]'
                    : 'text-ink/70 hover:text-ink'
                }`}
              >
                History ({historyApps.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1 text-xs font-display font-extrabold uppercase tracking-wider transition-colors ${
                  activeTab === 'ALL'
                    ? 'bg-yellow text-ink border border-ink shadow-[1px_1px_0px_#14161c]'
                    : 'text-ink/70 hover:text-ink'
                }`}
              >
                All ({applications.length})
              </button>
            </div>
          </div>

          {/* Action Notice Toast */}
          {actionNotice && (
            <div
              className={`mt-4 p-3 border-2 border-ink text-xs font-medium flex items-center justify-between shadow-[2px_2px_0px_#14161c] ${
                actionNotice.type === 'success'
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-900'
                  : actionNotice.type === 'warning'
                  ? 'bg-amber-100 text-amber-950 border-amber-900'
                  : 'bg-rose-100 text-rose-950 border-rose-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {actionNotice.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-800 shrink-0" />}
                {actionNotice.type === 'warning' && <AlertCircle className="h-4 w-4 text-amber-800 shrink-0" />}
                {actionNotice.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-800 shrink-0" />}
                <span className="font-sans font-bold">{actionNotice.message}</span>
              </div>
              <button
                onClick={() => setActionNotice(null)}
                className="p-1 text-ink/70 hover:text-ink cursor-pointer"
                aria-label="Dismiss notice"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* High-Contrast Filters Toolbar */}
          <div className="mt-4 pt-4 border-t-2 border-ink/10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4 space-y-1">
              <label
                htmlFor="filter-category"
                className="text-[11px] font-black font-display uppercase tracking-wider text-ink flex items-center gap-1"
              >
                <Filter className="h-3 w-3 text-blue" /> Member Category
              </label>
              <select
                id="filter-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border-2 border-ink bg-paper px-2.5 py-1.5 text-xs text-ink font-sans font-bold focus:outline-none focus:ring-2 focus:ring-blue shadow-[1px_1px_0px_#14161c]"
              >
                <option value="ALL" className="bg-paper text-ink">
                  All Categories
                </option>
                {MEMBER_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} className="bg-paper text-ink">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4 space-y-1">
              <label
                htmlFor="filter-position"
                className="text-[11px] font-black font-display uppercase tracking-wider text-ink flex items-center gap-1"
              >
                <Filter className="h-3 w-3 text-yellow" /> Current Position
              </label>
              <select
                id="filter-position"
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full border-2 border-ink bg-paper px-2.5 py-1.5 text-xs text-ink font-sans font-bold focus:outline-none focus:ring-2 focus:ring-blue shadow-[1px_1px_0px_#14161c]"
              >
                <option value="ALL" className="bg-paper text-ink">
                  All Positions
                </option>
                {CURRENT_POSITIONS.map((p) => (
                  <option key={p.value} value={p.value} className="bg-paper text-ink">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label
                htmlFor="filter-search"
                className="text-[11px] font-black font-display uppercase tracking-wider text-ink flex items-center gap-1"
              >
                <Search className="h-3 w-3 text-ink/60" /> Search Applicants
              </label>
              <input
                id="filter-search"
                type="text"
                placeholder="Search name, phone, email, firm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-2 border-ink bg-paper px-2.5 py-1.5 text-xs text-ink font-sans placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-blue shadow-[1px_1px_0px_#14161c]"
              />
            </div>

            <div className="sm:col-span-1">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="w-full h-8 text-[11px] px-2 text-ink/70 hover:text-ink border border-ink/30"
                  title="Reset all filters"
                >
                  <RotateCcw className="h-3 w-3 mr-1" /> Reset
                </Button>
              )}
            </div>
          </div>

          <div className="mt-2 text-[11px] text-ink/70 font-serif">
            Showing <strong>{filteredApplications.length}</strong> of {currentTabApplications.length} applications in{' '}
            <span className="font-bold uppercase font-sans text-ink">{activeTab}</span> queue
            {selectedCategory !== 'ALL' && ` • Category: ${getMemberCategoryLabel(selectedCategory)}`}
            {selectedPosition !== 'ALL' && ` • Position: ${getCurrentPositionLabel(selectedPosition)}`}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="border-b-2 border-ink bg-paper-2 text-ink font-display font-black uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Applicant Profile</th>
                  <th className="py-3 px-3">Classification</th>
                  <th className="py-3 px-3">Business / Sector</th>
                  <th className="py-3 px-3">Submission Details</th>
                  <th className="py-3 px-3">Current Status</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 font-sans">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ink/60 font-serif italic text-sm">
                      {activeTab === 'PENDING'
                        ? 'All clear! There are currently no pending applications awaiting chapter executive recommendation.'
                        : activeTab === 'FORWARDED'
                        ? 'No applications currently forwarded to Super Admin.'
                        : activeTab === 'HISTORY'
                        ? 'No approved or rejected application history in this chapter.'
                        : 'No applications match your filter criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => {
                    const isAlreadyRecommended =
                      app.status === 'UNDER_REVIEW' ||
                      Boolean(app.chapterRecommendation && app.chapterRecommendation.decision === 'RECOMMENDED');
                    const isApproved = app.status === 'APPROVED';
                    const isRejected = app.status === 'REJECTED';

                    return (
                      <tr key={app.id} className="hover:bg-yellow/10 transition-colors">
                        {/* 1. Applicant Profile (High Contrast) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-extrabold text-sm text-ink">{app.fullName}</span>
                            <button
                              type="button"
                              onClick={() => openInspector(app)}
                              className="p-1 rounded text-ink/50 hover:text-blue transition-colors cursor-pointer"
                              title="Inspect full application file"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="text-[11px] text-ink/80 font-mono mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-ink/60 shrink-0" />
                              <span className="font-medium">{app.email}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-ink/60 shrink-0" />
                              <span className="font-medium">{app.phone}</span>
                            </span>
                          </div>
                          {app.requiresAgeException && app.ageExceptionStatus === 'PENDING' && (
                            <div className="mt-1">
                              <Badge variant="warning" className="text-[9px]">
                                Age Exception Pending ({app.applicantAge ?? 36}+ yrs)
                              </Badge>
                            </div>
                          )}
                        </td>

                        {/* 2. Classification Badges */}
                        <td className="py-3.5 px-3 space-y-1">
                          <div>
                            <Badge variant="primary" className="text-[10px]">
                              {getMemberCategoryLabel(app.memberCategory)}
                            </Badge>
                          </div>
                          <div>
                            <Badge variant="secondary" className="text-[10px]">
                              {getCurrentPositionLabel(app.currentPosition)}
                            </Badge>
                          </div>
                        </td>

                        {/* 3. Business / Firm Information */}
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-ink text-xs flex items-center gap-1">
                            {app.companyName ? (
                              <>
                                <Building className="h-3 w-3 text-ink/60 shrink-0" />
                                {app.companyName}
                              </>
                            ) : (
                              app.occupation || 'Enterprise'
                            )}
                          </div>
                          <div className="text-[11px] text-ink/70 font-serif">{app.businessSector}</div>
                        </td>

                        {/* 4. Submission Details (Formatted Date) */}
                        <td className="py-3.5 px-3">
                          <div className="text-[11px] font-mono text-ink flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-ink/60" />
                            {formatSubmittedDate(app.submittedAt)}
                          </div>
                          <div className="text-[10px] text-ink/60 font-serif mt-0.5">
                            Ref: {app.id.slice(0, 8)}
                          </div>
                        </td>

                        {/* 5. Workflow State Badge */}
                        <td className="py-3.5 px-3">
                          {isApproved ? (
                            <Badge variant="success" className="text-[10px]">
                              Approved
                            </Badge>
                          ) : isRejected ? (
                            <Badge variant="danger" className="text-[10px]">
                              Rejected
                            </Badge>
                          ) : isAlreadyRecommended ? (
                            <Badge variant="primary" className="text-[10px]">
                              Forwarded to Super Admin
                            </Badge>
                          ) : app.requiresAgeException && app.ageExceptionStatus === 'PENDING' ? (
                            <Badge variant="warning" className="text-[10px]">
                              Super Admin Age Review
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="text-[10px]">
                              Awaiting Chapter Review
                            </Badge>
                          )}
                        </td>

                        {/* 6. Review Action Controls */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {!isAlreadyRecommended && !isApproved && !isRejected ? (
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={submittingId === app.id}
                                onClick={() => handleRecommendApproval(app.id, app.fullName)}
                                className="h-7 text-xs px-2.5 font-display font-extrabold"
                                title="Recommend applicant to Super Admin for final activation"
                              >
                                <Send className="h-3 w-3 mr-1" />
                                {submittingId === app.id ? 'Recommending...' : 'Recommend'}
                              </Button>
                            ) : isAlreadyRecommended ? (
                              <span className="text-[11px] font-mono text-blue font-bold px-2 py-1 bg-blue/10 border border-blue/30">
                                Recommended ✓
                              </span>
                            ) : null}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openInspector(app)}
                              className="h-7 text-xs px-2 font-display font-bold border-2 border-ink text-ink hover:bg-paper-2"
                              title="View complete application file and record notes"
                            >
                              Details
                            </Button>
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
            {filteredApplications.length === 0 ? (
              <div className="py-12 text-center text-ink/60 font-serif italic text-sm">
                {activeTab === 'PENDING'
                  ? 'All clear! There are currently no pending applications awaiting chapter executive recommendation.'
                  : activeTab === 'FORWARDED'
                  ? 'No applications currently forwarded to Super Admin.'
                  : activeTab === 'HISTORY'
                  ? 'No approved or rejected application history in this chapter.'
                  : 'No applications match your filter criteria.'}
              </div>
            ) : (
              filteredApplications.map((app) => {
                const isAlreadyRecommended =
                  app.status === 'UNDER_REVIEW' ||
                  Boolean(app.chapterRecommendation && app.chapterRecommendation.decision === 'RECOMMENDED');
                const isApproved = app.status === 'APPROVED';
                const isRejected = app.status === 'REJECTED';

                return (
                  <div
                    key={app.id}
                    className="border-2 border-ink bg-white p-4 shadow-[3px_3px_0px_#14161c] space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-display font-extrabold text-base text-ink">{app.fullName}</h4>
                        <div className="text-[11px] text-ink/80 font-mono mt-0.5">
                          {app.email} • {app.phone}
                        </div>
                      </div>
                      <Badge
                        variant={
                          isApproved ? 'success' : isRejected ? 'danger' : isAlreadyRecommended ? 'primary' : 'warning'
                        }
                      >
                        {app.status || 'SUBMITTED'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="primary" className="text-[10px]">
                        {getMemberCategoryLabel(app.memberCategory)}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {getCurrentPositionLabel(app.currentPosition)}
                      </Badge>
                      {app.requiresAgeException && app.ageExceptionStatus === 'PENDING' && (
                        <Badge variant="warning" className="text-[9px]">
                          Age Exception Pending
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-b border-ink/10 py-2.5 text-xs">
                      <div>
                        <span className="text-muted block text-[11px]">Business</span>
                        <span className="font-semibold text-ink">{app.companyName || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-muted block text-[11px]">Sector</span>
                        <span className="font-semibold text-ink">{app.businessSector || 'General Enterprise'}</span>
                      </div>
                    </div>

                    {/* Touch Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {!isAlreadyRecommended && !isApproved && !isRejected ? (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={submittingId === app.id}
                          onClick={() => handleRecommendApproval(app.id, app.fullName)}
                          className="flex-1 min-h-11 text-xs font-display font-black uppercase tracking-wider shadow-[2px_2px_0px_#14161c]"
                        >
                          <Send className="h-4 w-4 mr-1.5" />
                          {submittingId === app.id ? 'Recommending...' : 'Recommend'}
                        </Button>
                      ) : isAlreadyRecommended ? (
                        <div className="flex-1 min-h-11 flex items-center justify-center text-xs font-mono text-blue font-bold bg-blue/10 border-2 border-blue/30">
                          Recommended ✓
                        </div>
                      ) : null}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInspector(app)}
                        className="flex-1 min-h-11 text-xs font-display font-bold border-2 border-ink text-ink hover:bg-paper-2 shadow-[2px_2px_0px_#14161c]"
                      >
                        <Eye className="h-4 w-4 mr-1.5" /> Full File
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Complete Application Inspector Modal (High Contrast & Editorial) */}
      {inspectingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[95vh] overflow-y-auto border-2 border-ink bg-paper text-ink shadow-[6px_6px_0px_#14161c] sm:shadow-[8px_8px_0px_#14161c] p-4 sm:p-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-ink">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black font-display uppercase tracking-wider text-ink">
                    {inspectingApp.fullName}
                  </h3>
                  <Badge variant="primary" className="text-[10px]">
                    {getMemberCategoryLabel(inspectingApp.memberCategory)}
                  </Badge>
                  {inspectingApp.status === 'UNDER_REVIEW' && (
                    <Badge variant="warning" className="text-[10px]">
                      Awaiting Super Admin Decision
                    </Badge>
                  )}
                  {inspectingApp.status === 'APPROVED' && (
                    <Badge variant="success" className="text-[10px]">
                      Membership Approved
                    </Badge>
                  )}
                </div>
                <div className="text-xs font-mono text-ink/80 mt-1 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-ink/60" /> {inspectingApp.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-ink/60" /> {inspectingApp.phone}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingApp(null)}
                className="p-1 border border-ink text-ink hover:bg-yellow transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs font-sans">
              {/* Applicant Enterprise & Profile Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border-2 border-ink bg-paper-2 shadow-[2px_2px_0px_#14161c]">
                <div>
                  <span className="text-ink/60 block text-[10px] uppercase font-black font-display tracking-wider">
                    Current Position
                  </span>
                  <span className="font-bold text-ink text-xs">
                    {getCurrentPositionLabel(inspectingApp.currentPosition)}
                  </span>
                </div>

                <div>
                  <span className="text-ink/60 block text-[10px] uppercase font-black font-display tracking-wider">
                    Trade / Occupation
                  </span>
                  <span className="font-bold text-ink text-xs">
                    {inspectingApp.occupation || 'Self-employed / Business'}
                  </span>
                </div>

                <div>
                  <span className="text-ink/60 block text-[10px] uppercase font-black font-display tracking-wider">
                    Business Sector
                  </span>
                  <span className="font-bold text-ink text-xs">
                    {inspectingApp.businessSector}
                  </span>
                </div>

                {inspectingApp.companyName && (
                  <div>
                    <span className="text-ink/60 block text-[10px] uppercase font-black font-display tracking-wider">
                      Firm / Company
                    </span>
                    <span className="font-bold text-ink text-xs">{inspectingApp.companyName}</span>
                  </div>
                )}

                {inspectingApp.applicantAge && (
                  <div>
                    <span className="text-ink/60 block text-[10px] uppercase font-black font-display tracking-wider">
                      Age Qualification
                    </span>
                    <span className="font-bold text-ink text-xs">
                      {inspectingApp.applicantAge} yrs{' '}
                      {inspectingApp.requiresAgeException ? '(Age Exception Required)' : '(Standard Youth)'}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-ink/60 block text-[10px] uppercase font-black font-display tracking-wider">
                    Submission Timestamp
                  </span>
                  <span className="font-bold text-ink text-xs font-mono">
                    {formatSubmittedDate(inspectingApp.submittedAt)}
                  </span>
                </div>
              </div>

              {/* Youth Discovery Goals */}
              {inspectingApp.futureGoal && (
                <div className="p-3 border-2 border-ink bg-white shadow-[2px_2px_0px_#14161c]">
                  <span className="text-ink/60 block text-[10px] uppercase font-black font-display tracking-wider mb-1">
                    Entrepreneurial Aspirations & Goals
                  </span>
                  <p className="text-ink font-serif text-xs italic">&ldquo;{inspectingApp.futureGoal}&rdquo;</p>
                </div>
              )}

              {/* Existing Recommendation Information if Available */}
              {inspectingApp.chapterRecommendation && (
                <div className="p-3 border-2 border-blue bg-blue/10 text-xs shadow-[2px_2px_0px_#005bff]">
                  <div className="font-bold text-blue flex items-center gap-1.5 uppercase font-display tracking-wider">
                    <ShieldCheck className="h-4 w-4" /> Recommendation on File:
                  </div>
                  <p className="text-ink font-sans text-xs mt-1">
                    {inspectingApp.chapterRecommendation.notes || 'Recommended for final approval by chapter executive committee.'}
                  </p>
                  {inspectingApp.chapterRecommendation.recommendedAt && (
                    <div className="text-[10px] text-ink/60 font-mono mt-1">
                      Forwarded on: {formatSubmittedDate(inspectingApp.chapterRecommendation.recommendedAt)}
                    </div>
                  )}
                </div>
              )}

              {/* Internal Review Notes Input */}
              {inspectingApp.status === 'SUBMITTED' && (
                <div>
                  <label
                    htmlFor="review-notes"
                    className="block text-xs font-black font-display uppercase tracking-wider text-ink mb-1 flex items-center gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-blue" />
                    Chapter Executive Review Notes & Verification Remarks
                  </label>
                  <textarea
                    id="review-notes"
                    rows={3}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Enter verification notes for the Super Admin (e.g. trade license checked, active enterprise in Manjeri)..."
                    className="w-full border-2 border-ink bg-paper px-3 py-2 text-xs text-ink font-sans placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-blue shadow-[2px_2px_0px_#14161c]"
                  />
                </div>
              )}

              {/* Correction Prompt Sub-view */}
              {showCorrectionPrompt && (
                <div className="p-3 border-2 border-amber-800 bg-amber-100 text-xs text-amber-950 space-y-2 shadow-[2px_2px_0px_#78350f]">
                  <p className="font-bold flex items-center gap-1 font-display uppercase">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-900" /> Requesting Document or Information Correction:
                  </p>
                  <p className="text-xs font-sans">
                    The notes entered above will be recorded and the application status will change to &quot;Additional Info Requested&quot;.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRequestCorrection(inspectingApp.id, inspectingApp.fullName)}
                      disabled={submittingId === inspectingApp.id}
                      className="font-bold"
                    >
                      Send Correction Request
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCorrectionPrompt(false)}
                      className="border-amber-900 text-amber-950 hover:bg-amber-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Rejection Prompt Sub-view */}
              {showRejectPrompt && (
                <div className="p-3 border-2 border-rose-900 bg-rose-100 text-xs text-rose-950 space-y-2 shadow-[2px_2px_0px_#881337]">
                  <p className="font-bold font-display uppercase">Confirm Application Rejection</p>
                  <input
                    type="text"
                    placeholder="Specific rejection reason (e.g. outside chapter boundary, ineligible)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full border-2 border-rose-900 bg-white px-3 py-1.5 text-xs text-ink placeholder:text-rose-900/40"
                  />
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(inspectingApp.id, inspectingApp.fullName)}
                      disabled={submittingId === inspectingApp.id}
                      className="bg-rose-700 text-white hover:bg-rose-800 font-bold"
                    >
                      Confirm Rejection
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRejectPrompt(false)}
                      className="border-rose-900 text-rose-950 hover:bg-rose-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t-2 border-ink">
                <div className="flex gap-2">
                  {inspectingApp.status === 'SUBMITTED' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCorrectionPrompt(true);
                          setShowRejectPrompt(false);
                        }}
                        className="text-amber-900 border-amber-900 hover:bg-amber-100 font-bold"
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
                        className="text-rose-900 border-rose-900 hover:bg-rose-100 font-bold"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInspectingApp(null)}
                    className="border-2 border-ink text-ink font-bold"
                  >
                    Close
                  </Button>
                  {inspectingApp.status === 'SUBMITTED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={submittingId === inspectingApp.id}
                      onClick={() =>
                        handleRecommendApproval(inspectingApp.id, inspectingApp.fullName, internalNotes)
                      }
                      className="font-display font-extrabold"
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      {submittingId === inspectingApp.id ? 'Submitting...' : 'Recommend to Super Admin'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
