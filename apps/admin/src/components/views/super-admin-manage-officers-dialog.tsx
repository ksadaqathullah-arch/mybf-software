'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Clock,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  History,
  Users,
} from 'lucide-react';

export const CANONICAL_LEADERSHIP_ROLES = [
  { role: 'PRESIDENT', label: 'President', description: 'Executive Lead & Chair of Chapter Executive' },
  { role: 'SECRETARY', label: 'Secretary', description: 'Operations, Records & Secretarial Affairs' },
  { role: 'TREASURER', label: 'Treasurer', description: 'Financial Oversight, Budgeting & Accounts' },
  { role: 'VICE_PRESIDENT', label: 'Vice President', description: 'Executive Vice Chair & Program Support' },
  { role: 'JOINT_SECRETARY', label: 'Joint Secretary', description: 'Secretarial Support & Meeting Logistics' },
  { role: 'COORDINATOR', label: 'Coordinator', description: 'Member Engagement & Constituency Coordination' },
  { role: 'DIRECTOR', label: 'Director', description: 'Board Director & Sectoral Initiative Lead' },
] as const;

export interface ChapterLeadershipItem {
  id: string;
  role: string;
  title: string | null;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  user: {
    id: string;
    email: string | null;
    username: string | null;
    profile?: {
      fullName: string;
      primaryPhone?: string | null;
    } | null;
  };
}

export interface UserCandidate {
  id: string;
  email: string | null;
  username: string | null;
  fullName: string;
}

interface SuperAdminManageOfficersDialogProps {
  chapter: {
    id: string;
    code: string;
    name: string;
    slug: string;
    status: string;
    district?: { name: string; code?: string };
  };
  eligibleUsers: UserCandidate[];
  initialRole?: string;
  onClose: () => void;
  onOfficerChange?: () => void;
}

export function SuperAdminManageOfficersDialog({
  chapter,
  eligibleUsers,
  initialRole,
  onClose,
  onOfficerChange,
}: SuperAdminManageOfficersDialogProps) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'appoint' | 'history'>('overview');
  const [officers, setOfficers] = React.useState<ChapterLeadershipItem[]>([]);
  const [historyRecords, setHistoryRecords] = React.useState<ChapterLeadershipItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [notice, setNotice] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Appoint form state
  const [selectedRole, setSelectedRole] = React.useState<string>(initialRole || 'PRESIDENT');
  const [selectedUserId, setSelectedUserId] = React.useState('');
  const [userSearchQuery, setUserSearchQuery] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [startDate, setStartDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Revoke modal state
  const [revokingAppointment, setRevokingAppointment] = React.useState<ChapterLeadershipItem | null>(null);
  const [revokeReason, setRevokeReason] = React.useState('');
  const [isRevoking, setIsRevoking] = React.useState(false);

  // Fetch chapter leadership records (both active and historical)
  const fetchChapterOfficers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/v1/super-admin/chapter-officers?chapterId=${chapter.id}&includeHistory=true`
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setOfficers(data.active || []);
        setHistoryRecords(data.history || []);
      }
    } catch {
      // Handled silently
    } finally {
      setIsLoading(false);
    }
  }, [chapter.id]);

  React.useEffect(() => {
    fetchChapterOfficers();
  }, [fetchChapterOfficers]);

  // Filtered candidate users for member search
  const filteredCandidates = React.useMemo(() => {
    if (!userSearchQuery.trim()) return eligibleUsers.slice(0, 8);
    const q = userSearchQuery.toLowerCase().trim();
    return eligibleUsers
      .filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.username && u.username.toLowerCase().includes(q))
      )
      .slice(0, 10);
  }, [eligibleUsers, userSearchQuery]);

  const selectedCandidateUser = React.useMemo(() => {
    return eligibleUsers.find((u) => u.id === selectedUserId) || null;
  }, [eligibleUsers, selectedUserId]);

  const currentActiveForSelectedRole = React.useMemo(() => {
    return officers.find((o) => o.role === selectedRole && o.isActive) || null;
  }, [officers, selectedRole]);

  // Handle Appoint Submission
  const handleAppoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedRole) {
      setNotice({ type: 'error', message: 'Please select an eligible member candidate and role.' });
      return;
    }

    setIsSubmitting(true);
    setNotice(null);

    try {
      const res = await fetch('/api/v1/super-admin/chapter-officers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          chapterId: chapter.id,
          role: selectedRole,
          title: title.trim() || undefined,
          startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to appoint chapter officer.');
      }

      setNotice({
        type: 'success',
        message: `Successfully appointed ${selectedCandidateUser?.fullName || 'member'} as Chapter ${selectedRole.replace(/_/g, ' ')}. Access claims synchronized immediately.`,
      });

      // Reset form
      setSelectedUserId('');
      setUserSearchQuery('');
      setTitle('');
      setEndDate('');
      await fetchChapterOfficers();
      onOfficerChange?.();
      setActiveTab('overview');
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Error appointing chapter officer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Revoke Submission with mandatory reason
  const handleConfirmRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokingAppointment) return;

    if (!revokeReason || revokeReason.trim().length < 5) {
      setNotice({ type: 'error', message: 'A specific reason of at least 5 characters is required for revocation.' });
      return;
    }

    setIsRevoking(true);
    try {
      const res = await fetch('/api/v1/super-admin/chapter-officers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: chapter.id,
          appointmentId: revokingAppointment.id,
          reason: revokeReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to revoke appointment.');
      }

      setNotice({
        type: 'success',
        message: `Revoked ${revokingAppointment.role.replace(/_/g, ' ')} appointment for ${
          revokingAppointment.user.profile?.fullName || revokingAppointment.user.username
        }. Access revoked and audit logged.`,
      });

      setRevokingAppointment(null);
      setRevokeReason('');
      await fetchChapterOfficers();
      onOfficerChange?.();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Error revoking appointment.' });
    } finally {
      setIsRevoking(false);
    }
  };

  const startAppointForRole = (role: string) => {
    setSelectedRole(role);
    setActiveTab('appoint');
    setNotice(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-paper border-2 border-ink shadow-[6px_6px_0px_#14161c] max-w-4xl w-full max-h-[92vh] overflow-y-auto my-auto flex flex-col">
        {/* Header */}
        <div className="p-5 border-b-2 border-ink bg-paper flex items-start justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-[10px] font-black uppercase px-2 py-0.5 bg-yellow text-ink border border-ink shadow-[1px_1px_0px_#14161c]">
                Central Chapter Governance
              </span>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-blue text-paper border border-ink shadow-[1px_1px_0px_#14161c]">
                {chapter.code}
              </span>
              <Badge variant={chapter.status === 'ACTIVE' ? 'success' : 'neutral'}>
                {chapter.status}
              </Badge>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-ink mt-1.5 flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue shrink-0" />
              {chapter.name} Leadership Management
            </h2>
            <p className="font-serif text-xs text-ink/70 mt-0.5">
              Constituency Assembly Chapter • {chapter.district?.name || 'Malappuram'} District Jurisdiction
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-ink bg-paper hover:bg-paper-2 text-ink shadow-[2px_2px_0px_#14161c] cursor-pointer"
            title="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Feedback Notice */}
        {notice && (
          <div
            className={`m-4 mb-0 p-3.5 border-2 text-xs font-bold flex items-start justify-between gap-2 shadow-[2px_2px_0px_#14161c] ${
              notice.type === 'success'
                ? 'border-emerald-800 bg-emerald-50 text-emerald-950'
                : 'border-rose-800 bg-rose-50 text-rose-950'
            }`}
          >
            <div className="flex items-start gap-2">
              {notice.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
              )}
              <span className="font-serif text-xs leading-snug">{notice.message}</span>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="text-xs font-bold px-1 hover:opacity-75"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-5 pt-4 border-b-2 border-ink/20 flex gap-2 bg-paper-sunken">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 text-xs font-display font-black uppercase tracking-wider border-b-2 -mb-0.5 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-ink text-ink bg-paper border-t-2 border-x-2 shadow-[2px_0px_0px_#14161c]'
                : 'border-transparent text-ink/60 hover:text-ink'
            }`}
          >
            <Users className="h-3.5 w-3.5 text-blue" /> Officers & Vacancies ({officers.length})
          </button>
          <button
            onClick={() => setActiveTab('appoint')}
            className={`px-3 py-2 text-xs font-display font-black uppercase tracking-wider border-b-2 -mb-0.5 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'appoint'
                ? 'border-ink text-ink bg-paper border-t-2 border-x-2 shadow-[2px_0px_0px_#14161c]'
                : 'border-transparent text-ink/60 hover:text-ink'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5 text-yellow" /> Appoint Officer
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-2 text-xs font-display font-black uppercase tracking-wider border-b-2 -mb-0.5 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-ink text-ink bg-paper border-t-2 border-x-2 shadow-[2px_0px_0px_#14161c]'
                : 'border-transparent text-ink/60 hover:text-ink'
            }`}
          >
            <History className="h-3.5 w-3.5 text-ink/60" /> Appointment History ({historyRecords.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 bg-paper">
          {/* TAB 1: OVERVIEW & VACANCIES */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-ink">
                    Constituency Executive Positions (7 Roles)
                  </h3>
                  <p className="font-serif text-xs text-ink/60">
                    Active verified leadership appointments and open vacancies for {chapter.name}.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchChapterOfficers}
                  className="h-7 text-[10px] px-2.5 font-display font-bold uppercase tracking-wider"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {CANONICAL_LEADERSHIP_ROLES.map(({ role, label, description }) => {
                  const appointment = officers.find((o) => o.role === role && o.isActive);

                  return (
                    <div
                      key={role}
                      className={`p-3.5 border-2 border-ink shadow-[2px_2px_0px_#14161c] flex flex-col justify-between transition-all ${
                        appointment ? 'bg-paper' : 'bg-paper-sunken border-dashed'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-[9px] font-black uppercase tracking-widest text-ink/50 block">
                              {role}
                            </span>
                            <h4 className="font-display font-black text-sm uppercase text-ink">
                              {label}
                            </h4>
                          </div>
                          {appointment ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-900 font-display text-[9px] font-black uppercase tracking-wider shadow-[1px_1px_0px_#14161c]">
                              <UserCheck className="h-3 w-3" /> Appointed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-950 border border-amber-900 font-display text-[9px] font-black uppercase tracking-wider shadow-[1px_1px_0px_#14161c]">
                              <Clock className="h-3 w-3" /> Vacant
                            </span>
                          )}
                        </div>

                        <p className="font-serif text-[11px] text-ink/60 mt-1 line-clamp-1">
                          {description}
                        </p>

                        {/* Officer Info if Appointed */}
                        {appointment ? (
                          <div className="mt-3 p-2.5 bg-paper-sunken border border-ink/20 text-xs">
                            <div className="font-bold text-ink font-sans">
                              {appointment.user.profile?.fullName || appointment.user.username || 'Unnamed'}
                            </div>
                            <div className="text-[11px] text-ink/70 font-mono">
                              {appointment.user.email}
                              {appointment.user.profile?.primaryPhone && (
                                <span> • {appointment.user.profile.primaryPhone}</span>
                              )}
                            </div>
                            {appointment.title && (
                              <div className="text-[11px] text-ink font-serif italic mt-0.5">
                                Title: &ldquo;{appointment.title}&rdquo;
                              </div>
                            )}
                            <div className="text-[10px] text-ink/60 font-mono mt-1">
                              Since: {new Date(appointment.startDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 p-2.5 bg-amber-50/50 border border-amber-900/20 text-xs text-amber-950 font-serif italic">
                            No active officer currently appointed to this single-holder seat.
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3 pt-2.5 border-t border-ink/10 flex items-center justify-end gap-2">
                        {appointment ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startAppointForRole(role)}
                              className="h-6 text-[10px] px-2 font-display font-bold uppercase tracking-wider"
                              title="Replace with another candidate"
                            >
                              Replace
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setRevokingAppointment(appointment);
                                setRevokeReason('');
                              }}
                              className="h-6 text-[10px] px-2 font-display font-black uppercase tracking-wider shadow-[1px_1px_0px_#14161c]"
                              title="Revoke appointment with mandatory reason"
                            >
                              <Trash2 className="h-3 w-3 mr-1" /> Revoke
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => startAppointForRole(role)}
                            className="h-6 text-[10px] px-2.5 font-display font-black uppercase tracking-wider bg-yellow text-ink border border-ink shadow-[1px_1px_0px_#14161c]"
                          >
                            <UserPlus className="h-3 w-3 mr-1" /> Appoint {label}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: APPOINT OFFICER FORM */}
          {activeTab === 'appoint' && (
            <form onSubmit={handleAppoint} className="space-y-4 max-w-2xl mx-auto">
              <div className="p-3 bg-blue/10 border-2 border-blue text-blue text-xs shadow-[2px_2px_0px_#14161c]">
                <div className="flex items-center gap-1.5 font-display font-black uppercase tracking-wider">
                  <Shield className="h-4 w-4" /> Central Executive Appointment Protocol
                </div>
                <p className="mt-0.5 font-serif text-[11px] leading-relaxed text-ink/80">
                  Appointing an active member grants chapter executive access claims and membership review authority strictly scoped to <strong>{chapter.name}</strong>. Single-holder positions automatically retire any prior tenure and update audit records.
                </p>
              </div>

              {currentActiveForSelectedRole && (
                <div className="p-3 bg-amber-50 border-2 border-amber-900 text-amber-950 text-xs shadow-[2px_2px_0px_#14161c]">
                  <div className="flex items-center gap-1.5 font-display font-black uppercase tracking-wider text-amber-950">
                    <AlertTriangle className="h-4 w-4 text-amber-800" /> Single-Holder Conflict Notice
                  </div>
                  <p className="mt-0.5 font-serif text-[11px] leading-relaxed">
                    <strong>{selectedRole}</strong> is currently held by{' '}
                    <strong>
                      {currentActiveForSelectedRole.user.profile?.fullName ||
                        currentActiveForSelectedRole.user.username}
                    </strong>. Completing this appointment will transactionally retire their tenure, revoke their chapter executive claims, and preserve their appointment in the historical audit ledger.
                  </p>
                </div>
              )}

              {/* Position Selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-black font-display uppercase tracking-wider text-ink block">
                  Select Leadership Position *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full border-2 border-ink bg-white px-3 py-2 text-xs text-ink font-display font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                  required
                >
                  {CANONICAL_LEADERSHIP_ROLES.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label} ({r.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Candidate Member Search */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black font-display uppercase tracking-wider text-ink block">
                  Search & Select Eligible Active Member *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-ink/40" />
                  <input
                    type="text"
                    placeholder="Search candidate by name, email, or username..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border-2 border-ink bg-white text-xs text-ink placeholder:text-ink/40 font-serif focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                  />
                </div>

                {/* Candidate Selection List */}
                <div className="border-2 border-ink bg-paper-sunken max-h-40 overflow-y-auto divide-y divide-ink/10 text-xs">
                  {filteredCandidates.length === 0 ? (
                    <div className="p-3 text-center text-ink/50 font-serif italic text-xs">
                      No matching active members found.
                    </div>
                  ) : (
                    filteredCandidates.map((u) => {
                      const isSelected = selectedUserId === u.id;
                      return (
                        <div
                          key={u.id}
                          onClick={() => setSelectedUserId(u.id)}
                          className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? 'bg-yellow/40 font-bold' : 'hover:bg-yellow/15'
                          }`}
                        >
                          <div>
                            <div className="font-sans font-bold text-ink">{u.fullName}</div>
                            <div className="text-[10px] text-ink/60 font-mono">
                              {u.email} {u.username && `(@${u.username})`}
                            </div>
                          </div>
                          <button
                            type="button"
                            className={`px-2 py-0.5 text-[10px] font-display font-black uppercase border tracking-wider shadow-[1px_1px_0px_#14161c] ${
                              isSelected
                                ? 'bg-ink text-paper border-ink'
                                : 'bg-paper text-ink border-ink/40 hover:border-ink'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : 'Choose'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {selectedCandidateUser && (
                  <div className="p-2 bg-emerald-50 border border-emerald-800 text-emerald-950 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span>
                      Selected Candidate: <strong>{selectedCandidateUser.fullName}</strong> ({selectedCandidateUser.email})
                    </span>
                  </div>
                )}
              </div>

              {/* Custom Title (Optional) */}
              <div className="space-y-1">
                <label className="text-[11px] font-black font-display uppercase tracking-wider text-ink block">
                  Custom Executive Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter Executive Committee Head"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-2 border-ink bg-white px-3 py-2 text-xs text-ink placeholder:text-ink/40 font-serif focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                />
              </div>

              {/* Appointment Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-black font-display uppercase tracking-wider text-ink block">
                    Tenure Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border-2 border-ink bg-white px-3 py-2 text-xs text-ink font-mono focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black font-display uppercase tracking-wider text-ink block">
                    Tenure End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border-2 border-ink bg-white px-3 py-2 text-xs text-ink font-mono focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t-2 border-ink/10 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('overview')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  disabled={isSubmitting || !selectedUserId}
                  className="bg-yellow text-ink font-black shadow-[2px_2px_0px_#14161c]"
                >
                  {isSubmitting ? 'Registering Appointment...' : `Confirm Appointment: ${selectedRole}`}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: APPOINTMENT HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-ink">
                  Historical Chapter Leadership Ledger
                </h3>
                <p className="font-serif text-xs text-ink/60">
                  Retired, superseded and revoked officer tenures for {chapter.name}.
                </p>
              </div>

              {historyRecords.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-ink/20 text-center font-serif italic text-xs text-ink/50 bg-paper-sunken">
                  No previous or retired leadership records logged for this chapter.
                </div>
              ) : (
                <div className="border-2 border-ink bg-paper overflow-hidden shadow-[2px_2px_0px_#14161c]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="border-b-2 border-ink bg-paper-sunken text-ink font-display text-[10px] font-black uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Officer</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Tenure Period</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/10 font-sans text-xs">
                      {historyRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-yellow/10">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-ink">
                              {record.user.profile?.fullName || record.user.username || 'Unnamed'}
                            </div>
                            <div className="text-[10px] text-ink/60 font-mono">
                              {record.user.email}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-display font-bold text-xs uppercase text-ink">
                              {record.role.replace(/_/g, ' ')}
                            </span>
                            {record.title && (
                              <div className="text-[10px] text-ink/60 font-serif italic">
                                {record.title}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-ink/70">
                            <div>From: {new Date(record.startDate).toLocaleDateString()}</div>
                            {record.endDate && (
                              <div className="text-ink/50">To: {new Date(record.endDate).toLocaleDateString()}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <Badge variant="neutral" className="text-[9px]">
                              RETIRED
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-ink bg-paper-sunken flex items-center justify-between">
          <span className="font-mono text-[10px] text-ink/60 uppercase">
            All appointments audited • Central Secretariat Oversight
          </span>
          <Button variant="default" size="sm" onClick={onClose} className="h-8 text-xs">
            Close
          </Button>
        </div>
      </div>

      {/* REVOKE APPOINTMENT MODAL */}
      {revokingAppointment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-paper border-2 border-ink shadow-[6px_6px_0px_#14161c] max-w-md w-full p-5 my-auto">
            <div className="flex items-start justify-between pb-3 border-b-2 border-ink">
              <div>
                <span className="px-2 py-0.5 bg-rose-600 text-white font-display text-[10px] font-black uppercase tracking-wider border border-ink shadow-[1px_1px_0px_#14161c]">
                  Controlled Access Revocation
                </span>
                <h3 className="font-display text-lg font-black uppercase tracking-tight text-ink mt-1.5">
                  Revoke Chapter Leadership
                </h3>
              </div>
              <button
                onClick={() => setRevokingAppointment(null)}
                disabled={isRevoking}
                className="p-1 border border-ink bg-paper hover:bg-paper-2 text-ink shadow-[1px_1px_0px_#14161c]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRevoke} className="mt-4 space-y-3.5">
              <div className="p-3 bg-rose-50 border-2 border-rose-900 text-rose-950 text-xs shadow-[2px_2px_0px_#14161c]">
                <div className="flex items-center gap-1.5 font-display font-black uppercase tracking-wider text-rose-900">
                  <AlertTriangle className="h-4 w-4 text-rose-700" /> Revocation Warning
                </div>
                <p className="mt-1 font-serif text-[11px] leading-relaxed">
                  You are revoking the <strong>{revokingAppointment.role.replace(/_/g, ' ')}</strong> position from{' '}
                  <strong>
                    {revokingAppointment.user.profile?.fullName || revokingAppointment.user.username}
                  </strong>{' '}
                  in <strong>{chapter.name}</strong>. Their chapter executive claims will be terminated immediately.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black font-display uppercase tracking-wider text-ink block">
                  Mandatory Administrative Revocation Reason *
                </label>
                <textarea
                  rows={3}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  disabled={isRevoking}
                  placeholder="Specify authorized grounds (e.g. voluntary resignation, tenure expiration, restructuring, policy breach)..."
                  className="w-full border-2 border-ink bg-white p-2.5 text-xs text-ink placeholder:text-ink/40 font-serif focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                  required
                />
                <span className="text-[10px] text-ink/60 font-serif block">
                  Minimum 5 characters required. Logged to the immutable audit event trail.
                </span>
              </div>

              <div className="pt-2 border-t-2 border-ink/10 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRevokingAppointment(null)}
                  disabled={isRevoking}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  disabled={isRevoking || revokeReason.trim().length < 5}
                  className="shadow-[2px_2px_0px_#14161c] text-xs font-black uppercase tracking-wider"
                >
                  {isRevoking ? 'Revoking Claims...' : 'Confirm Revocation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
