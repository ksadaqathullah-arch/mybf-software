'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, UserCheck, UserX, AlertCircle, Clock, Check, X, FileText, Calendar } from 'lucide-react';
import { getMemberCategoryLabel, getCurrentPositionLabel } from '@/features/memberships/constants/member-classifications';

export interface AgeExceptionItem {
  id: string;
  userId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string;
  age: number;
  justification: string;
  chapterName: string;
  chapterSlug: string;
  memberCategory: any;
  currentPosition: any;
  submittedAt: string;
}

export function SuperAdminAgeExceptionQueue() {
  const [exceptions, setExceptions] = React.useState<AgeExceptionItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Selected item for review action
  const [selectedApp, setSelectedApp] = React.useState<AgeExceptionItem | null>(null);
  const [reviewAction, setReviewAction] = React.useState<'APPROVE' | 'REJECT' | null>(null);
  const [reason, setReason] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);

  const fetchExceptions = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/v1/super-admin/age-exceptions');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch age exception reviews.');
      }
      setExceptions(data.exceptions || []);
    } catch (err: any) {
      setError(err.message || 'Error loading exceptions');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchExceptions();
  }, [fetchExceptions]);

  const handleOpenReview = (app: AgeExceptionItem, action: 'APPROVE' | 'REJECT') => {
    setSelectedApp(app);
    setReviewAction(action);
    setReason('');
    setFeedbackMessage(null);
  };

  const handleCloseReview = () => {
    setSelectedApp(null);
    setReviewAction(null);
    setReason('');
  };

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !reviewAction) return;

    if (!reason || reason.trim().length < 10) {
      alert('Mandatory decision reason must be at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/super-admin/age-exceptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          decision: reviewAction,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit decision.');
      }

      setFeedbackMessage(
        reviewAction === 'APPROVE'
          ? `Age exception approved for ${selectedApp.fullName} (Age ${selectedApp.age}). Application is now unblocked for chapter review.`
          : `Age exception rejected for ${selectedApp.fullName}.`
      );

      // Remove from active list
      setExceptions((prev) => prev.filter((a) => a.id !== selectedApp.id));
      handleCloseReview();
      setTimeout(() => setFeedbackMessage(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent shadow-md">
      <CardHeader className="p-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Super Admin Age Exception Review Queue</CardTitle>
              <Badge variant="warning">{exceptions.length} PENDING DECISION</Badge>
            </div>
            <CardDescription className="text-xs">
              Strict Super Admin review gate for applicants aged 36 and above. Normal chapter admins cannot bypass this restriction.
            </CardDescription>
          </div>

          <Button variant="outline" size="sm" onClick={fetchExceptions} disabled={loading} className="h-8 text-xs">
            Refresh Queue
          </Button>
        </div>

        {feedbackMessage && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between">
            <span className="font-medium">{feedbackMessage}</span>
            <button onClick={() => setFeedbackMessage(null)}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6 pt-2">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading pending age exceptions...</div>
        ) : error ? (
          <div className="py-6 text-center text-xs text-rose-500">{error}</div>
        ) : exceptions.length === 0 ? (
          <div className="py-8 text-center space-y-1">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Pending Age Exception Requests</div>
            <p className="text-xs text-slate-400">All submitted applications currently meet standard youth eligibility (aged 35 years or below) or have already been decided.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-2">Applicant</th>
                  <th className="py-3 px-2">DOB & Age</th>
                  <th className="py-3 px-2">Requested Chapter</th>
                  <th className="py-3 px-2">Classification</th>
                  <th className="py-3 px-2">Applicant Justification</th>
                  <th className="py-3 px-2 text-right">Super Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {exceptions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-2">
                      <div className="font-bold text-slate-900 dark:text-white">{item.fullName}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.email} • {item.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {item.age} Years Old
                      </span>
                      <div className="text-[10px] text-slate-400">DOB: {item.dateOfBirth}</div>
                    </td>
                    <td className="py-3.5 px-2">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{item.chapterName}</div>
                      <div className="text-[10px] text-slate-400">Malappuram Constituency</div>
                    </td>
                    <td className="py-3.5 px-2">
                      <Badge variant="primary" className="text-[10px] mb-1">
                        {getMemberCategoryLabel(item.memberCategory)}
                      </Badge>
                      <div className="text-[10px] text-slate-400">
                        {getCurrentPositionLabel(item.currentPosition)}
                      </div>
                    </td>
                    <td className="py-3.5 px-2 max-w-xs">
                      <div className="text-xs text-slate-700 dark:text-slate-300 italic bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800/50">
                        &quot;{item.justification}&quot;
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenReview(item, 'APPROVE')}
                          className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <UserCheck className="h-3.5 w-3.5 mr-1" /> Approve Exception
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReview(item, 'REJECT')}
                          className="h-7 text-xs px-2.5 text-rose-500 hover:text-rose-700 border-rose-300 dark:border-rose-800"
                        >
                          <UserX className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal / Dialog for Mandatory Decision Reason */}
        {selectedApp && reviewAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  {reviewAction === 'APPROVE' ? (
                    <UserCheck className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <UserX className="h-5 w-5 text-rose-500" />
                  )}
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {reviewAction === 'APPROVE' ? 'Approve Age Exception' : 'Reject Age Exception'}
                  </h3>
                </div>
                <button onClick={handleCloseReview} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                  Applicant: <strong>{selectedApp.fullName}</strong> ({selectedApp.age} years old)
                </div>
                <div>
                  Chapter: <strong>{selectedApp.chapterName}</strong> • Category: <strong>{getMemberCategoryLabel(selectedApp.memberCategory)}</strong>
                </div>
                <div className="pt-1 text-slate-500 italic">
                  Applicant Reason: &quot;{selectedApp.justification}&quot;
                </div>
              </div>

              <form onSubmit={handleSubmitDecision} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Mandatory {reviewAction === 'APPROVE' ? 'Approval' : 'Rejection'} Reason *</span>
                    <span className="text-[10px] text-slate-400">Min 10 characters (Audited)</span>
                  </label>
                  <textarea
                    required
                    minLength={10}
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={
                      reviewAction === 'APPROVE'
                        ? 'State the governance rationale for granting this age exception (e.g., Senior mentor contribution, established enterprise expertise)...'
                        : 'State the rationale for declining this age exception...'
                    }
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] p-2.5 text-xs focus:ring-2 focus:ring-[#035AFC]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button type="button" variant="outline" size="sm" onClick={handleCloseReview} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={submitting || reason.trim().length < 10}
                    className={reviewAction === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}
                  >
                    {submitting ? 'Recording...' : `Confirm ${reviewAction === 'APPROVE' ? 'Approval' : 'Rejection'}`}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
