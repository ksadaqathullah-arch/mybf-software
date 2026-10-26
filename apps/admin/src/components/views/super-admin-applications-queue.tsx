'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  X,
  KeyRound,
} from 'lucide-react';
import {
  getMemberCategoryLabel,
  getCurrentPositionLabel,
} from '@/constants/member-classifications';

export interface PendingApplicationItem {
  id: string;
  userId: string;
  fullName: string;
  username: string;
  email: string | null;
  phone: string | null;
  chapterName: string;
  chapterSlug: string;
  memberCategory: any;
  currentPosition: any;
  submittedAt: string;
  dateOfBirth: string;
  applicantAge: number;
  isAgeException: boolean;
  ageEligibilityStatus: string;
  status: string;
  justification: string | null;
}

export function SuperAdminApplicationsQueue() {
  const [applications, setApplications] = React.useState<PendingApplicationItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Selected item for review action
  const [selectedApp, setSelectedApp] = React.useState<PendingApplicationItem | null>(null);
  const [reviewAction, setReviewAction] = React.useState<'APPROVE' | 'REJECT' | null>(null);
  const [reason, setReason] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);

  const fetchApplications = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/v1/super-admin/applications');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch membership applications.');
      }
      setApplications(data.applications || []);
    } catch (err: any) {
      setError(err.message || 'Error loading applications');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleOpenReview = (app: PendingApplicationItem, action: 'APPROVE' | 'REJECT') => {
    setSelectedApp(app);
    setReviewAction(action);
    setReason(
      action === 'APPROVE'
        ? 'Verified youth eligibility, chapter jurisdiction, and credential integrity.'
        : ''
    );
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

    if (!reason || reason.trim().length < 5) {
      alert('Mandatory decision reason must be at least 5 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/super-admin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          action: reviewAction,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit decision.');
      }

      setFeedbackMessage(
        reviewAction === 'APPROVE'
          ? `Application approved for ${selectedApp.fullName} (@${selectedApp.username}). Member ID ${data.membershipNumber} issued and account activated.`
          : `Application rejected for ${selectedApp.fullName} (@${selectedApp.username}).`
      );

      // Remove from active list
      setApplications((prev) => prev.filter((a) => a.id !== selectedApp.id));
      handleCloseReview();
      setTimeout(() => setFeedbackMessage(null), 8000);
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
              <Users className="h-5 w-5 text-blue" />
              <CardTitle className="font-sans font-bold text-lg sm:text-xl text-ink tracking-tight">
                Membership Applications
              </CardTitle>
              <Badge variant="secondary">{applications.length} Pending Approval</Badge>
            </div>
            <CardDescription className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
              Review and approve applicant credentials, chapter assignments, and issue permanent digital membership IDs.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchApplications}
            disabled={loading}
          >
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
            Loading pending applications...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-xs font-sans font-semibold text-rose-700 bg-rose-50 border-b border-rose-200">
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="py-12 text-center space-y-1.5 p-6">
            <div className="font-sans text-base font-bold text-ink tracking-tight">
              No Pending Membership Applications
            </div>
            <p className="font-sans text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
              All submitted registrations have been verified and processed by the Super Administrator.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="border-b-2 border-ink bg-ink text-paper font-sans text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-paper">Applicant &amp; Username</th>
                  <th className="py-3 px-4 text-paper">Chapter</th>
                  <th className="py-3 px-4 text-paper">Classification</th>
                  <th className="py-3 px-4 text-paper">Standing</th>
                  <th className="py-3 px-4 text-paper">Status</th>
                  <th className="py-3 px-4 text-paper text-right">Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/15 font-sans">
                {applications.map((item) => (
                  <tr key={item.id} className="hover:bg-yellow/15 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-sans font-bold text-sm text-ink">
                        {item.fullName}
                      </div>
                      <div className="font-mono text-xs text-blue font-bold flex items-center gap-1 mt-0.5">
                        <KeyRound className="h-3 w-3" />
                        @{item.username}
                      </div>
                      <div className="font-sans text-xs text-muted mt-0.5">
                        {item.email} • {item.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-sans font-semibold text-xs text-ink">
                        {item.chapterName}
                      </div>
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
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-ink font-semibold">
                        <Calendar className="h-3.5 w-3.5 text-muted" />
                        <span>
                          {new Date(item.submittedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <span
                        className={`inline-block font-sans text-xs font-semibold mt-1 px-1.5 py-0.5 border ${
                          item.isAgeException
                            ? 'text-amber-950 bg-amber-100 border-amber-800'
                            : 'text-emerald-950 bg-emerald-100 border-emerald-800'
                        }`}
                      >
                        {item.ageEligibilityStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={item.status === 'UNDER_REVIEW' ? 'warning' : 'secondary'}
                      >
                        {item.status}
                      </Badge>
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
                  <h3 className="font-sans font-bold text-base text-ink tracking-tight">
                    {reviewAction === 'APPROVE'
                       ? 'Approve Membership Application'
                       : 'Reject Membership Application'}
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
                <div className="flex items-center justify-between">
                  <span>
                    Applicant: <strong className="font-sans font-bold">{selectedApp.fullName}</strong>
                  </span>
                  <span className="font-mono text-blue font-bold">
                    @{selectedApp.username}
                  </span>
                </div>
                <div>
                  Chapter: <strong>{selectedApp.chapterName}</strong> • Category:{' '}
                  <strong>{getMemberCategoryLabel(selectedApp.memberCategory)}</strong>
                </div>
                <div>
                  Standing:{' '}
                  <span
                    className={`font-sans font-semibold ${
                      selectedApp.isAgeException ? 'text-amber-800' : 'text-emerald-800'
                    }`}
                  >
                    {selectedApp.ageEligibilityStatus}
                  </span>
                </div>
                {selectedApp.justification && (
                  <div className="pt-1 text-muted italic font-sans">
                    Applicant Reason: &quot;{selectedApp.justification}&quot;
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmitDecision} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-semibold text-ink flex items-center justify-between">
                    <span>
                      Mandatory {reviewAction === 'APPROVE' ? 'Approval' : 'Rejection'} Reason *
                    </span>
                    <span className="text-xs text-muted font-sans font-normal">Min 5 chars (Audited)</span>
                  </label>
                  <textarea
                    required
                    minLength={5}
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={
                      reviewAction === 'APPROVE'
                        ? 'State the governance rationale for granting membership approval...'
                        : 'State the rationale for declining this membership application...'
                    }
                    className="w-full border-2 border-ink bg-white p-3 text-xs text-ink focus:ring-2 focus:ring-yellow outline-none font-sans shadow-[2px_2px_0px_#14161c]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t-2 border-ink">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCloseReview}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant={reviewAction === 'APPROVE' ? 'secondary' : 'danger'}
                    size="sm"
                    disabled={submitting || reason.trim().length < 5}
                  >
                    {submitting
                      ? 'Recording...'
                      : `Confirm ${reviewAction === 'APPROVE' ? 'Approval & Activation' : 'Rejection'}`}
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
