'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalStatCard } from '@/components/ui/portal-elements';
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
      if (cData.success && cData.corrections) setCorrections(cData.corrections);
    } catch (err: any) {
      setError(err.message || 'Failed to load governance data.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOverrideSubmit = async () => {
    if (!selectedTransfer) return;
    if (!justification || justification.trim().length < 15) {
      setFeedback({ type: 'error', text: 'Executive justification must be at least 15 characters.' });
      return;
    }

    setSubmittingOverride(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/v1/super-admin/governance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'OVERRIDE_TRANSFER',
          transferId: selectedTransfer.id,
          overrideAction,
          reason: justification.trim(),
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
        <PortalStatCard
          label="Total Chapter Transfers"
          value={metrics.totalTransfers}
          detail="Across all 16 chapters"
          icon={ArrowLeftRight}
        />
        <PortalStatCard
          label="Pending Governance"
          value={metrics.pendingTransfers + metrics.pendingCorrections}
          detail="Transfers & corrections queue"
          icon={Clock}
          accent="yellow"
        />
        <PortalStatCard
          label="Completed Transfers"
          value={metrics.completedTransfers}
          detail="Atomic chapter reassignments"
          icon={CheckCircle2}
          accent="emerald"
        />
        <PortalStatCard
          label="Identity Corrections"
          value={metrics.totalCorrections}
          detail="Total audited requests"
          icon={UserCheck}
          accent="blue"
        />
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-2 border-ink bg-paper p-3 shadow-[3px_3px_0px_#14161c]">
        <div className="flex items-center gap-1 border-2 border-ink bg-paper-2 p-1">
          <button
            onClick={() => setTab('transfers')}
            className={`px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'transfers'
                ? 'bg-ink text-paper shadow-[2px_2px_0px_#fcc000]'
                : 'text-ink hover:bg-ink/10'
            }`}
          >
            Chapter Transfers ({transfers.length})
          </button>
          <button
            onClick={() => setTab('corrections')}
            className={`px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'corrections'
                ? 'bg-ink text-paper shadow-[2px_2px_0px_#fcc000]'
                : 'text-ink hover:bg-ink/10'
            }`}
          >
            Identity Corrections ({corrections.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Filter by name, ID or chapter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border-2 border-ink text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-yellow font-sans shadow-[2px_2px_0px_#14161c]"
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
        <div className="p-12 text-center border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c]">
          <RefreshCw className="h-6 w-6 text-blue animate-spin mx-auto mb-2" />
          <p className="font-display text-xs font-bold uppercase tracking-wider text-muted">Loading global tenant governance registry...</p>
        </div>
      ) : error ? (
        <div className="p-6 border-2 border-rose-800 bg-rose-50 text-center shadow-[4px_4px_0px_#14161c]">
          <AlertCircle className="h-6 w-6 text-rose-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-rose-800 font-sans">{error}</p>
          <Button variant="outline" size="sm" onClick={loadData} className="mt-3">
            Retry
          </Button>
        </div>
      ) : tab === 'transfers' ? (
        <div className="space-y-3">
          {filteredTransfers.length === 0 ? (
            <div className="p-12 text-center border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c]">
              <p className="font-serif text-xs text-muted">No chapter transfer records found matching query.</p>
            </div>
          ) : (
            filteredTransfers.map((t) => {
              const memId = t.memberProfile.memberships[0]?.membershipNumber || 'N/A';
              return (
                <div key={t.id} className="border-2 border-ink bg-paper p-5 shadow-[4px_4px_0px_#14161c] flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-extrabold text-ink text-sm uppercase">
                        {t.memberProfile.fullName}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-blue bg-blue/10 border border-blue/30 px-2 py-0.5">
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
                      >
                        {t.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    <div className="text-xs text-ink font-sans flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-muted" />
                      <span>{t.fromChapter.name}</span>
                      <span>→</span>
                      <span className="font-bold">{t.toChapter.name}</span>
                      <span className="text-muted">• Requested {new Date(t.requestedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="text-xs text-muted font-serif italic">
                      Reason: &quot;{t.reason}&quot;
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedTransfer(t);
                        setOverrideAction('FORCE_APPROVE');
                        setJustification('');
                        setFeedback(null);
                      }}
                    >
                      <Zap className="h-3.5 w-3.5 mr-1.5" />
                      Super Admin Override
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {corrections.map((c) => (
            <div key={c.id} className="border-2 border-ink bg-paper p-4 flex items-center justify-between text-xs shadow-[3px_3px_0px_#14161c]">
              <div>
                <div className="font-display font-bold text-ink uppercase text-sm">{c.memberProfile.fullName}</div>
                <div className="text-muted font-serif mt-0.5">
                  Field: <strong className="text-ink">{c.field}</strong> → &quot;{c.requestedValue}&quot;
                </div>
                <div className="text-muted font-serif text-[11px] mt-0.5">Reason: {c.reason}</div>
              </div>
              <Badge variant={c.status === 'APPROVED' ? 'success' : 'warning'}>
                {c.status}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Super Admin Override Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="max-w-lg w-full border-2 border-ink bg-paper text-ink shadow-[12px_12px_0px_#14161c] p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <div>
                <h3 className="font-display font-extrabold text-base text-ink uppercase tracking-tight flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow" />
                  Super Admin Governance Override
                </h3>
                <p className="font-serif text-xs text-muted mt-0.5">
                  Emergency executive intervention for {selectedTransfer.memberProfile.fullName}
                </p>
              </div>
              <button onClick={() => setSelectedTransfer(null)} className="p-1 border border-ink text-ink hover:bg-ink hover:text-paper cursor-pointer transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 border-2 border-amber-800 bg-amber-50 text-xs text-amber-950 flex items-start gap-2 shadow-[2px_2px_0px_#14161c]">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
                <div className="font-serif leading-relaxed">
                  <strong className="font-display uppercase tracking-wider block">Root Tenant Authority Notice:</strong>
                  Super Admin overrides bypass normal chapter endorsements and district administrative holds. All
                  overrides are permanently logged with your authenticated identity.
                </div>
              </div>

              {/* Action Selection */}
              <div className="space-y-2">
                <label className="text-xs font-display font-bold uppercase tracking-wider text-ink block">
                  Override Directive
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <label
                    className={`flex items-center gap-3 p-3 border-2 border-ink text-xs cursor-pointer shadow-[2px_2px_0px_#14161c] ${
                      overrideAction === 'FORCE_APPROVE'
                        ? 'bg-emerald-100 border-emerald-900 font-bold'
                        : 'bg-paper'
                    }`}
                  >
                    <input
                      type="radio"
                      name="overrideAction"
                      checked={overrideAction === 'FORCE_APPROVE'}
                      onChange={() => setOverrideAction('FORCE_APPROVE')}
                      className="accent-ink"
                    />
                    <div>
                      <div className="font-display font-extrabold uppercase">FORCE APPROVE</div>
                      <div className="text-[11px] font-serif text-muted">
                        Immediately reassign member to destination chapter ({selectedTransfer.toChapter.name})
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 border-2 border-ink text-xs cursor-pointer shadow-[2px_2px_0px_#14161c] ${
                      overrideAction === 'FORCE_REJECT'
                        ? 'bg-rose-100 border-rose-900 font-bold'
                        : 'bg-paper'
                    }`}
                  >
                    <input
                      type="radio"
                      name="overrideAction"
                      checked={overrideAction === 'FORCE_REJECT'}
                      onChange={() => setOverrideAction('FORCE_REJECT')}
                      className="accent-ink"
                    />
                    <div>
                      <div className="font-display font-extrabold uppercase">FORCE REJECT</div>
                      <div className="text-[11px] font-serif text-muted">
                        Terminate transfer request and preserve member in {selectedTransfer.fromChapter.name}
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 border-2 border-ink text-xs cursor-pointer shadow-[2px_2px_0px_#14161c] ${
                      overrideAction === 'RESET_TO_PENDING'
                        ? 'bg-blue/15 border-blue font-bold'
                        : 'bg-paper'
                    }`}
                  >
                    <input
                      type="radio"
                      name="overrideAction"
                      checked={overrideAction === 'RESET_TO_PENDING'}
                      onChange={() => setOverrideAction('RESET_TO_PENDING')}
                      className="accent-ink"
                    />
                    <div>
                      <div className="font-display font-extrabold uppercase">RESET TO PENDING</div>
                      <div className="text-[11px] font-serif text-muted">
                        Reset state machine to Stage 1 for re-evaluation by chapter executives
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Justification */}
              <div className="space-y-1.5">
                <label className="text-xs font-display font-bold uppercase tracking-wider text-ink flex items-center justify-between">
                  <span>Root Justification *</span>
                  <span className="text-[10px] font-normal text-muted font-sans">Min 15 chars</span>
                </label>
                <textarea
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Mandatory root executive explanation for audit log (minimum 15 characters)..."
                  className="w-full text-xs p-3 border-2 border-ink bg-white focus:outline-none focus:ring-2 focus:ring-yellow text-ink font-sans shadow-[2px_2px_0px_#14161c]"
                />
              </div>

              {feedback && (
                <div
                  className={`p-3 border-2 text-xs flex items-center gap-2 font-bold ${
                    feedback.type === 'success'
                      ? 'border-emerald-800 bg-emerald-50 text-emerald-950'
                      : 'border-rose-800 bg-rose-50 text-rose-950'
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

              <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-ink">
                <Button variant="outline" size="sm" onClick={() => setSelectedTransfer(null)} disabled={submittingOverride}>
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleOverrideSubmit}
                  disabled={submittingOverride}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
