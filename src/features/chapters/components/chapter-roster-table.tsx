'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  Filter,
  Download,
  Users,
  RotateCcw,
  Eye,
  UserX,
  Clock,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  X,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import {
  MEMBER_CATEGORIES,
  CURRENT_POSITIONS,
  getMemberCategoryLabel,
  getCurrentPositionLabel,
} from '@/features/memberships/constants/member-classifications';

export interface ChapterMemberItem {
  id: string;
  profileId: string;
  membershipNumber: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  memberCategory: string;
  currentPosition: string;
  occupation: string;
  companyName: string;
  businessSector: string;
  joinedDate: string;
  status: string;
  hasPendingDeactivation?: boolean;
  pendingDeactivationId?: string | null;
  pendingDeactivationReason?: string | null;
}

interface ChapterRosterTableProps {
  initialMembers: ChapterMemberItem[];
  chapterName: string;
}

const DEACTIVATION_CATEGORIES = [
  { value: 'INELIGIBLE_CRITERIA', label: 'Ineligible Criteria / Age Without Exception' },
  { value: 'DUPLICATE_MEMBERSHIP', label: 'Duplicate Account / Record' },
  { value: 'CODE_OF_CONDUCT_VIOLATION', label: 'Code of Conduct / Policy Violation' },
  { value: 'VOLUNTARY_RESIGNATION', label: 'Voluntary Member Resignation' },
  { value: 'ADMINISTRATIVE_DISCRETION', label: 'Administrative Governance Decision' },
] as const;

export function ChapterRosterTable({ initialMembers, chapterName }: ChapterRosterTableProps) {
  const [members, setMembers] = React.useState<ChapterMemberItem[]>(initialMembers);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [selectedPosition, setSelectedPosition] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  // Modals state
  const [viewingMember, setViewingMember] = React.useState<ChapterMemberItem | null>(null);
  const [deactivatingMember, setDeactivatingMember] = React.useState<ChapterMemberItem | null>(null);
  const [reasonCategory, setReasonCategory] = React.useState<string>('INELIGIBLE_CRITERIA');
  const [justification, setJustification] = React.useState<string>('');
  const [confirmedPolicy, setConfirmedPolicy] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = React.useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Sync state if initialMembers changes
  React.useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  const filteredMembers = React.useMemo(() => {
    return members.filter((member) => {
      if (selectedCategory !== 'ALL' && member.memberCategory !== selectedCategory) {
        return false;
      }
      if (selectedPosition !== 'ALL' && member.currentPosition !== selectedPosition) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = member.fullName.toLowerCase().includes(q);
        const matchesId = member.membershipNumber.toLowerCase().includes(q);
        const matchesCompany = member.companyName.toLowerCase().includes(q);
        const matchesSector = member.businessSector.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesCompany && !matchesSector) return false;
      }
      return true;
    });
  }, [members, selectedCategory, selectedPosition, searchQuery]);

  const handleExportCSV = () => {
    if (filteredMembers.length === 0) {
      alert('No members to export.');
      return;
    }

    const headers = [
      'Full Name',
      'Member ID',
      'Category',
      'Position',
      'Occupation',
      'Company',
      'Sector',
      'Status',
      'Governance Status',
      'Joined Date',
    ];
    const rows = filteredMembers.map((m) => [
      `"${m.fullName.replace(/"/g, '""')}"`,
      `"${m.membershipNumber}"`,
      `"${getMemberCategoryLabel(m.memberCategory)}"`,
      `"${getCurrentPositionLabel(m.currentPosition)}"`,
      `"${(m.occupation || '').replace(/"/g, '""')}"`,
      `"${(m.companyName || '').replace(/"/g, '""')}"`,
      `"${(m.businessSector || '').replace(/"/g, '""')}"`,
      `"${m.status}"`,
      `"${m.hasPendingDeactivation ? 'Removal Requested' : 'Active In Good Standing'}"`,
      `"${new Date(m.joinedDate).toLocaleDateString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${chapterName.toLowerCase().replace(/\s+/g, '-')}-members-roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedPosition('ALL');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory !== 'ALL' || selectedPosition !== 'ALL' || searchQuery.trim() !== '';

  const openDeactivationModal = (member: ChapterMemberItem) => {
    setDeactivatingMember(member);
    setReasonCategory('INELIGIBLE_CRITERIA');
    setJustification('');
    setConfirmedPolicy(false);
    setSubmitError(null);
  };

  const closeDeactivationModal = () => {
    if (isSubmitting) return;
    setDeactivatingMember(null);
    setSubmitError(null);
  };

  const handleConfirmDeactivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deactivatingMember) return;

    if (justification.trim().length < 10) {
      setSubmitError('Please provide a specific justification of at least 10 characters.');
      return;
    }

    if (!confirmedPolicy) {
      setSubmitError('You must confirm that this governance request adheres to MYBF bylaws.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const selectedCategoryLabel =
      DEACTIVATION_CATEGORIES.find((c) => c.value === reasonCategory)?.label || reasonCategory;
    const fullReason = `[${selectedCategoryLabel}] ${justification.trim()}`;

    try {
      const res = await fetch('/api/v1/chapter/members/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberProfileId: deactivatingMember.profileId,
          reason: fullReason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit deactivation request.');
      }

      // Update local state to reflect pending deactivation
      setMembers((prev) =>
        prev.map((m) =>
          m.profileId === deactivatingMember.profileId
            ? {
                ...m,
                hasPendingDeactivation: true,
                pendingDeactivationReason: fullReason,
              }
            : m
        )
      );

      setFeedbackMessage({
        type: 'success',
        text: `Deactivation request submitted for ${deactivatingMember.fullName} (${deactivatingMember.membershipNumber}). It is recorded with an immutable audit log and awaiting District Admin recommendation and Super Admin final authorization.`,
      });

      setDeactivatingMember(null);
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while submitting the request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-ink shadow-[4px_4px_0px_#14161c]">
      <CardHeader className="p-6 pb-4 border-b-2 border-ink bg-paper">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl font-black font-display uppercase tracking-wider text-ink flex items-center gap-2">
                <Users className="h-5 w-5 text-blue" /> {chapterName} Active Member Directory
              </CardTitle>
              <Badge variant="primary" className="border-ink shadow-[1px_1px_0px_#14161c]">
                {members.length} {members.length === 1 ? 'MEMBER' : 'MEMBERS'}
              </Badge>
            </div>
            <CardDescription className="text-xs text-ink/70 font-serif mt-1">
              Authorized chapter roster showing active verified members, classifications, and governance status.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs font-semibold border-2 border-ink bg-paper shadow-[2px_2px_0px_#14161c] hover:bg-yellow/20"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export Roster (CSV)
          </Button>
        </div>

        {feedbackMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border-2 border-emerald-800 text-emerald-950 text-xs flex items-start justify-between gap-2 shadow-[2px_2px_0px_#14161c]">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-800 mt-0.5 shrink-0" />
              <p className="font-serif leading-snug">{feedbackMessage.text}</p>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-emerald-900 hover:text-emerald-950 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="mt-4 pt-4 border-t-2 border-ink/10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4 space-y-1">
            <label className="text-[11px] font-black font-display uppercase tracking-wider text-ink flex items-center gap-1">
              <Filter className="h-3 w-3 text-blue" /> Member Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border-2 border-ink bg-paper px-2.5 py-1.5 text-xs text-ink font-display font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue shadow-[1px_1px_0px_#14161c]"
            >
              <option value="ALL">All Categories</option>
              {MEMBER_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-[11px] font-black font-display uppercase tracking-wider text-ink flex items-center gap-1">
              <Filter className="h-3 w-3 text-yellow" /> Current Position
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full border-2 border-ink bg-paper px-2.5 py-1.5 text-xs text-ink font-display font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue shadow-[1px_1px_0px_#14161c]"
            >
              <option value="ALL">All Positions</option>
              {CURRENT_POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-[11px] font-black font-display uppercase tracking-wider text-ink flex items-center gap-1">
              <Search className="h-3 w-3 text-ink/40" /> Search Directory
            </label>
            <input
              type="text"
              placeholder="Search name, ID, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 border-ink bg-paper px-2.5 py-1.5 text-xs text-ink placeholder:text-ink/40 font-serif focus:outline-none focus:ring-2 focus:ring-blue shadow-[1px_1px_0px_#14161c]"
            />
          </div>

          <div className="sm:col-span-1">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="w-full h-8 text-[11px] px-2 text-ink/70 hover:text-ink border border-ink/20 hover:border-ink"
                title="Reset filters"
              >
                <RotateCcw className="h-3 w-3 mr-1" /> Reset
              </Button>
            )}
          </div>
        </div>

        <div className="mt-2 text-[11px] text-ink/70 font-serif flex items-center justify-between">
          <span>
            Showing <strong>{filteredMembers.length}</strong> of {members.length} members
          </span>
          <span className="text-[10px] text-ink/50 uppercase font-display tracking-wider">
            All records cryptographically signed & archived
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="border-b-2 border-ink bg-paper-sunken text-ink font-display font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Membership ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Company / Sector</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 font-mono text-[11px] bg-paper">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-ink/50 font-serif italic text-sm">
                    No active members found matching current filters for {chapterName}.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-yellow/10 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-ink font-sans text-xs">{m.fullName}</div>
                      <div className="text-[10px] text-ink/70 font-mono">
                        {m.email || 'Contact on file'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-blue font-bold">
                      {m.membershipNumber}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="primary" className="text-[10px]">
                        {getMemberCategoryLabel(m.memberCategory)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="text-[10px]">
                        {getCurrentPositionLabel(m.currentPosition)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-ink font-serif">
                      {m.companyName ? `${m.companyName} (${m.businessSector})` : m.businessSector}
                    </td>
                    <td className="py-3 px-4 text-ink/70">
                      {new Date(m.joinedDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {m.hasPendingDeactivation ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-950 border border-amber-900 font-display text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_#14161c]">
                          <Clock className="h-3 w-3" /> Deactivation Pending
                        </span>
                      ) : (
                        <Badge variant="success" className="text-[10px]">
                          {m.status}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingMember(m)}
                          className="h-7 px-2 text-[10px] font-display font-black uppercase tracking-wider border border-ink/40 bg-paper hover:bg-paper-2 shadow-[1px_1px_0px_#14161c]"
                          title="View Member Profile"
                        >
                          <Eye className="h-3 w-3 mr-1" /> View
                        </Button>

                        {m.hasPendingDeactivation ? (
                          <span
                            className="text-[10px] text-amber-900 font-serif italic cursor-help"
                            title={m.pendingDeactivationReason || 'Awaiting District & Super Admin review'}
                          >
                            Review in progress
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeactivationModal(m)}
                            className="h-7 px-2 text-[10px] font-display font-black uppercase tracking-wider text-destructive border-destructive/60 hover:bg-destructive/10 bg-paper shadow-[1px_1px_0px_#14161c]"
                            title="Request Member Deactivation"
                          >
                            <UserX className="h-3 w-3 mr-1" /> Deactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* VIEW MEMBER DETAILS MODAL */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-paper border-2 border-ink shadow-[6px_6px_0px_#14161c] max-w-xl w-full max-h-[90vh] overflow-y-auto my-auto">
            <div className="p-5 border-b-2 border-ink bg-paper flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-[10px] font-black uppercase px-2 py-0.5 bg-yellow text-ink border border-ink shadow-[1px_1px_0px_#14161c]">
                    Verified Member Profile
                  </span>
                  <Badge variant={viewingMember.hasPendingDeactivation ? 'warning' : 'success'}>
                    {viewingMember.hasPendingDeactivation ? 'DEACTIVATION PENDING' : viewingMember.status}
                  </Badge>
                </div>
                <h3 className="font-display text-xl font-black uppercase tracking-tight text-ink mt-1.5">
                  {viewingMember.fullName}
                </h3>
                <p className="font-mono text-xs text-blue font-bold">
                  Member ID: {viewingMember.membershipNumber}
                </p>
              </div>
              <button
                onClick={() => setViewingMember(null)}
                className="p-1 border border-ink bg-paper hover:bg-paper-2 text-ink shadow-[1px_1px_0px_#14161c]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-ink/20 bg-paper-sunken">
                <div>
                  <span className="font-display text-[10px] font-black uppercase text-ink/60 block">Category</span>
                  <span className="font-bold text-ink">{getMemberCategoryLabel(viewingMember.memberCategory)}</span>
                </div>
                <div>
                  <span className="font-display text-[10px] font-black uppercase text-ink/60 block">Position</span>
                  <span className="font-bold text-ink">{getCurrentPositionLabel(viewingMember.currentPosition)}</span>
                </div>
                <div>
                  <span className="font-display text-[10px] font-black uppercase text-ink/60 block">Email Address</span>
                  <span className="font-mono text-ink">{viewingMember.email || 'None on file'}</span>
                </div>
                <div>
                  <span className="font-display text-[10px] font-black uppercase text-ink/60 block">Phone Number</span>
                  <span className="font-mono text-ink">{viewingMember.phone || 'None on file'}</span>
                </div>
                <div>
                  <span className="font-display text-[10px] font-black uppercase text-ink/60 block">Company / Business</span>
                  <span className="font-serif text-ink">{viewingMember.companyName || 'Not specified'}</span>
                </div>
                <div>
                  <span className="font-display text-[10px] font-black uppercase text-ink/60 block">Business Sector</span>
                  <span className="font-serif text-ink">{viewingMember.businessSector}</span>
                </div>
                <div>
                  <span className="font-display text-[10px] font-black uppercase text-ink/60 block">Occupation</span>
                  <span className="font-serif text-ink">{viewingMember.occupation || 'Entrepreneur'}</span>
                </div>
                <div>
                  <span className="font-display text-[10px] font-black uppercase text-ink/60 block">Member Since</span>
                  <span className="font-serif text-ink">
                    {new Date(viewingMember.joinedDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {viewingMember.hasPendingDeactivation && (
                <div className="p-3 bg-amber-50 border-2 border-amber-900 text-amber-950 shadow-[2px_2px_0px_#14161c]">
                  <div className="flex items-center gap-1.5 font-display text-[11px] font-black uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4 text-amber-800" /> Active Governance Request
                  </div>
                  <p className="mt-1 font-serif text-xs">
                    A membership removal request is currently under multi-tier review.
                  </p>
                  {viewingMember.pendingDeactivationReason && (
                    <p className="mt-1 font-mono text-[11px] bg-amber-100/80 p-2 border border-amber-800/40">
                      Reason: {viewingMember.pendingDeactivationReason}
                    </p>
                  )}
                </div>
              )}

              <div className="p-3 bg-paper border border-ink/20 text-ink/70 font-serif text-[11px] leading-relaxed">
                <strong>Data Retention & Integrity:</strong> In accordance with MYBF governance bylaws and Mission Malappuram 2050 standards, member history, attendance logs, and financial records are preserved permanently.
              </div>
            </div>

            <div className="p-4 border-t-2 border-ink bg-paper flex items-center justify-between">
              <div>
                {!viewingMember.hasPendingDeactivation && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const m = viewingMember;
                      setViewingMember(null);
                      openDeactivationModal(m);
                    }}
                    className="text-destructive border-destructive/60 hover:bg-destructive/10 text-xs font-display uppercase tracking-wider font-bold"
                  >
                    <UserX className="h-3.5 w-3.5 mr-1" /> Request Deactivation
                  </Button>
                )}
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => setViewingMember(null)}
                className="text-xs font-display font-black uppercase tracking-wider"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER DEACTIVATION GOVERNANCE MODAL */}
      {deactivatingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-paper border-2 border-ink shadow-[6px_6px_0px_#14161c] max-w-lg w-full max-h-[90vh] overflow-y-auto my-auto">
            <div className="p-5 border-b-2 border-ink bg-paper flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-[10px] font-black uppercase px-2 py-0.5 bg-rose-600 text-white border border-ink shadow-[1px_1px_0px_#14161c]">
                    Controlled Governance Action
                  </span>
                  <span className="font-display text-[10px] font-black uppercase px-2 py-0.5 bg-yellow text-ink border border-ink shadow-[1px_1px_0px_#14161c]">
                    Maker-Checker
                  </span>
                </div>
                <h3 className="font-display text-lg font-black uppercase tracking-tight text-ink mt-1.5">
                  Request Membership Removal
                </h3>
                <p className="font-serif text-xs text-ink/70">
                  Target Member: <strong>{deactivatingMember.fullName}</strong> ({deactivatingMember.membershipNumber})
                </p>
              </div>
              <button
                onClick={closeDeactivationModal}
                disabled={isSubmitting}
                className="p-1 border border-ink bg-paper hover:bg-paper-2 text-ink shadow-[1px_1px_0px_#14161c]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDeactivation} className="p-5 space-y-4">
              {/* Governance Warning Box */}
              <div className="p-3 bg-amber-50 border-2 border-amber-900 text-amber-950 shadow-[2px_2px_0px_#14161c]">
                <div className="flex items-center gap-1.5 font-display text-[11px] font-black uppercase tracking-wider text-amber-950">
                  <ShieldAlert className="h-4 w-4 text-amber-800" /> Multi-Tier Approval Protocol
                </div>
                <p className="mt-1 font-serif text-xs text-amber-900 leading-relaxed">
                  Chapter Executives initiate removal requests for invalid, duplicate, fraudulent, or ineligible memberships. The request is recorded with actor timestamp and forwarded to the <strong>District Admin</strong> for review and <strong>Super Admin</strong> for final authorization.
                </p>
                <p className="mt-1.5 font-serif text-[11px] text-amber-950 font-bold">
                  ✓ Historical data (Member ID, attendance, audit history) will NOT be deleted.
                </p>
              </div>

              {submitError && (
                <div className="p-3 bg-rose-50 border-2 border-rose-900 text-rose-950 text-xs shadow-[2px_2px_0px_#14161c]">
                  <p className="font-bold font-sans">Submission Error:</p>
                  <p className="font-serif mt-0.5">{submitError}</p>
                </div>
              )}

              {/* Reason Category */}
              <div className="space-y-1">
                <label className="text-[11px] font-black font-display uppercase tracking-wider text-ink block">
                  Grounds for Removal / Category *
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full border-2 border-ink bg-paper px-3 py-2 text-xs text-ink font-display font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue shadow-[1px_1px_0px_#14161c]"
                >
                  {DEACTIVATION_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detailed Justification */}
              <div className="space-y-1">
                <label className="text-[11px] font-black font-display uppercase tracking-wider text-ink block">
                  Administrative Justification & Details *
                </label>
                <textarea
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Provide specific facts, circumstances, or committee references justifying this deactivation..."
                  className="w-full border-2 border-ink bg-paper p-2.5 text-xs text-ink placeholder:text-ink/40 font-serif focus:outline-none focus:ring-2 focus:ring-blue shadow-[1px_1px_0px_#14161c]"
                  required
                />
                <span className="text-[10px] text-ink/60 font-serif block">
                  Minimum 10 characters required. Recorded in the immutable audit trail.
                </span>
              </div>

              {/* Policy Confirmation Checkbox */}
              <div className="p-3 border-2 border-ink/20 bg-paper-sunken">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-ink font-serif">
                  <input
                    type="checkbox"
                    checked={confirmedPolicy}
                    onChange={(e) => setConfirmedPolicy(e.target.checked)}
                    disabled={isSubmitting}
                    className="mt-0.5 h-4 w-4 border-2 border-ink rounded-none text-blue focus:ring-blue"
                  />
                  <span>
                    I confirm that this deactivation request has been authorized by the <strong>{chapterName} Chapter Executive</strong> committee and adheres to the MYBF Governance Constitution.
                  </span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-2 border-t-2 border-ink/10 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeDeactivationModal}
                  disabled={isSubmitting}
                  className="border-2 border-ink bg-paper text-xs font-display uppercase tracking-wider font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  disabled={isSubmitting || !confirmedPolicy || justification.trim().length < 10}
                  className="text-xs font-display uppercase tracking-wider font-black shadow-[2px_2px_0px_#14161c]"
                >
                  {isSubmitting ? 'Submitting Request...' : 'Submit Removal Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}

