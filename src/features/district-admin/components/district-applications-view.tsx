'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Building2,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  FileText,
  Save,
  Info,
} from 'lucide-react';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';
import {
  getMemberCategoryLabel,
  getCurrentPositionLabel,
} from '@/features/memberships/constants/member-classifications';
import { submitDistrictReviewNoteAction } from '../server/district-admin.actions';

export interface ApplicationItem {
  id: string;
  status: string;
  submittedAt: string;
  chapterName: string;
  chapterCode: string;
  chapterSlug: string;
  reviewNotes: string | null;
  rejectionReason: string | null;
  applicant: {
    userId: string;
    fullName: string;
    email: string | null;
    phone?: string | null;
    memberCategory?: string | null;
    currentPosition?: string | null;
    dateOfBirth?: string | null;
  };
}

interface DistrictApplicationsViewProps {
  initialApplications: ApplicationItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function DistrictApplicationsView({
  initialApplications,
  total,
  page,
  pageSize,
  totalPages,
}: DistrictApplicationsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get('search') || '');
  const [chapterId, setChapterId] = React.useState(searchParams.get('chapterId') || 'ALL');
  const [status, setStatus] = React.useState(searchParams.get('status') || 'ALL');

  const [selectedApp, setSelectedApp] = React.useState<ApplicationItem | null>(null);
  const [noteInput, setNoteInput] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<{ success: boolean; text: string } | null>(null);

  const applyFilters = (newPage = 1) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (chapterId !== 'ALL') params.set('chapterId', chapterId);
    if (status !== 'ALL') params.set('status', status);
    if (newPage > 1) params.set('page', newPage.toString());

    router.push(`/district-admin/applications?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch('');
    setChapterId('ALL');
    setStatus('ALL');
    router.push('/district-admin/applications');
  };

  const openAppModal = (app: ApplicationItem) => {
    setSelectedApp(app);
    setNoteInput(app.reviewNotes || '');
    setSaveMessage(null);
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setIsSaving(true);
    setSaveMessage(null);

    const res = await submitDistrictReviewNoteAction(selectedApp.id, noteInput);
    setIsSaving(false);

    if (res.success) {
      setSaveMessage({ success: true, text: 'District review note recorded successfully.' });
      // Update local item
      selectedApp.reviewNotes = noteInput;
    } else {
      setSaveMessage({ success: false, text: res.error || 'Failed to record note.' });
    }
  };

  // Calculate age helper
  const calculateAge = (dobString?: string | null) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const isFiltered = search.trim() !== '' || chapterId !== 'ALL' || status !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-6 w-6 text-[#035AFC]" /> Membership Applications Governance
            </h1>
            <Badge variant="primary">DISTRICT OVERSIGHT</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central monitoring across 16 chapters. District Admins conduct eligibility review and provide recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs text-slate-500">
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
            </Button>
          )}
          <a
            href={`/api/v1/district-admin/export?type=applications${status !== 'ALL' ? `&status=${status}` : ''}`}
            download
          >
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export Applications (CSV)
            </Button>
          </a>
        </div>
      </div>

      {/* Super Admin Authority Notice */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 p-4 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-[#035AFC] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold">Constitutional Approval Policy</div>
          <p className="text-slate-600 dark:text-slate-300">
            In strict accordance with MYBF governance bylaws, <strong>Super Admin retains sole authority for final membership activation</strong> and <strong>Age 36+ exceptions</strong>. District Admins monitor application throughput, review submitted documentation, and record official district recommendations.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters(1)}
                placeholder="Search applicant name, email..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#035AFC]"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                aria-label="Filter by Application Status"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All Application Statuses</option>
                <option value="SUBMITTED">Submitted (Pending)</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved (Super Admin)</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Filter Trigger Button */}
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => applyFilters(1)}
                className="h-8 text-xs font-semibold px-4 w-full sm:w-auto"
              >
                <Filter className="h-3.5 w-3.5 mr-1" /> Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Applications Queue</CardTitle>
              <CardDescription className="text-xs">
                Page {page} of {totalPages} &bull; Showing {initialApplications.length} of {total} applications
              </CardDescription>
            </div>
            <span className="text-xs text-slate-400 font-mono">Malappuram District (MLP)</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Chapter</th>
                  <th className="py-3 px-4">Category & Position</th>
                  <th className="py-3 px-4">Age Status</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {initialApplications.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      No membership applications match the specified criteria.
                    </td>
                  </tr>
                ) : (
                  initialApplications.map((app) => {
                    const age = calculateAge(app.applicant.dateOfBirth);
                    const isAgeOver35 = age !== null && age > 35;

                    return (
                      <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {app.applicant.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {app.applicant.email || 'No email provided'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-700 dark:text-slate-300">
                            {app.chapterName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {app.chapterCode}
                          </div>
                        </td>
                        <td className="py-3 px-4 space-y-0.5">
                          <div>
                            {app.applicant.memberCategory ? (
                              <Badge variant="primary" className="text-[9px]">
                                {getMemberCategoryLabel(app.applicant.memberCategory as any)}
                              </Badge>
                            ) : (
                              <span className="text-slate-400 italic">Unclassified</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {app.applicant.currentPosition ? getCurrentPositionLabel(app.applicant.currentPosition as any) : ''}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {age !== null ? (
                            isAgeOver35 ? (
                              <Badge variant="warning" className="text-[9px] flex items-center gap-1 w-fit">
                                <AlertTriangle className="h-2.5 w-2.5" /> Age {age} (Exception Req)
                              </Badge>
                            ) : (
                              <span className="text-slate-600 dark:text-slate-300 font-medium">Age {age}</span>
                            )
                          ) : (
                            <span className="text-slate-400 italic">Not recorded</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {app.submittedAt.split('T')[0]}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              app.status === 'APPROVED'
                                ? 'success'
                                : app.status === 'REJECTED'
                                ? 'danger'
                                : 'warning'
                            }
                            className="text-[10px]"
                          >
                            {app.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {app.reviewNotes ? (
                            <span className="text-[10px] text-slate-700 dark:text-slate-300 max-w-[140px] truncate block" title={app.reviewNotes}>
                              {app.reviewNotes}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">No notes</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAppModal(app)}
                            className="h-7 text-[10px] px-2 font-medium"
                          >
                            <FileText className="h-3 w-3 mr-1" /> Review
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Showing {Math.min((page - 1) * pageSize + 1, total)} to {Math.min(page * pageSize, total)} of {total} applications
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => applyFilters(page - 1)}
                  className="h-8 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                </Button>
                <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => applyFilters(page + 1)}
                  className="h-8 text-xs"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#0B101B] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedApp.applicant.fullName}
                  </h3>
                  <Badge variant={selectedApp.status === 'APPROVED' ? 'success' : 'warning'}>
                    {selectedApp.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Constituency: {selectedApp.chapterName} ({selectedApp.chapterCode}) &bull; Submitted: {selectedApp.submittedAt.split('T')[0]}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Age Warning if applicable */}
              {(() => {
                const age = calculateAge(selectedApp.applicant.dateOfBirth);
                if (age !== null && age > 35) {
                  return (
                    <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-950 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>Age Exception Flag:</strong> Applicant is {age} years old (exceeds standard 35-or-below policy). Requires official Super Admin Age Exception Review.
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Applicant Details */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Email Address</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedApp.applicant.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Phone</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedApp.applicant.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Category / Interest</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {selectedApp.applicant.memberCategory ? getMemberCategoryLabel(selectedApp.applicant.memberCategory as any) : 'Unclassified'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Position</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {selectedApp.applicant.currentPosition ? getCurrentPositionLabel(selectedApp.applicant.currentPosition as any) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Review Notes Input */}
              <div className="space-y-2">
                <label htmlFor="dist-review-notes" className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  District Administrative Review Notes & Recommendations:
                </label>
                <textarea
                  id="dist-review-notes"
                  rows={4}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Record chapter background verification, interview notes, or recommendations for Super Admin review..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#035AFC]"
                />
              </div>

              {saveMessage && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-medium ${
                    saveMessage.success
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300'
                      : 'bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300'
                  }`}
                >
                  {saveMessage.text}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setSelectedApp(null)} className="text-xs">
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="text-xs font-semibold"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                {isSaving ? 'Saving...' : 'Save Recommendation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
