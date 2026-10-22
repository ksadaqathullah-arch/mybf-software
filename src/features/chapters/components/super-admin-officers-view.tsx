'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, UserPlus, Trash2, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [selectedChapterId, setSelectedChapterId] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState('PRESIDENT');
  const [title, setTitle] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [notice, setNotice] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAppoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedChapterId || !selectedRole) {
      setNotice({ type: 'error', message: 'Please select a user, chapter, and role.' });
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
          endDate: endDate ? new Date(endDate).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to appoint chapter officer.');
      }

      setNotice({ type: 'success', message: 'Chapter officer appointed successfully!' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Error appointing chapter officer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (chapterId: string, appointmentId: string) => {
    if (!confirm('Are you sure you want to revoke this chapter officer appointment?')) {
      return;
    }

    try {
      const res = await fetch('/api/v1/super-admin/chapter-officers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          appointmentId,
          reason: 'Revoked by Super Administrator',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to revoke appointment.');
      }

      setOfficers((prev) => prev.filter((o) => o.id !== appointmentId));
      setNotice({ type: 'success', message: 'Officer appointment revoked successfully.' });
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Error revoking appointment.' });
    }
  };

  return (
    <div className="space-y-8">
      {notice && (
        <div
          className={`p-4 border-2 text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_#14161c] ${
            notice.type === 'success'
              ? 'border-emerald-800 bg-emerald-50 text-emerald-950'
              : 'border-rose-800 bg-rose-50 text-rose-950'
          }`}
        >
          {notice.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" /> : <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />}
          {notice.message}
        </div>
      )}

      {/* Appointment Form */}
      <Card className="border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c]">
        <CardHeader className="p-5 sm:p-6 pb-4 border-b-2 border-ink bg-paper-2/40">
          <CardTitle className="font-display font-extrabold text-lg text-ink uppercase tracking-tight flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue" /> Appoint Chapter Executive Officer
          </CardTitle>
          <CardDescription className="font-serif text-xs text-muted">
            Grant chapter administrative authority to an active MYBF member with an immutable audit record.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleAppoint} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
            <div>
              <label className="block font-display font-bold uppercase tracking-wider text-ink mb-1 text-[11px]">
                Select Member / Candidate *
              </label>
              <select
                className="w-full border-2 border-ink bg-white px-3 py-2 text-xs text-ink outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
              >
                <option value="">-- Choose User --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email || u.username})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-display font-bold uppercase tracking-wider text-ink mb-1 text-[11px]">
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

            <div>
              <label className="block font-display font-bold uppercase tracking-wider text-ink mb-1 text-[11px]">
                Executive Role *
              </label>
              <select
                className="w-full border-2 border-ink bg-white px-3 py-2 text-xs text-ink outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                required
              >
                <option value="PRESIDENT">Chapter President</option>
                <option value="SECRETARY">Chapter Secretary</option>
                <option value="TREASURER">Chapter Treasurer</option>
                <option value="COORDINATOR">Chapter Coordinator</option>
                <option value="VICE_PRESIDENT">Vice President</option>
                <option value="JOINT_SECRETARY">Joint Secretary</option>
              </select>
            </div>

            <div>
              <label className="block font-display font-bold uppercase tracking-wider text-ink mb-1 text-[11px]">
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

            <div className="md:col-span-2">
              <label className="block font-display font-bold uppercase tracking-wider text-ink mb-1 text-[11px]">
                Tenure End Date (Optional)
              </label>
              <input
                type="date"
                className="w-full border-2 border-ink bg-white px-3 py-2 text-xs text-ink outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Registering...' : 'Appoint Chapter Officer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Officers List Table */}
      <Card className="border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c]">
        <CardHeader className="p-5 sm:p-6 pb-4 border-b-2 border-ink bg-paper-2/40">
          <CardTitle className="font-display font-extrabold text-xl text-ink uppercase tracking-tight">
            Active Constituency Chapter Leadership ({officers.length})
          </CardTitle>
          <CardDescription className="font-serif text-xs sm:text-sm text-muted">
            All current chapter executives endowed with regional membership review authority.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b-2 border-ink bg-ink text-paper font-display text-[11px] font-extrabold uppercase tracking-wider">
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
                {officers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted font-serif">
                      No chapter leadership appointments found in database.
                    </td>
                  </tr>
                ) : (
                  officers.map((officer) => (
                    <tr key={officer.id} className="hover:bg-yellow/15 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-ink">
                        <div className="font-display font-extrabold text-sm uppercase">
                          {officer.user.profile?.fullName || officer.user.username || 'Unnamed'}
                        </div>
                        <div className="font-serif text-[11px] text-muted">
                          {officer.user.email} • {officer.user.profile?.primaryPhone || 'No Phone'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-display font-bold text-xs uppercase">{officer.chapter.name}</div>
                        <div className="font-mono text-[10px] text-muted">{officer.chapter.code}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="primary" className="mb-0.5">
                          {officer.role.replace(/_/g, ' ')}
                        </Badge>
                        {officer.title && (
                          <div className="font-serif text-[11px] text-muted">{officer.title}</div>
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
                          onClick={() => handleRevoke(officer.chapter.id, officer.id)}
                          className="h-7 px-2.5 text-rose-700 border-rose-700 hover:bg-rose-50"
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
    </div>
  );
}
