'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, UserCheck, UserX, Clock, Calendar, X } from 'lucide-react';
import { getMemberCategoryLabel, getCurrentPositionLabel } from '@/constants/member-classifications';

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
              <CardTitle className="font-sans font-bold text-lg sm:text-xl text-ink tracking-tight">
                Age Exception Review Queue
              </CardTitle>
              <Badge variant="warning">{exceptions.length} Pending Decision</Badge>
            </div>
            <CardDescription className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
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
          <div className="py-12 text-center text-xs font-sans font-semibold tracking-wider uppercase text-muted">
            Loading pending age exceptions...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-xs font-sans font-semibold text-rose-700 bg-rose-50 border-b border-rose-200">
            {error}
          </div>
        ) : exceptions.length === 0 ? (
          <div className="py-12 text-center space-y-1.5 p-6">
            <div className="font-sans text-base font-bold text-ink tracking-tight">
              No Pending Age Exception Requests
            </div>
            <p className="font-sans text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
              All submitted applications currently meet standard youth eligibility (aged 35 years or below) or have already been decided.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="border-b-2 border-ink bg-ink text-paper font-sans text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-paper">Applicant</th>
                    <th className="py-3 px-4 text-paper">DOB &amp; Age</th>
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
                        <div className="font-sans font-bold text-sm text-ink">{item.fullName}</div>
                        <div className="font-sans text-xs text-muted">
                          {item.email} • {item.phone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-sans font-semibold text-xs text-ink bg-yellow px-2 py-0.5 border border-ink shadow-[1px_1px_0px_#14161c]">
                          <Calendar className="h-3 w-3" />
                          {item.age} Years Old
                        </span>
                        <div className="text-xs text-muted font-mono mt-1">DOB: {item.dateOfBirth}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-sans font-semibold text-xs text-ink">{item.chapterName}</div>
                        <div className="text-xs text-muted font-sans">Constituency Chapter</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="primary" className="mb-1">
                          {getMemberCategoryLabel(item.memberCategory)}
                        </Badge>
                        <div className="text-xs text-muted font-sans">
                          {getCurrentPositionLabel(item.currentPosition)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-xs text-ink font-sans italic bg-paper-2 p-2.5 border border-ink/30 shadow-[1px_1px_0px_#14161c]">
                          &quot;{item.justification}&quot;
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenReview(item, 'APPROVE')}
                            className="h-8 text-xs font-medium px-3 bg-emerald-100 text-emerald-950 border-emerald-900 hover:bg-emerald-200"
                          >
                            <UserCheck className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReview(item, 'REJECT')}
                            className="h-8 text-xs font-medium px-3 text-rose-700 border-rose-700 hover:bg-rose-100"
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

            {/* Smartphone Card View (< md) */}
            <div className="md:hidden space-y-3 p-3">
              {exceptions.map((item) => (
                <div
                  key={item.id}
                  className="border-2 border-ink bg-white p-4 shadow-[3px_3px_0px_#14161c] space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-sans font-bold text-base text-ink">{item.fullName}</h4>
                      <div className="text-xs text-muted mt-0.5">
                        {item.email} • {item.phone}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 font-sans font-bold text-xs text-ink bg-yellow px-2 py-0.5 border border-ink shadow-[1px_1px_0px_#14161c] shrink-0">
                      <Calendar className="h-3 w-3" />
                      {item.age} Years Old
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-ink/10 py-2.5">
                    <div>
                      <span className="text-muted block text-[11px]">Requested Chapter</span>
                      <span className="font-semibold text-ink">{item.chapterName}</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[11px]">Category</span>
                      <span className="font-semibold text-ink">{getMemberCategoryLabel(item.memberCategory)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted block text-[11px]">Date of Birth</span>
                      <span className="font-mono text-ink text-xs font-semibold">{item.dateOfBirth}</span>
                    </div>
                  </div>

                  {item.justification && (
                    <div className="text-xs text-ink font-sans italic bg-paper-2 p-2.5 border border-ink/30 shadow-[1px_1px_0px_#14161c]">
                      &quot;{item.justification}&quot;
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenReview(item, 'APPROVE')}
                      className="min-h-11 text-xs font-bold bg-emerald-100 text-emerald-950 border-2 border-emerald-900 hover:bg-emerald-200 shadow-[2px_2px_0px_#14161c]"
                    >
                      <UserCheck className="h-4 w-4 mr-1.5 text-emerald-800" /> Approve Exception
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReview(item, 'REJECT')}
                      className="min-h-11 text-xs font-bold text-rose-700 border-2 border-rose-700 hover:bg-rose-100 shadow-[2px_2px_0px_#14161c]"
                    >
                      <UserX className="h-4 w-4 mr-1.5" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal / Dialog for Mandatory Decision Reason */}
        {selectedApp && reviewAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="border-2 border-ink bg-paper text-ink shadow-[6px_6px_0px_#14161c] sm:shadow-[12px_12px_0px_#14161c] max-w-lg w-full p-4 sm:p-6 space-y-4 max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b-2 border-ink pb-3">
                <div className="flex items-center gap-2">
                  {reviewAction === 'APPROVE' ? (
                    <UserCheck className="h-5 w-5 text-emerald-700" />
                  ) : (
                    <UserX className="h-5 w-5 text-rose-600" />
                  )}
                  <h3 className="font-sans font-bold text-base text-ink tracking-tight">
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
                  Applicant: <strong className="font-sans font-bold">{selectedApp.fullName}</strong> ({selectedApp.age} years old)
                </div>
                <div>
                  Chapter: <strong>{selectedApp.chapterName}</strong> • Category: <strong>{getMemberCategoryLabel(selectedApp.memberCategory)}</strong>
                </div>
                <div className="pt-1 text-muted italic font-sans">
                  Applicant Reason: &quot;{selectedApp.justification}&quot;
                </div>
              </div>

              <form onSubmit={handleSubmitDecision} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-semibold text-ink flex items-center justify-between">
                    <span>Mandatory {reviewAction === 'APPROVE' ? 'Approval' : 'Rejection'} Reason *</span>
                    <span className="text-xs text-muted font-sans font-normal">Min 10 chars (Audited)</span>
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
