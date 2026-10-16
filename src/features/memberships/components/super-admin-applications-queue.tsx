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
} from '@/features/memberships/constants/member-classifications';

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
    <Card className="border-blue-500/30 bg-gradient-to-b from-blue-500/5 to-transparent shadow-md">
      <CardHeader className="p-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#035AFC]" />
              <CardTitle className="text-lg">Super Admin → Membership Applications</CardTitle>
              <Badge variant="primary">{applications.length} PENDING APPROVAL</Badge>
            </div>
            <CardDescription className="text-xs">
              Review and approve applicant credentials, chapter assignments, and issue permanent digital membership IDs.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchApplications}
            disabled={loading}
            className="h-8 text-xs"
          >
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
          <div className="py-8 text-center text-xs text-slate-400">Loading pending applications...</div>
        ) : error ? (
          <div className="py-6 text-center text-xs text-rose-500">{error}</div>
        ) : applications.length === 0 ? (
          <div className="py-8 text-center space-y-1">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No Pending Membership Applications
            </div>
            <p className="text-xs text-slate-400">
              All submitted registrations have been verified and processed by the Super Administrator.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-2">Applicant & Username</th>
                  <th className="py-3 px-2">Chapter</th>
                  <th className="py-3 px-2">Classification</th>
                  <th className="py-3 px-2">Date & Age Standing</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {applications.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-2">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {item.fullName}
                      </div>
                      <div className="font-mono text-[11px] text-[#035AFC] dark:text-blue-400 font-semibold flex items-center gap-1 mt-0.5">
                        <KeyRound className="h-3 w-3" />
                        @{item.username}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {item.email} • {item.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-2">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {item.chapterName}
                      </div>
                      <div className="text-[10px] text-slate-400">16 Founding Chapters</div>
                    </td>
                    <td className="py-3.5 px-2">
                      <Badge variant="primary" className="text-[10px] mb-1">
                        {getMemberCategoryLabel(item.memberCategory)}
                      </Badge>
                      <div className="text-[10px] text-slate-400">
                        {getCurrentPositionLabel(item.currentPosition)}
                      </div>
                    </td>
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {new Date(item.submittedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <span
                        className={`inline-block text-[10px] font-semibold mt-0.5 ${
                          item.isAgeException
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {item.ageEligibilityStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-2">
                      <Badge
                        variant={item.status === 'UNDER_REVIEW' ? 'warning' : 'secondary'}
                        className="text-[9px]"
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenReview(item, 'APPROVE')}
                          className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <UserCheck className="h-3.5 w-3.5 mr-1" /> Approve
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

        {/* Modal / Dialog for Decision Reason */}
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
                    {reviewAction === 'APPROVE'
                      ? 'Approve Membership Application'
                      : 'Reject Membership Application'}
                  </h3>
                </div>
                <button
                  onClick={handleCloseReview}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span>
                    Applicant: <strong>{selectedApp.fullName}</strong>
                  </span>
                  <span className="font-mono text-[#035AFC] font-bold">
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
                    className={
                      selectedApp.isAgeException ? 'text-amber-500 font-semibold' : 'text-emerald-500 font-semibold'
                    }
                  >
                    {selectedApp.ageEligibilityStatus}
                  </span>
                </div>
                {selectedApp.justification && (
                  <div className="pt-1 text-slate-500 italic">
                    Applicant Reason: &quot;{selectedApp.justification}&quot;
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmitDecision} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>
                      Mandatory {reviewAction === 'APPROVE' ? 'Approval' : 'Rejection'} Reason *
                    </span>
                    <span className="text-[10px] text-slate-400">Min 5 characters (Audited)</span>
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
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] p-2.5 text-xs focus:ring-2 focus:ring-[#035AFC]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
                    variant="primary"
                    size="sm"
                    disabled={submitting || reason.trim().length < 5}
                    className={
                      reviewAction === 'APPROVE'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }
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
