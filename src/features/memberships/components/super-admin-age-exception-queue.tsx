'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, UserCheck, UserX, Clock, Calendar, X } from 'lucide-react';
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
    <Card className="border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c]">
      <CardHeader className="p-5 sm:p-6 pb-4 border-b-2 border-ink bg-paper-2/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Clock className="h-5 w-5 text-yellow" />
              <CardTitle className="font-display font-extrabold text-xl text-ink uppercase tracking-tight">
                Age Exception Review Queue
              </CardTitle>
              <Badge variant="warning">{exceptions.length} PENDING DECISION</Badge>
            </div>
            <CardDescription className="font-serif text-xs sm:text-sm text-muted">
              Strict Super Admin review gate for applicants aged 36 and above. Normal chapter admins cannot bypass this restriction.
            </CardDescription>
          </div>

          <Button variant="outline" size="sm" onClick={fetchExceptions} disabled={loading}>
            Refresh Queue
          </Button>
        </div>

        {feedbackMessage && (
          <div className="mt-4 p-3.5 border-2 border-emerald-800 bg-emerald-50 text-emerald-950 font-sans text-xs font-bold flex items-center justify-between shadow-[2px_2px_0px_#14161c]">
            <span>{feedbackMessage}</span>
            <button onClick={() => setFeedbackMessage(null)} className="cursor-pointer hover:opacity-75">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="py-12 text-center text-xs font-display font-bold uppercase tracking-wider text-muted">
            Loading pending age exceptions...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-xs font-display font-bold uppercase text-rose-700 bg-rose-50 border-b border-rose-200">
            {error}
          </div>
        ) : exceptions.length === 0 ? (
          <div className="py-12 text-center space-y-1.5 p-6">
            <div className="font-display text-base font-extrabold text-ink uppercase tracking-tight">
              No Pending Age Exception Requests
            </div>
            <p className="font-serif text-xs text-muted max-w-md mx-auto">
              All submitted applications currently meet standard youth eligibility (aged 35 years or below) or have already been decided.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="border-b-2 border-ink bg-ink text-paper font-display text-[11px] font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-paper">Applicant</th>
                  <th className="py-3 px-4 text-paper">DOB & Age</th>
                  <th className="py-3 px-4 text-paper">Requested Chapter</th>
                  <th className="py-3 px-4 text-paper">Classification</th>
                  <th className="py-3 px-4 text-paper">Applicant Justification</th>
                  <th className="py-3 px-4 text-paper text-right">Super Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/15 font-sans">
                {exceptions.map((item) => (
                  <tr key={item.id} className="hover:bg-yellow/15 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-display font-extrabold text-sm text-ink">{item.fullName}</div>
                      <div className="font-serif text-[11px] text-muted">
                        {item.email} • {item.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-display font-bold text-xs text-ink bg-yellow px-2 py-0.5 border border-ink shadow-[1px_1px_0px_#14161c]">
                        <Calendar className="h-3 w-3" />
                        {item.age} Years Old
                      </span>
                      <div className="text-[10px] text-muted font-mono mt-1">DOB: {item.dateOfBirth}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-display font-bold text-xs text-ink uppercase">{item.chapterName}</div>
                      <div className="text-[10px] text-muted font-serif">Constituency Chapter</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="primary" className="mb-1">
                        {getMemberCategoryLabel(item.memberCategory)}
                      </Badge>
                      <div className="text-[11px] text-muted font-serif">
                        {getCurrentPositionLabel(item.currentPosition)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-xs text-ink font-serif italic bg-paper-2 p-2.5 border border-ink/30 shadow-[1px_1px_0px_#14161c]">
                        &quot;{item.justification}&quot;
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenReview(item, 'APPROVE')}
                          className="h-8 text-[11px] px-3 bg-emerald-100 text-emerald-950 border-emerald-900 hover:bg-emerald-200"
                        >
                          <UserCheck className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReview(item, 'REJECT')}
                          className="h-8 text-[11px] px-3 text-rose-700 border-rose-700 hover:bg-rose-100"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="border-2 border-ink bg-paper text-ink shadow-[12px_12px_0px_#14161c] max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-ink pb-3">
                <div className="flex items-center gap-2">
                  {reviewAction === 'APPROVE' ? (
                    <UserCheck className="h-5 w-5 text-emerald-700" />
                  ) : (
                    <UserX className="h-5 w-5 text-rose-600" />
                  )}
                  <h3 className="font-display font-extrabold text-base text-ink uppercase tracking-tight">
                    {reviewAction === 'APPROVE' ? 'Approve Age Exception' : 'Reject Age Exception'}
                  </h3>
                </div>
                <button
                  onClick={handleCloseReview}
                  className="p-1 border border-ink text-ink hover:bg-ink hover:text-paper cursor-pointer transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="text-xs space-y-2 border-2 border-ink bg-paper-2/60 p-4 font-sans shadow-[2px_2px_0px_#14161c]">
                <div>
                  Applicant: <strong className="font-display uppercase">{selectedApp.fullName}</strong> ({selectedApp.age} years old)
                </div>
                <div>
                  Chapter: <strong>{selectedApp.chapterName}</strong> • Category: <strong>{getMemberCategoryLabel(selectedApp.memberCategory)}</strong>
                </div>
                <div className="pt-1 text-muted italic font-serif">
                  Applicant Reason: &quot;{selectedApp.justification}&quot;
                </div>
              </div>

              <form onSubmit={handleSubmitDecision} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-display font-bold uppercase tracking-wider text-ink flex items-center justify-between">
                    <span>Mandatory {reviewAction === 'APPROVE' ? 'Approval' : 'Rejection'} Reason *</span>
                    <span className="text-[10px] text-muted font-sans font-normal">Min 10 chars (Audited)</span>
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
                    className="w-full border-2 border-ink bg-white p-3 text-xs text-ink focus:ring-2 focus:ring-yellow outline-none font-sans shadow-[2px_2px_0px_#14161c]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t-2 border-ink">
                  <Button type="button" variant="outline" size="sm" onClick={handleCloseReview} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant={reviewAction === 'APPROVE' ? 'secondary' : 'danger'}
                    size="sm"
                    disabled={submitting || reason.trim().length < 10}
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
