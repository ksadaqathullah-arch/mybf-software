'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalStatCard } from '@/components/ui/portal-elements';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeftRight,
  UserCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  MessageSquare,
  Building2,
  Calendar,
  X,
  ExternalLink,
  ChevronRight,
  User,
  Scale,
} from 'lucide-react';

interface CorrectionItem {
  id: string;
  memberProfileId: string;
  field: 'fullName' | 'dateOfBirth' | 'gender' | 'other';
  oldValue: string | null;
  requestedValue: string;
  reason: string;
  documentUrl?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED';
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  createdAt: string;
  memberProfile: {
    id: string;
    fullName: string;
    primaryPhone: string;
    email: string;
    district: string;
    chapter: {
      id: string;
      name: string;
      code: string;
    };
    memberships: Array<{
      membershipNumber: string;
      status: string;
    }>;
  };
}

interface TransferItem {
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
  fromChapter: {
    id: string;
    name: string;
    code: string;
  };
  toChapter: {
    id: string;
    name: string;
    code: string;
  };
  memberProfile: {
    id: string;
    fullName: string;
    primaryPhone: string;
    email: string;
    memberships: Array<{
      membershipNumber: string;
      status: string;
    }>;
  };
}

interface GovernanceMetrics {
  pendingCorrections: number;
  pendingTransfers: number;
  completedTransfers: number;
  approvedCorrections: number;
  totalTransfers: number;
  totalCorrections: number;
}

export function DistrictGovernanceView() {
  const [activeTab, setActiveTab] = React.useState<'corrections' | 'transfers' | 'metrics'>('corrections');
  const [metrics, setMetrics] = React.useState<GovernanceMetrics>({
    pendingCorrections: 0,
    pendingTransfers: 0,
    completedTransfers: 0,
    approvedCorrections: 0,
    totalTransfers: 0,
    totalCorrections: 0,
  });

  const [corrections, setCorrections] = React.useState<CorrectionItem[]>([]);
  const [transfers, setTransfers] = React.useState<TransferItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Correction review modal state
  const [selectedCorrection, setSelectedCorrection] = React.useState<CorrectionItem | null>(null);
  const [correctionDecision, setCorrectionDecision] = React.useState<'APPROVE' | 'REJECT' | 'REQUEST_CLARIFICATION'>('APPROVE');
  const [correctionNotes, setCorrectionNotes] = React.useState('');
  const [submittingCorrection, setSubmittingCorrection] = React.useState(false);

  // Transfer decision modal state
  const [selectedTransfer, setSelectedTransfer] = React.useState<TransferItem | null>(null);
  const [transferDecision, setTransferDecision] = React.useState<'APPROVE' | 'REJECT' | 'REQUEST_CLARIFICATION'>('APPROVE');
  const [transferRemarks, setTransferRemarks] = React.useState('');
  const [submittingTransfer, setSubmittingTransfer] = React.useState(false);

  // Toast / feedback message
  const [actionFeedback, setActionFeedback] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadAllData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [metRes, corRes, traRes] = await Promise.all([
        fetch('/api/v1/district-admin/governance?view=overview'),
        fetch('/api/v1/district-admin/governance?view=corrections'),
        fetch('/api/v1/district-admin/governance?view=transfers'),
      ]);

      const [metData, corData, traData] = await Promise.all([
        metRes.json(),
        corRes.json(),
        traRes.json(),
      ]);

      if (metData.success && metData.data) {
        setMetrics(metData.data);
      }
      if (corData.success && corData.requests) {
        setCorrections(corData.requests);
      }
      if (traData.success && traData.transfers) {
        setTransfers(traData.transfers);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load district governance data.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle Correction Decision Submission
  const handleCorrectionSubmit = async () => {
    if (!selectedCorrection) return;
    if (correctionNotes.trim().length < 5) {
      setActionFeedback({ type: 'error', text: 'Review notes are required (minimum 5 characters).' });
      return;
    }

    setSubmittingCorrection(true);
    setActionFeedback(null);
    try {
      const res = await fetch('/api/v1/district-admin/governance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review_correction',
          data: {
            requestId: selectedCorrection.id,
            decision: correctionDecision,
            reviewNotes: correctionNotes.trim(),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionFeedback({ type: 'success', text: `Identity correction ${correctionDecision.toLowerCase()}ed successfully.` });
        setTimeout(() => {
          setSelectedCorrection(null);
          setCorrectionNotes('');
          setActionFeedback(null);
          loadAllData();
        }, 1200);
      } else {
        setActionFeedback({ type: 'error', text: data.error || 'Failed to submit correction decision.' });
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', text: err.message || 'Network error occurred.' });
    } finally {
      setSubmittingCorrection(false);
    }
  };

  // Handle Transfer Decision Submission
  const handleTransferSubmit = async () => {
    if (!selectedTransfer) return;
    if (transferRemarks.trim().length < 5) {
      setActionFeedback({ type: 'error', text: 'Decision remarks are required (minimum 5 characters).' });
      return;
    }

    setSubmittingTransfer(true);
    setActionFeedback(null);
    try {
      const res = await fetch('/api/v1/district-admin/governance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'finalize_transfer',
          data: {
            transferId: selectedTransfer.id,
            decision: transferDecision,
            remarks: transferRemarks.trim(),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionFeedback({
          type: 'success',
          text: `Chapter transfer ${transferDecision.toLowerCase()}ed successfully. Member assignment updated.`,
        });
        setTimeout(() => {
          setSelectedTransfer(null);
          setTransferRemarks('');
          setActionFeedback(null);
          loadAllData();
        }, 1200);
      } else {
        setActionFeedback({ type: 'error', text: data.error || 'Failed to submit transfer decision.' });
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', text: err.message || 'Network error occurred.' });
    } finally {
      setSubmittingTransfer(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PortalStatCard
          label="Identity Corrections"
          value={metrics.pendingCorrections}
          subValue="Pending Name & DOB verifications"
          icon={UserCheck}
        />

        <PortalStatCard
          label="Transfer Decisions"
          value={metrics.pendingTransfers}
          subValue="Awaiting District Admin sign-off"
          icon={ArrowLeftRight}
        />

        <PortalStatCard
          label="Approved Transfers"
          value={metrics.completedTransfers}
          subValue="Atomic reassignment executed"
          icon={CheckCircle2}
        />

        <PortalStatCard
          label="Approved Corrections"
          value={metrics.approvedCorrections}
          subValue="Verified profile records updated"
          icon={ShieldCheck}
        />
      </div>

      {/* Tabs and Refresh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-paper p-3 border-2 border-ink shadow-[3px_3px_0px_#14161c]">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('corrections')}
            className={`px-3.5 py-1.5 text-xs font-display font-extrabold uppercase tracking-wider border-2 border-ink transition-all ${
              activeTab === 'corrections'
                ? 'bg-ink text-paper shadow-[2px_2px_0px_#fcc000]'
                : 'bg-paper text-ink hover:bg-yellow/20'
            }`}
          >
            Identity Corrections ({metrics.pendingCorrections})
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-3.5 py-1.5 text-xs font-display font-extrabold uppercase tracking-wider border-2 border-ink transition-all ${
              activeTab === 'transfers'
                ? 'bg-ink text-paper shadow-[2px_2px_0px_#fcc000]'
                : 'bg-paper text-ink hover:bg-yellow/20'
            }`}
          >
            Chapter Transfers ({metrics.pendingTransfers})
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3.5 py-1.5 text-xs font-display font-extrabold uppercase tracking-wider border-2 border-ink transition-all ${
              activeTab === 'metrics'
                ? 'bg-ink text-paper shadow-[2px_2px_0px_#fcc000]'
                : 'bg-paper text-ink hover:bg-yellow/20'
            }`}
          >
            Governance Overview
          </button>
        </div>

        <Button variant="outline" size="sm" onClick={loadAllData} disabled={loading} className="shrink-0 text-xs">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Registry
        </Button>
      </div>

      {/* TAB 1: IDENTITY CORRECTIONS */}
      {activeTab === 'corrections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-amber-500" />
              Member Identity Correction Requests
            </h2>
            <span className="text-xs text-slate-500">
              Subject to District Admin verification & 18–40 age criteria
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white dark:bg-[#0A0F1D] rounded-2xl border border-slate-200 dark:border-slate-800">
              <RefreshCw className="h-6 w-6 text-amber-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading identity correction requests...</p>
            </div>
          ) : corrections.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0A0F1D] rounded-2xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Identity Queue Clear</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                There are no pending identity correction requests in Malappuram district.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {corrections.map((c) => {
                const membershipNumber = c.memberProfile.memberships[0]?.membershipNumber || 'N/A';
                const isPending = c.status === 'PENDING';

                return (
                  <Card
                    key={c.id}
                    className={`transition-all hover:border-amber-500/40 ${
                      isPending ? 'border-l-4 border-l-amber-500 shadow-sm' : ''
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {c.memberProfile.fullName}
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-[#035AFC] bg-blue-500/10 px-2 py-0.5 rounded">
                              {membershipNumber}
                            </span>
                            <Badge variant="neutral" className="text-[10px]">
                              {c.memberProfile.chapter.name}
                            </Badge>
                            <Badge
                              variant={
                                c.status === 'APPROVED'
                                  ? 'success'
                                  : c.status === 'REJECTED'
                                  ? 'danger'
                                  : 'warning'
                              }
                              className="text-[10px]"
                            >
                              {c.status.replace(/_/g, ' ')}
                            </Badge>
                            <span className="text-[11px] text-slate-400">
                              Requested {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Field & Value Comparison */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                                Field To Correct
                              </span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {c.field === 'fullName'
                                  ? 'Full Legal Name'
                                  : c.field === 'dateOfBirth'
                                  ? 'Date of Birth (DOB)'
                                  : c.field}
                              </span>
                              <div className="mt-1 text-slate-500">
                                Current in System: <span className="font-mono text-slate-700 dark:text-slate-300">{c.oldValue || 'Not Set'}</span>
                              </div>
                            </div>

                            <div>
                              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-semibold block">
                                Requested Correction
                              </span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                                {c.requestedValue}
                              </span>
                              {c.field === 'dateOfBirth' && (
                                <div className="text-[10px] text-slate-400 mt-1">
                                  Policy Check: Candidate must be 18–40 years old on current date.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Reason */}
                          <div className="text-xs text-slate-600 dark:text-slate-300">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">Justification: </span>
                            {c.reason}
                          </div>

                          {/* Document attachment */}
                          {c.documentUrl && (
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                              <FileText className="h-3.5 w-3.5" />
                              <a
                                href={c.documentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline hover:text-blue-800 inline-flex items-center gap-1"
                              >
                                View Submitted Verification Document <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}

                          {c.reviewNotes && (
                            <div className="text-[11px] p-2 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Admin Review Notes: </span>
                              {c.reviewNotes}
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0 flex items-center justify-end">
                          {isPending ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setSelectedCorrection(c);
                                setCorrectionDecision('APPROVE');
                                setCorrectionNotes('');
                                setActionFeedback(null);
                              }}
                              className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                            >
                              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                              Review & Decide
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Decided</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CHAPTER TRANSFERS */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-blue-500" />
              Chapter Transfer Final Approvals
            </h2>
            <span className="text-xs text-slate-500">
              District Admin final authority to execute atomic chapter transfers
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white dark:bg-[#0A0F1D] rounded-2xl border border-slate-200 dark:border-slate-800">
              <RefreshCw className="h-6 w-6 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading chapter transfers...</p>
            </div>
          ) : transfers.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0A0F1D] rounded-2xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">No Pending Transfers</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No active chapter transfers requiring District Admin decision at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transfers.map((t) => {
                const membershipNumber = t.memberProfile.memberships[0]?.membershipNumber || 'N/A';
                const isReadyForDistrictDecision = t.status === 'DESTINATION_APPROVED';
                const isUnderChapterReview = t.status === 'REQUESTED' || t.status === 'CURRENT_APPROVED';

                return (
                  <Card
                    key={t.id}
                    className={`transition-all hover:border-blue-500/40 ${
                      isReadyForDistrictDecision ? 'border-l-4 border-l-emerald-500 shadow-sm' : ''
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {t.memberProfile.fullName}
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-[#035AFC] bg-blue-500/10 px-2 py-0.5 rounded">
                              {membershipNumber}
                            </span>

                            <Badge
                              variant={
                                t.status === 'COMPLETED'
                                  ? 'success'
                                  : t.status === 'REJECTED'
                                  ? 'danger'
                                  : isReadyForDistrictDecision
                                  ? 'success'
                                  : 'warning'
                              }
                              className="text-[10px]"
                            >
                              {t.status === 'DESTINATION_APPROVED'
                                ? 'AWAITING DISTRICT DECISION'
                                : t.status.replace(/_/g, ' ')}
                            </Badge>

                            <span className="text-[11px] text-slate-400">
                              Requested {new Date(t.requestedAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Route */}
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            <span>{t.fromChapter.name} ({t.fromChapter.code})</span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            <Building2 className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {t.toChapter.name} ({t.toChapter.code})
                            </span>
                          </div>

                          {/* Reason */}
                          <div className="text-xs bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">Member Justification: </span>
                            {t.reason}
                          </div>

                          {/* Chapter Recommendations */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2 rounded bg-slate-100/60 dark:bg-slate-900/40">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                                Origin Chapter ({t.fromChapter.code}) Recommendation:
                              </span>
                              <span className="text-slate-600 dark:text-slate-400">
                                {t.currentReviewNotes || 'Pending initial chapter review'}
                              </span>
                            </div>

                            <div className="p-2 rounded bg-slate-100/60 dark:bg-slate-900/40">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                                Destination Chapter ({t.toChapter.code}) Recommendation:
                              </span>
                              <span className="text-slate-600 dark:text-slate-400">
                                {t.destinationReviewNotes || 'Pending destination chapter endorsement'}
                              </span>
                            </div>
                          </div>

                          {t.districtReviewNotes && (
                            <div className="text-[11px] p-2 rounded bg-blue-500/10 text-blue-900 dark:text-blue-200 border border-blue-500/20">
                              <span className="font-bold">District Admin Decision Record: </span>
                              {t.districtReviewNotes}
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0 flex items-center justify-end">
                          {isReadyForDistrictDecision || isUnderChapterReview ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setSelectedTransfer(t);
                                setTransferDecision('APPROVE');
                                setTransferRemarks('');
                                setActionFeedback(null);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            >
                              <Scale className="h-3.5 w-3.5 mr-1.5" />
                              Final Decision
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Completed</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GOVERNANCE OVERVIEW & ARCHITECTURE METRICS */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <Card className="border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent">
            <CardHeader className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-600 text-white">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">
                    MYBF Malappuram District Governance Model
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-1">
                    Multi-tier identity integrity, immutable auditing, and high-assurance membership consistency
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 space-y-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <User className="h-4 w-4 text-amber-500" />
                    Permanent Identity Invariant
                  </h4>
                  <p>
                    A member&apos;s 10-digit ID (e.g. <span className="font-mono text-blue-500">MYBF-0000000001</span>)
                    is permanent and immutable. Transferring chapters or moving administrative taluks updates the live
                    chapter pointer without altering the member&apos;s credentials or historic tickets.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ArrowLeftRight className="h-4 w-4 text-blue-500" />
                    Three-Stage Transfer Approval
                  </h4>
                  <p>
                    Chapter transfers require formal endorsement from the origin chapter executive, acceptance by the
                    destination chapter executive, and final administrative approval by the District Admin to prevent
                    unauthorized constituency swapping.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    18–40 Age Verification Policy
                  </h4>
                  <p>
                    All Date of Birth correction requests are programmatically verified against the MYBF 18–40 youth
                    eligibility window. Out-of-bounds requests are rejected with clear administrative audit logging.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL 1: IDENTITY CORRECTION REVIEW */}
      {selectedCorrection && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-white dark:bg-[#0A0F1D] shadow-2xl border-slate-200 dark:border-slate-800">
            <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Review Identity Correction
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  {selectedCorrection.memberProfile.fullName} ({selectedCorrection.memberProfile.memberships[0]?.membershipNumber})
                </CardDescription>
              </div>
              <button
                onClick={() => setSelectedCorrection(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Field:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedCorrection.field}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Value:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{selectedCorrection.oldValue || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested Correction:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedCorrection.requestedValue}
                  </span>
                </div>
                <div className="pt-1 text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Reason: </span>
                  {selectedCorrection.reason}
                </div>
              </div>

              {/* Decision Options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Administrative Decision
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      correctionDecision === 'APPROVE'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="correctionDecision"
                      checked={correctionDecision === 'APPROVE'}
                      onChange={() => setCorrectionDecision('APPROVE')}
                      className="accent-emerald-600"
                    />
                    <div>
                      <div className="font-semibold">Approve Correction</div>
                      <div className="text-[11px] text-slate-500">
                        Update verified profile and record administrative approval
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      correctionDecision === 'REJECT'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="correctionDecision"
                      checked={correctionDecision === 'REJECT'}
                      onChange={() => setCorrectionDecision('REJECT')}
                      className="accent-rose-600"
                    />
                    <div>
                      <div className="font-semibold">Reject Request</div>
                      <div className="text-[11px] text-slate-500">
                        Retain existing verified value with explanation
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      correctionDecision === 'REQUEST_CLARIFICATION'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="correctionDecision"
                      checked={correctionDecision === 'REQUEST_CLARIFICATION'}
                      onChange={() => setCorrectionDecision('REQUEST_CLARIFICATION')}
                      className="accent-amber-600"
                    />
                    <div>
                      <div className="font-semibold">Request Supporting Evidence</div>
                      <div className="text-[11px] text-slate-500">
                        Notify member to attach government ID document
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Review Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Review Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                  placeholder="Enter decision rationale or instructions for member..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Minimum 5 characters.</span>
              </div>

              {actionFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    actionFeedback.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                  }`}
                >
                  {actionFeedback.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{actionFeedback.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setSelectedCorrection(null)} disabled={submittingCorrection}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCorrectionSubmit}
                  disabled={submittingCorrection}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {submittingCorrection ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Confirm Decision
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL 2: TRANSFER FINAL DECISION */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-white dark:bg-[#0A0F1D] shadow-2xl border-slate-200 dark:border-slate-800">
            <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  District Admin Transfer Decision
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Final decision for {selectedTransfer.memberProfile.fullName} ({selectedTransfer.memberProfile.memberships[0]?.membershipNumber})
                </CardDescription>
              </div>
              <button
                onClick={() => setSelectedTransfer(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Route:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedTransfer.fromChapter.name} → {selectedTransfer.toChapter.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Origin Chapter Rec:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {selectedTransfer.currentReviewNotes || 'Not recorded'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination Chapter Rec:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {selectedTransfer.destinationReviewNotes || 'Not recorded'}
                  </span>
                </div>
              </div>

              {/* Decision Options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Final District Action
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      transferDecision === 'APPROVE'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="transferDecision"
                      checked={transferDecision === 'APPROVE'}
                      onChange={() => setTransferDecision('APPROVE')}
                      className="accent-emerald-600"
                    />
                    <div>
                      <div className="font-semibold">Approve & Execute Transfer</div>
                      <div className="text-[11px] text-slate-500">
                        Atomically update active chapter assignment. Member ID remains permanent.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      transferDecision === 'REJECT'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="transferDecision"
                      checked={transferDecision === 'REJECT'}
                      onChange={() => setTransferDecision('REJECT')}
                      className="accent-rose-600"
                    />
                    <div>
                      <div className="font-semibold">Reject Transfer</div>
                      <div className="text-[11px] text-slate-500">
                        Retain member in origin chapter with administrative rationale
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Decision Remarks */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  District Decision Remarks <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  placeholder="Enter district executive rationale, meeting reference, or conditions..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Minimum 5 characters.</span>
              </div>

              {actionFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    actionFeedback.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                  }`}
                >
                  {actionFeedback.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{actionFeedback.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setSelectedTransfer(null)} disabled={submittingTransfer}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleTransferSubmit}
                  disabled={submittingTransfer}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submittingTransfer ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Executing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Execute Decision
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
