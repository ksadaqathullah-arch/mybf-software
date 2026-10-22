'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageHeader } from '@/components/ui/portal-elements';
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
      setSaveMessage({ success: true, text: 'Review recommendation saved successfully.' });
      selectedApp.reviewNotes = noteInput;
    } else {
      setSaveMessage({ success: false, text: res.error || 'Failed to save review note.' });
    }
  };

  const calculateAge = (dobString?: string | null) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const isFiltered = search.trim() !== '' || chapterId !== 'ALL' || status !== 'ALL';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PortalPageHeader
        tag="DISTRICT OVERSIGHT"
        badge="Governance Queue"
        title="Membership Applications Governance"
        description="Central monitoring across 16 chapters. District Admins conduct eligibility review and provide recommendations."
        actions={
          <div className="flex items-center gap-2">
            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs text-ink/70">
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
        }
      />

      {/* Super Admin Authority Notice */}
      <div className="border-2 border-ink bg-blue/10 p-4 text-xs text-ink shadow-[3px_3px_0px_#14161c] flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-blue shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-display font-black uppercase tracking-wider text-xs">Constitutional Approval Policy</div>
          <p className="text-ink/80 font-serif leading-relaxed">
            In strict accordance with MYBF governance bylaws, <strong>Super Admin retains sole authority for final membership activation</strong> and <strong>Age 36+ exceptions</strong>. District Admins monitor application throughput, review submitted documentation, and record official district recommendations.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-ink/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters(1)}
                placeholder="Search applicant name, email..."
                className="w-full pl-9 pr-3 py-1.5 border-2 border-ink bg-paper text-xs text-ink focus:outline-none focus:ring-2 focus:ring-blue font-serif"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                aria-label="Filter by Application Status"
                className="w-full border-2 border-ink bg-paper px-2.5 py-1.5 text-xs text-ink font-display font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue"
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
      <Card>
        <CardHeader className="p-5 pb-3 border-b-2 border-ink flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl font-black font-display uppercase tracking-wider text-ink">Applications Queue</CardTitle>
            <CardDescription className="text-xs text-ink/70 font-serif mt-1">
              Page {page} of {totalPages} &bull; Showing {initialApplications.length} of {total} applications
            </CardDescription>
          </div>
          <span className="text-[10px] font-bold text-ink/60 font-mono uppercase bg-paper-sunken border border-ink/20 px-2 py-1">
            Malappuram District (MLP)
          </span>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="border-b-2 border-ink bg-paper-sunken text-ink font-display font-extrabold uppercase text-[10px] tracking-wider">
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
              <tbody className="divide-y divide-ink/10 font-mono text-[11px]">
                {initialApplications.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-ink/50 font-serif italic text-sm">
                      No membership applications match the specified criteria.
                    </td>
                  </tr>
                ) : (
                  initialApplications.map((app) => {
                    const age = calculateAge(app.applicant.dateOfBirth);
                    const isAgeOver35 = age !== null && age > 35;

                    return (
                      <tr key={app.id} className="hover:bg-yellow/10 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-ink font-sans text-xs">
                            {app.applicant.fullName}
                          </div>
                          <div className="text-[10px] text-ink/60 font-mono">
                            {app.applicant.email || 'No email provided'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-ink font-sans">
                            {app.chapterName}
                          </div>
                          <div className="text-[10px] text-ink/60 font-mono">
                            {app.chapterCode}
                          </div>
                        </td>
                        <td className="py-3 px-4 space-y-0.5">
                          <div>
                            {app.applicant.memberCategory ? (
                              <Badge variant="secondary" className="text-[9px]">
                                {getMemberCategoryLabel(app.applicant.memberCategory as any)}
                              </Badge>
                            ) : (
                              <span className="text-ink/40 text-[10px] font-serif">Unclassified</span>
                            )}
                          </div>
                          <div className="text-[10px] text-ink/70 font-serif">
                            {app.applicant.currentPosition
                              ? getCurrentPositionLabel(app.applicant.currentPosition as any)
                              : ''}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {age !== null ? (
                            isAgeOver35 ? (
                              <Badge variant="warning" className="text-[9px]">
                                Age {age} (36+ Exception)
                              </Badge>
                            ) : (
                              <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 border border-ink/20 px-1.5 py-0.5">
                                Age {age} (Eligible)
                              </span>
                            )
                          ) : (
                            <span className="text-ink/40 text-[10px]">Unknown</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-ink/70">
                          {app.submittedAt.split('T')[0]}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              app.status === 'APPROVED'
                                ? 'success'
                                : app.status === 'UNDER_REVIEW'
                                ? 'primary'
                                : app.status === 'REJECTED'
                                ? 'danger'
                                : 'warning'
                            }
                            className="text-[9px]"
                          >
                            {app.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {app.reviewNotes ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px]">
                              <CheckCircle2 className="h-3 w-3" /> Logged
                            </span>
                          ) : (
                            <span className="text-ink/40 text-[10px] italic font-serif">Pending note</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAppModal(app)}
                            className="h-7 text-[10px] px-2.5 font-semibold"
                          >
                            <Eye className="h-3 w-3 mr-1" /> Review
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
            <div className="p-4 border-t-2 border-ink flex items-center justify-between text-xs bg-paper-sunken">
              <span className="text-ink/70 font-serif">
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
                <span className="px-2 font-mono font-bold text-ink">
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
          <div className="w-full max-w-xl bg-paper border-2 border-ink shadow-[8px_8px_0px_#14161c] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b-2 border-ink flex items-center justify-between bg-paper-sunken">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black font-display uppercase tracking-wider text-ink">
                    {selectedApp.applicant.fullName}
                  </h3>
                  <Badge variant={selectedApp.status === 'APPROVED' ? 'success' : 'warning'}>
                    {selectedApp.status}
                  </Badge>
                </div>
                <p className="text-xs text-ink/70 font-serif mt-0.5">
                  Constituency: {selectedApp.chapterName} ({selectedApp.chapterCode}) &bull; Submitted: {selectedApp.submittedAt.split('T')[0]}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="border-2 border-ink p-1 bg-paper text-ink hover:bg-yellow shadow-[1px_1px_0px_#14161c] transition-colors"
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
                    <div className="p-3 border-2 border-ink bg-warning/20 text-ink shadow-[2px_2px_0px_#14161c] flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-ink shrink-0 mt-0.5" />
                      <div className="font-serif">
                        <strong className="font-sans font-bold">Age Exception Flag:</strong> Applicant is {age} years old (exceeds standard 35-or-below policy). Requires official Super Admin Age Exception Review.
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Applicant Details */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-paper border-2 border-ink shadow-[2px_2px_0px_#14161c]">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-ink/60 font-display block">Email Address</span>
                  <span className="font-bold text-ink mt-0.5 block font-mono">{selectedApp.applicant.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-ink/60 font-display block">Phone</span>
                  <span className="font-bold text-ink mt-0.5 block font-mono">{selectedApp.applicant.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-ink/60 font-display block">Category / Interest</span>
                  <span className="font-bold text-ink mt-0.5 block">
                    {selectedApp.applicant.memberCategory ? getMemberCategoryLabel(selectedApp.applicant.memberCategory as any) : 'Unclassified'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-ink/60 font-display block">Current Position</span>
                  <span className="font-bold text-ink mt-0.5 block">
                    {selectedApp.applicant.currentPosition ? getCurrentPositionLabel(selectedApp.applicant.currentPosition as any) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Review Notes Input */}
              <div className="space-y-2">
                <label htmlFor="dist-review-notes" className="text-xs font-black font-display uppercase tracking-wider text-ink block">
                  District Administrative Review Notes & Recommendations:
                </label>
                <textarea
                  id="dist-review-notes"
                  rows={4}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Record chapter background verification, interview notes, or recommendations for Super Admin review..."
                  className="w-full p-2.5 border-2 border-ink bg-paper text-xs text-ink font-serif focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>

              {saveMessage && (
                <div
                  className={`p-2.5 border-2 border-ink text-xs font-bold ${
                    saveMessage.success
                      ? 'bg-emerald-100 text-emerald-950'
                      : 'bg-danger/20 text-danger'
                  }`}
                >
                  {saveMessage.text}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t-2 border-ink bg-paper-sunken flex items-center justify-between">
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
