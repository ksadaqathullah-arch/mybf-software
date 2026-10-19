'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  MessageSquare,
  Building2,
  ShieldCheck,
  ChevronRight,
  X,
  FileText,
} from 'lucide-react';

interface TransferRecord {
  id: string;
  memberProfileId: string;
  fromChapterId: string;
  toChapterId: string;
  status: 'REQUESTED' | 'CURRENT_APPROVED' | 'DESTINATION_APPROVED' | 'COMPLETED' | 'REJECTED';
  reason: string;
  currentReviewNotes?: string | null;
  destinationReviewNotes?: string | null;
  districtReviewNotes?: string | null;
  requestedAt: string;
  completedAt?: string | null;
  rejectionReason?: string | null;
  fromChapter: {
    id: string;
    name: string;
    code: string;
    slug: string;
  };
  toChapter: {
    id: string;
    name: string;
    code: string;
    slug: string;
  };
  memberProfile: {
    id: string;
    fullName: string;
    primaryPhone: string;
    email: string;
    user: {
      id: string;
      email: string | null;
      phone: string | null;
    };
    memberships: Array<{
      id: string;
      membershipNumber: string;
      status: string;
    }>;
  };
}

interface ChapterTransfersViewProps {
  chapterId: string;
  chapterName: string;
  chapterSlug: string;
}

export function ChapterTransfersView({
  chapterId,
  chapterName,
  chapterSlug,
}: ChapterTransfersViewProps) {
  const [transfers, setTransfers] = React.useState<TransferRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [directionFilter, setDirectionFilter] = React.useState<'ALL' | 'OUTGOING' | 'INCOMING'>('ALL');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Recommendation modal state
  const [selectedTransfer, setSelectedTransfer] = React.useState<TransferRecord | null>(null);
  const [recommendation, setRecommendation] = React.useState<
    'RECOMMEND_APPROVAL' | 'RECOMMEND_REJECTION' | 'REQUEST_CLARIFICATION'
  >('RECOMMEND_APPROVAL');
  const [reviewRemarks, setReviewRemarks] = React.useState('');
  const [submittingReview, setSubmittingReview] = React.useState(false);
  const [reviewMessage, setReviewMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTransfers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (directionFilter !== 'ALL') params.set('direction', directionFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await fetch(`/api/v1/chapter/transfers?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.transfers) {
        setTransfers(data.transfers);
      } else {
        setError(data.error || 'Failed to fetch transfer requests');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading transfer requests');
    } finally {
      setLoading(false);
    }
  }, [directionFilter, statusFilter]);

  React.useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const handleOpenReview = (transfer: TransferRecord) => {
    setSelectedTransfer(transfer);
    setRecommendation('RECOMMEND_APPROVAL');
    setReviewRemarks('');
    setReviewMessage(null);
  };

  const handleCloseReview = () => {
    setSelectedTransfer(null);
    setReviewRemarks('');
    setReviewMessage(null);
  };

  const handleSubmitRecommendation = async () => {
    if (!selectedTransfer) return;
    if (reviewRemarks.trim().length < 5) {
      setReviewMessage({ type: 'error', text: 'Please provide at least 5 characters of review notes.' });
      return;
    }

    setSubmittingReview(true);
    setReviewMessage(null);

    try {
      const res = await fetch('/api/v1/chapter/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transferId: selectedTransfer.id,
          recommendation,
          remarks: reviewRemarks.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReviewMessage({ type: 'success', text: 'Executive recommendation successfully submitted.' });
        setTimeout(() => {
          handleCloseReview();
          fetchTransfers();
        }, 1200);
      } else {
        setReviewMessage({ type: 'error', text: data.error || 'Failed to submit recommendation.' });
      }
    } catch (err: any) {
      setReviewMessage({ type: 'error', text: err.message || 'Network error occurred.' });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filter transfers by search
  const filteredTransfers = transfers.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const memberName = t.memberProfile.fullName.toLowerCase();
    const memNumber = t.memberProfile.memberships[0]?.membershipNumber.toLowerCase() || '';
    const fromName = t.fromChapter.name.toLowerCase();
    const toName = t.toChapter.name.toLowerCase();
    return memberName.includes(q) || memNumber.includes(q) || fromName.includes(q) || toName.includes(q);
  });

  const outgoingCount = transfers.filter((t) => t.fromChapterId === chapterId).length;
  const incomingCount = transfers.filter((t) => t.toChapterId === chapterId).length;
  const pendingActionCount = transfers.filter((t) => {
    if (t.fromChapterId === chapterId && t.status === 'REQUESTED') return true;
    if (t.toChapterId === chapterId && t.status === 'CURRENT_APPROVED') return true;
    return false;
  }).length;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Action</span>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle className="text-2xl font-black text-blue-600 mt-1">{pendingActionCount}</CardTitle>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting this chapter&apos;s review</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outgoing Requests</span>
              <ArrowUpRight className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white mt-1">{outgoingCount}</CardTitle>
            <p className="text-[11px] text-slate-400 mt-0.5">Members transferring out</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Incoming Requests</span>
              <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white mt-1">{incomingCount}</CardTitle>
            <p className="text-[11px] text-slate-400 mt-0.5">Members transferring in</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pipeline</span>
              <ArrowLeftRight className="h-4 w-4 text-slate-400" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white mt-1">{transfers.length}</CardTitle>
            <p className="text-[11px] text-slate-400 mt-0.5">All historic & active requests</p>
          </CardHeader>
        </Card>
      </div>

      {/* Filter & Controls Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white dark:bg-[#0A0F1D] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Direction filters */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
            <button
              onClick={() => setDirectionFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                directionFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDirectionFilter('OUTGOING')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                directionFilter === 'OUTGOING'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Outgoing ({outgoingCount})
            </button>
            <button
              onClick={() => setDirectionFilter('INCOMING')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                directionFilter === 'INCOMING'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Incoming ({incomingCount})
            </button>
          </div>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="REQUESTED">Requested (Stage 1)</option>
            <option value="CURRENT_APPROVED">Origin Approved (Stage 2)</option>
            <option value="DESTINATION_APPROVED">Destination Approved (Stage 3)</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search member or chapter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <Button variant="outline" size="sm" onClick={fetchTransfers} disabled={loading} className="shrink-0">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-[#0A0F1D] rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="h-6 w-6 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading transfer requests from database...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center">
          <AlertCircle className="h-6 w-6 text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchTransfers} className="mt-3">
            Retry
          </Button>
        </div>
      ) : filteredTransfers.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#0A0F1D] rounded-2xl border border-slate-200 dark:border-slate-800">
          <ArrowLeftRight className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">No Transfer Requests Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No requests match your search criteria. Try modifying your filters.'
              : 'There are currently no active or historic chapter transfer requests for this chapter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransfers.map((t) => {
            const isOutgoing = t.fromChapterId === chapterId;
            const membershipNumber = t.memberProfile.memberships[0]?.membershipNumber || 'N/A';
            const isAwaitingCurrentChapter = isOutgoing && t.status === 'REQUESTED';
            const isAwaitingDestinationChapter = !isOutgoing && t.status === 'CURRENT_APPROVED';
            const canTakeAction = isAwaitingCurrentChapter || isAwaitingDestinationChapter;

            return (
              <Card
                key={t.id}
                className={`transition-all hover:border-blue-500/40 ${
                  canTakeAction ? 'border-l-4 border-l-blue-500 shadow-sm' : ''
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Member & Route */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {t.memberProfile.fullName}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-[#035AFC] bg-blue-500/10 px-2 py-0.5 rounded">
                          {membershipNumber}
                        </span>

                        {isOutgoing ? (
                          <Badge variant="warning" className="text-[10px] flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3" /> OUTGOING
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[10px] flex items-center gap-1">
                            <ArrowDownLeft className="h-3 w-3" /> INCOMING
                          </Badge>
                        )}

                        <Badge
                          variant={
                            t.status === 'COMPLETED'
                              ? 'success'
                              : t.status === 'REJECTED'
                              ? 'danger'
                              : 'primary'
                          }
                          className="text-[10px]"
                        >
                          {t.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      {/* Chapter Route */}
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1 font-medium">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span>{t.fromChapter.name}</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <div className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{t.toChapter.name}</span>
                        </div>
                        <span className="text-slate-400">•</span>
                        <span className="text-[11px] text-slate-400">
                          Requested {new Date(t.requestedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Reason */}
                      <div className="text-xs bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                        <span className="font-medium text-slate-700 dark:text-slate-200">Member Reason: </span>
                        {t.reason}
                      </div>

                      {/* Workflow review timeline notes */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]">
                        <div className="p-2 rounded bg-slate-100/60 dark:bg-slate-900/40">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                            1. Origin Chapter:
                          </span>
                          <span className="text-slate-500">
                            {t.currentReviewNotes || (t.status === 'REQUESTED' ? 'Awaiting review' : 'No notes')}
                          </span>
                        </div>

                        <div className="p-2 rounded bg-slate-100/60 dark:bg-slate-900/40">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                            2. Destination Chapter:
                          </span>
                          <span className="text-slate-500">
                            {t.destinationReviewNotes ||
                              (t.status === 'CURRENT_APPROVED'
                                ? 'Awaiting review'
                                : t.status === 'REQUESTED'
                                ? 'Queued after Stage 1'
                                : 'No notes')}
                          </span>
                        </div>

                        <div className="p-2 rounded bg-slate-100/60 dark:bg-slate-900/40">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                            3. District Admin:
                          </span>
                          <span className="text-slate-500">
                            {t.districtReviewNotes ||
                              (t.status === 'DESTINATION_APPROVED' ? 'Awaiting final decision' : 'Pending stages 1 & 2')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action */}
                    <div className="shrink-0 flex flex-col items-end justify-center pt-2 lg:pt-0">
                      {canTakeAction ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenReview(t)}
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                          Review & Recommend
                        </Button>
                      ) : (
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block">
                            {t.status === 'COMPLETED'
                              ? 'Transfer executed'
                              : t.status === 'REJECTED'
                              ? 'Transfer rejected'
                              : 'Pending other stages'}
                          </span>
                          <span className="text-[10px] text-slate-400">Read only</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Recommendation Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-white dark:bg-[#0A0F1D] shadow-2xl border-slate-200 dark:border-slate-800">
            <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Executive Chapter Recommendation
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Reviewing transfer for {selectedTransfer.memberProfile.fullName} ({selectedTransfer.memberProfile.memberships[0]?.membershipNumber})
                </CardDescription>
              </div>
              <button
                onClick={handleCloseReview}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Route:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedTransfer.fromChapter.name} → {selectedTransfer.toChapter.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Member Reason:</span>
                  <span className="text-slate-700 dark:text-slate-300 text-right max-w-xs">{selectedTransfer.reason}</span>
                </div>
              </div>

              {/* Recommendation Options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Your Chapter Recommendation
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      recommendation === 'RECOMMEND_APPROVAL'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      checked={recommendation === 'RECOMMEND_APPROVAL'}
                      onChange={() => setRecommendation('RECOMMEND_APPROVAL')}
                      className="accent-emerald-600"
                    />
                    <div>
                      <div className="font-semibold">Recommend Approval</div>
                      <div className="text-[11px] text-slate-500">Endorse member transfer to proceed to next stage</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      recommendation === 'RECOMMEND_REJECTION'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      checked={recommendation === 'RECOMMEND_REJECTION'}
                      onChange={() => setRecommendation('RECOMMEND_REJECTION')}
                      className="accent-rose-600"
                    />
                    <div>
                      <div className="font-semibold">Recommend Rejection</div>
                      <div className="text-[11px] text-slate-500">Advise District Admin against this transfer</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      recommendation === 'REQUEST_CLARIFICATION'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      checked={recommendation === 'REQUEST_CLARIFICATION'}
                      onChange={() => setRecommendation('REQUEST_CLARIFICATION')}
                      className="accent-amber-600"
                    />
                    <div>
                      <div className="font-semibold">Request Clarification</div>
                      <div className="text-[11px] text-slate-500">Request additional details from the member</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Review Remarks & Feedback <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="Enter executive review notes, verification findings, or reasons..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Minimum 5 characters. Stored in immutable audit log.</span>
              </div>

              {reviewMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    reviewMessage.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                  }`}
                >
                  {reviewMessage.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{reviewMessage.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={handleCloseReview} disabled={submittingReview}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitRecommendation}
                  disabled={submittingReview}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submittingReview ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Submit Recommendation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
