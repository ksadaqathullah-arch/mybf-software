'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldAlert,
  ArrowLeftRight,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Building2,
  X,
  Zap,
} from 'lucide-react';

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

interface CorrectionItem {
  id: string;
  memberProfileId: string;
  field: string;
  oldValue: string | null;
  requestedValue: string;
  reason: string;
  status: string;
  createdAt: string;
  memberProfile: {
    fullName: string;
    chapter: { name: string };
    memberships: Array<{ membershipNumber: string }>;
  };
}

interface Metrics {
  pendingCorrections: number;
  pendingTransfers: number;
  completedTransfers: number;
  approvedCorrections: number;
  totalTransfers: number;
  totalCorrections: number;
}

export function SuperAdminGovernanceView() {
  const [metrics, setMetrics] = React.useState<Metrics>({
    pendingCorrections: 0,
    pendingTransfers: 0,
    completedTransfers: 0,
    approvedCorrections: 0,
    totalTransfers: 0,
    totalCorrections: 0,
  });

  const [transfers, setTransfers] = React.useState<TransferItem[]>([]);
  const [corrections, setCorrections] = React.useState<CorrectionItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<'transfers' | 'corrections'>('transfers');
  const [search, setSearch] = React.useState('');

  // Override modal
  const [selectedTransfer, setSelectedTransfer] = React.useState<TransferItem | null>(null);
  const [overrideAction, setOverrideAction] = React.useState<'FORCE_APPROVE' | 'FORCE_REJECT' | 'RESET_TO_PENDING'>('FORCE_APPROVE');
  const [justification, setJustification] = React.useState('');
  const [submittingOverride, setSubmittingOverride] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mRes, tRes, cRes] = await Promise.all([
        fetch('/api/v1/super-admin/governance?view=overview'),
        fetch('/api/v1/super-admin/governance?view=transfers'),
        fetch('/api/v1/super-admin/governance?view=corrections'),
      ]);

      const [mData, tData, cData] = await Promise.all([
        mRes.json(),
        tRes.json(),
        cRes.json(),
      ]);

      if (mData.success && mData.data) setMetrics(mData.data);
      if (tData.success && tData.transfers) setTransfers(tData.transfers);
      if (cData.success && cData.requests) setCorrections(cData.requests);
    } catch (err: any) {
      setError(err.message || 'Failed to load governance oversight registry.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOverrideSubmit = async () => {
    if (!selectedTransfer) return;
    if (justification.trim().length < 15) {
      setFeedback({ type: 'error', text: 'Executive justification is mandatory (minimum 15 characters).' });
      return;
    }

    setSubmittingOverride(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/v1/super-admin/governance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transferId: selectedTransfer.id,
          action: overrideAction,
          justification: justification.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', text: `Governance override applied successfully: ${overrideAction}` });
        setTimeout(() => {
          setSelectedTransfer(null);
          setJustification('');
          setFeedback(null);
          loadData();
        }, 1200);
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to apply override.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Network error occurred.' });
    } finally {
      setSubmittingOverride(false);
    }
  };

  const filteredTransfers = transfers.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.memberProfile.fullName.toLowerCase().includes(q) ||
      (t.memberProfile.memberships[0]?.membershipNumber || '').toLowerCase().includes(q) ||
      t.fromChapter.name.toLowerCase().includes(q) ||
      t.toChapter.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Chapter Transfers
              </span>
              <ArrowLeftRight className="h-4 w-4 text-indigo-500" />
            </div>
            <CardTitle className="text-2xl font-black text-indigo-600 mt-1">{metrics.totalTransfers}</CardTitle>
            <p className="text-[11px] text-slate-400 mt-0.5">Across all 16 chapters</p>
          </CardHeader>
        </Card>

        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Governance
              </span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-2xl font-black text-amber-600 mt-1">
              {metrics.pendingTransfers + metrics.pendingCorrections}
            </CardTitle>
            <p className="text-[11px] text-slate-400 mt-0.5">Transfers & corrections queue</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Completed Transfers
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {metrics.completedTransfers}
            </CardTitle>
            <p className="text-[11px] text-slate-400 mt-0.5">Atomic chapter reassignments</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Identity Corrections
              </span>
              <UserCheck className="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {metrics.totalCorrections}
            </CardTitle>
            <p className="text-[11px] text-slate-400 mt-0.5">Total audited requests</p>
          </CardHeader>
        </Card>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0A0F1D] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
          <button
            onClick={() => setTab('transfers')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              tab === 'transfers'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Transfers ({transfers.length})
          </button>
          <button
            onClick={() => setTab('corrections')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              tab === 'corrections'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Identity Corrections ({corrections.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name, ID or chapter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="shrink-0 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-[#0A0F1D] rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading global tenant governance registry...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center">
          <AlertCircle className="h-6 w-6 text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
          <Button variant="outline" size="sm" onClick={loadData} className="mt-3">
            Retry
          </Button>
        </div>
      ) : tab === 'transfers' ? (
        <div className="space-y-3">
          {filteredTransfers.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0A0F1D] rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">No chapter transfer records found matching query.</p>
            </div>
          ) : (
            filteredTransfers.map((t) => {
              const memId = t.memberProfile.memberships[0]?.membershipNumber || 'N/A';
              return (
                <Card key={t.id} className="transition-all hover:border-indigo-500/30">
                  <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {t.memberProfile.fullName}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
                          {memId}
                        </span>
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

                      <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        <span>{t.fromChapter.name}</span>
                        <span>→</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{t.toChapter.name}</span>
                        <span className="text-slate-400">• Requested {new Date(t.requestedAt).toLocaleDateString()}</span>
                      </div>

                      <div className="text-xs text-slate-500 italic">
                        Reason: &quot;{t.reason}&quot;
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTransfer(t);
                          setOverrideAction('FORCE_APPROVE');
                          setJustification('');
                          setFeedback(null);
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800"
                      >
                        <Zap className="h-3.5 w-3.5 mr-1.5" />
                        Super Admin Override
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {corrections.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{c.memberProfile.fullName}</div>
                  <div className="text-slate-500">
                    Field: <span className="font-semibold">{c.field}</span> → &quot;{c.requestedValue}&quot;
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Reason: {c.reason}</div>
                </div>
                <Badge variant={c.status === 'APPROVED' ? 'success' : 'warning'} className="text-[10px]">
                  {c.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Super Admin Override Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-white dark:bg-[#0A0F1D] shadow-2xl border-slate-200 dark:border-slate-800">
            <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-500" />
                  Super Admin Governance Override
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Emergency executive intervention for {selectedTransfer.memberProfile.fullName}
                </CardDescription>
              </div>
              <button onClick={() => setSelectedTransfer(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <span className="font-bold block">Root Tenant Authority Notice:</span>
                  Super Admin overrides bypass normal chapter endorsements and district administrative holds. All
                  overrides are permanently logged with your authenticated identity.
                </div>
              </div>

              {/* Action Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Override Directive
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer ${
                      overrideAction === 'FORCE_APPROVE'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="overrideAction"
                      checked={overrideAction === 'FORCE_APPROVE'}
                      onChange={() => setOverrideAction('FORCE_APPROVE')}
                      className="accent-emerald-600"
                    />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">FORCE APPROVE</div>
                      <div className="text-[11px] text-slate-500">
                        Immediately reassign member to destination chapter ({selectedTransfer.toChapter.name})
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer ${
                      overrideAction === 'FORCE_REJECT'
                        ? 'border-rose-500 bg-rose-500/10'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="overrideAction"
                      checked={overrideAction === 'FORCE_REJECT'}
                      onChange={() => setOverrideAction('FORCE_REJECT')}
                      className="accent-rose-600"
                    />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">FORCE REJECT</div>
                      <div className="text-[11px] text-slate-500">
                        Terminate transfer request and preserve member in {selectedTransfer.fromChapter.name}
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer ${
                      overrideAction === 'RESET_TO_PENDING'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="overrideAction"
                      checked={overrideAction === 'RESET_TO_PENDING'}
                      onChange={() => setOverrideAction('RESET_TO_PENDING')}
                      className="accent-blue-600"
                    />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">RESET TO PENDING</div>
                      <div className="text-[11px] text-slate-500">
                        Reset state machine to Stage 1 for re-evaluation by chapter executives
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Justification */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Root Justification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Mandatory root executive explanation for audit log (minimum 15 characters)..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Minimum 15 characters required.</span>
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setSelectedTransfer(null)} disabled={submittingOverride}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOverrideSubmit}
                  disabled={submittingOverride}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {submittingOverride ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Overriding...
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5 mr-1.5" /> Execute Override
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
