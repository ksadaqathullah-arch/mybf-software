'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  AlertTriangle,
} from 'lucide-react';

export const ALL_CANONICAL_ROLES = [
  { role: 'PRESIDENT', label: 'President', desc: 'Chapter President & Executive Chair' },
  { role: 'SECRETARY', label: 'Secretary', desc: 'Chapter Secretary & Operations Lead' },
  { role: 'TREASURER', label: 'Treasurer', desc: 'Chapter Treasurer & Financial Lead' },
  { role: 'VICE_PRESIDENT', label: 'Vice President', desc: 'Executive Vice Chair' },
  { role: 'JOINT_SECRETARY', label: 'Joint Secretary', desc: 'Secretarial & Program Support' },
  { role: 'COORDINATOR', label: 'Coordinator', desc: 'Constituency Engagement Coordinator' },
  { role: 'DIRECTOR', label: 'Director', desc: 'Chapter Board Director' },
] as const;

interface OfficerRecord {
  id: string;
  role: string;
  title: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  chapter: {
    id: string;
    code: string;
    name: string;
    slug: string;
  };
  user: {
    id: string;
    email: string | null;
    username: string | null;
    profile: {
      fullName: string;
      primaryPhone: string;
    } | null;
  };
}

interface ChapterOption {
  id: string;
  code: string;
  name: string;
  slug: string;
}

interface UserOption {
  id: string;
  email: string | null;
  username: string | null;
  fullName: string;
}

interface SuperAdminOfficersViewProps {
  initialOfficers: OfficerRecord[];
  chapters: ChapterOption[];
  users: UserOption[];
}

export function SuperAdminOfficersView({
  initialOfficers,
  chapters,
  users,
}: SuperAdminOfficersViewProps) {
  const [officers, setOfficers] = React.useState<OfficerRecord[]>(initialOfficers);
  const [selectedUserId, setSelectedUserId] = React.useState('');
  const [candidateSearch, setCandidateSearch] = React.useState('');
  const [selectedChapterId, setSelectedChapterId] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState('PRESIDENT');
  const [title, setTitle] = React.useState('');
  const [startDate, setStartDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [notice, setNotice] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Table filtering
  const [filterChapterId, setFilterChapterId] = React.useState('ALL');
  const [tableSearch, setTableSearch] = React.useState('');

  // Revocation Modal State
  const [revokingOfficer, setRevokingOfficer] = React.useState<OfficerRecord | null>(null);
  const [revocationReason, setRevocationReason] = React.useState('');
  const [isRevoking, setIsRevoking] = React.useState(false);

  // Filter candidate members for appointment
  const filteredUsers = React.useMemo(() => {
    if (!candidateSearch.trim()) return users.slice(0, 50);
    const q = candidateSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q))
    );
  }, [users, candidateSearch]);

  // Filter officers list
  const filteredOfficers = React.useMemo(() => {
    return officers.filter((o) => {
      const matchesChapter = filterChapterId === 'ALL' || o.chapter.id === filterChapterId;
      const q = tableSearch.toLowerCase();
      const matchesSearch =
        !q ||
        (o.user.profile?.fullName && o.user.profile.fullName.toLowerCase().includes(q)) ||
        (o.user.email && o.user.email.toLowerCase().includes(q)) ||
        o.chapter.name.toLowerCase().includes(q) ||
        o.chapter.code.toLowerCase().includes(q) ||
        o.role.toLowerCase().includes(q);
      return matchesChapter && matchesSearch;
    });
  }, [officers, filterChapterId, tableSearch]);

  const handleAppoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedChapterId || !selectedRole) {
      setNotice({ type: 'error', message: 'Please select a member candidate, chapter, and canonical role.' });
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
          chapterId: selectedChapterId,
          role: selectedRole,
          title: title || undefined,
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
        message: 'Chapter officer appointed successfully! Existing records and role assignments synchronized.',
      });
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Error appointing chapter officer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteRevoke = async () => {
    if (!revokingOfficer) return;
    if (!revocationReason.trim() || revocationReason.trim().length < 5) {
      alert('A valid revocation reason of at least 5 characters is mandatory for audit logging.');
      return;
    }

    setIsRevoking(true);
    try {
      const res = await fetch('/api/v1/super-admin/chapter-officers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: revokingOfficer.chapter.id,
          appointmentId: revokingOfficer.id,
          reason: revocationReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to revoke chapter appointment.');
      }

      setOfficers((prev) => prev.filter((o) => o.id !== revokingOfficer.id));
      setNotice({
        type: 'success',
        message: `Appointment for ${revokingOfficer.user.profile?.fullName || 'officer'} revoked and archived into historical audit log.`,
      });
      setRevokingOfficer(null);
      setRevocationReason('');
    } catch (err: any) {
      alert(err.message || 'Error revoking appointment.');
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {notice && (
        <div
          className={`p-4 border-2 text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_#14161c] ${
            notice.type === 'success'
              ? 'border-emerald-800 bg-emerald-50 text-emerald-950'
              : 'border-rose-800 bg-rose-50 text-rose-950'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          {notice.message}
        </div>
      )}

      {/* Appointment Form */}
      <Card className="border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c]">
        <CardHeader className="p-5 sm:p-6 pb-4 border-b-2 border-ink bg-paper-2/40">
          <CardTitle className="font-sans font-bold text-lg text-ink tracking-tight flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue" /> Appoint Chapter Executive Officer
          </CardTitle>
          <CardDescription className="font-sans text-xs text-muted">
            Grant chapter executive authority to an active MYBF member across any of the 16 constituency chapters with an immutable audit trail.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleAppoint} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Member Selection with Live Filter */}
              <div className="lg:col-span-2 space-y-1">
                <label className="block font-sans font-semibold text-ink text-xs mb-1">
                  Select Eligible Member / Candidate *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted" />
                    <input
                      type="text"
                      placeholder="Filter candidate by name/email..."
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 border-2 border-ink bg-white text-xs text-ink outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                    />
                  </div>
                  {candidateSearch && (
                    <button
                      type="button"
                      onClick={() => setCandidateSearch('')}
                      className="px-2 py-1 border-2 border-ink bg-paper-2 text-[10px] font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <select
                  className="w-full border-2 border-ink bg-white px-3 py-2 text-xs text-ink outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c] mt-1"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="">-- Choose User ({filteredUsers.length} shown) --</option>
                  {filteredUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.email || u.username || 'No email'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter Selection */}
              <div>
                <label className="block font-sans font-semibold text-ink mb-1 text-xs">
                  Constituency Chapter *
                </label>
                <select
                  className="w-full border-2 border-ink bg-white px-3 py-2 text-xs text-ink outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Chapter --</option>
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Canonical Role Selection */}
              <div>
                <label className="block font-sans font-semibold text-ink mb-1 text-xs">
                  Canonical Role *
                </label>
                <select
                  className="w-full border-2 border-ink bg-white px-3 py-2 text-xs text-ink outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  required
                >
                  {ALL_CANONICAL_ROLES.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block font-sans font-semibold text-ink mb-1 text-xs">
                  Custom Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Executive Committee Head"
                  className="w-full border-2 border-ink bg-white px-3 py-2 text-xs text-ink outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-sans font-semibold text-ink mb-1 text-xs">
                  Tenure Start Date *
                </label>
                <input
                  type="date"
                  className="w-full border-2 border-ink bg-white px-3 py-2 text-xs text-ink outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-sans font-semibold text-ink mb-1 text-xs">
                  Tenure End Date (Optional)
                </label>
                <input
                  type="date"
                  className="w-full border-2 border-ink bg-white px-3 py-2 text-xs text-ink outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 font-sans font-semibold tracking-normal"
              >
                {isSubmitting ? 'Registering Appointment...' : 'Appoint Chapter Officer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Officers List Table */}
      <Card className="border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c]">
        <CardHeader className="p-5 sm:p-6 pb-4 border-b-2 border-ink bg-paper-2/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-sans font-bold text-xl text-ink tracking-tight">
                Active Constituency Chapter Leadership ({filteredOfficers.length})
              </CardTitle>
              <CardDescription className="font-sans text-xs sm:text-sm text-muted">
                All current chapter executives endowed with regional membership review authority.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted" />
                <input
                  type="text"
                  placeholder="Search officers..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border-2 border-ink bg-white text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-yellow font-sans shadow-[2px_2px_0px_#14161c] w-48"
                />
              </div>

              <select
                value={filterChapterId}
                onChange={(e) => setFilterChapterId(e.target.value)}
                className="px-3 py-1.5 text-xs border-2 border-ink bg-white font-sans font-semibold shadow-[2px_2px_0px_#14161c] focus:outline-none"
              >
                <option value="ALL">All Chapters ({chapters.length})</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b-2 border-ink bg-ink text-paper font-sans text-xs font-semibold tracking-wide">
                <tr>
                  <th className="py-3 px-4 text-paper">Officer Name</th>
                  <th className="py-3 px-4 text-paper">Chapter</th>
                  <th className="py-3 px-4 text-paper">Role & Title</th>
                  <th className="py-3 px-4 text-paper">Tenure Period</th>
                  <th className="py-3 px-4 text-paper text-center">Status</th>
                  <th className="py-3 px-4 text-paper text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/15 font-sans">
                {filteredOfficers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted font-serif">
                      No chapter leadership appointments found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOfficers.map((officer) => (
                    <tr key={officer.id} className="hover:bg-yellow/15 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-ink">
                        <div className="font-sans font-bold text-sm text-ink">
                          {officer.user.profile?.fullName || officer.user.username || 'Unnamed'}
                        </div>
                        <div className="font-sans text-xs text-muted">
                          {officer.user.email} • {officer.user.profile?.primaryPhone || 'No Phone'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-sans font-semibold text-xs text-ink">{officer.chapter.name}</div>
                        <div className="font-mono text-[10px] text-muted">{officer.chapter.code}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="primary" className="mb-0.5">
                          {officer.role.replace(/_/g, ' ')}
                        </Badge>
                        {officer.title && (
                          <div className="font-sans text-xs text-muted">{officer.title}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-ink">
                        <div>Since: {new Date(officer.startDate).toLocaleDateString()}</div>
                        {officer.endDate && (
                          <div className="text-muted">Until: {new Date(officer.endDate).toLocaleDateString()}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={officer.isActive ? 'success' : 'neutral'}>
                          {officer.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRevokingOfficer(officer);
                            setRevocationReason('Executive restructuring / Central administrative mandate');
                          }}
                          className="h-7 px-2.5 text-rose-700 border-rose-700 hover:bg-rose-50 font-sans font-semibold text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Revoke
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Revocation Modal */}
      {revokingOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-paper border-2 border-ink shadow-[8px_8px_0px_#14161c] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                <h4 className="font-sans font-bold text-base text-ink">
                  Revoke Officer Appointment
                </h4>
              </div>
              <button
                onClick={() => setRevokingOfficer(null)}
                className="text-muted hover:text-ink font-bold"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs space-y-2 bg-paper-2 p-3 border border-ink/30 font-sans">
              <p>
                <strong>Officer:</strong>{' '}
                {revokingOfficer.user.profile?.fullName || revokingOfficer.user.username}
              </p>
              <p>
                <strong>Position:</strong> {revokingOfficer.role.replace(/_/g, ' ')}
              </p>
              <p>
                <strong>Chapter:</strong> {revokingOfficer.chapter.name} ({revokingOfficer.chapter.code})
              </p>
            </div>

            <div className="space-y-1">
              <label className="block font-sans font-semibold text-xs text-ink mb-1">
                Revocation Reason (Mandatory for Audit Log) *
              </label>
              <textarea
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                placeholder="Specify administrative justification (minimum 5 characters)..."
                rows={3}
                className="w-full border-2 border-ink bg-white p-2 text-xs font-sans outline-none focus:ring-2 focus:ring-rose-500 shadow-[2px_2px_0px_#14161c]"
                required
              />
              <p className="font-mono text-[10px] text-muted">
                This action is audited. The user&apos;s active chapter leadership role assignment will be immediately revoked.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRevokingOfficer(null)}
                disabled={isRevoking}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleExecuteRevoke}
                disabled={isRevoking || revocationReason.trim().length < 5}
              >
                {isRevoking ? 'Revoking...' : 'Confirm Revocation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
