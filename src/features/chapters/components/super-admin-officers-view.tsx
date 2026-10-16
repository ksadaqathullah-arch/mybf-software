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
          className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
            notice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
          }`}
        >
          {notice.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {notice.message}
        </div>
      )}

      {/* Appointment Form */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#035AFC]" /> Appoint Chapter Executive Officer
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Grant chapter administrative authority to an active MYBF member with an immutable audit record.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleAppoint} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Member / Candidate *
              </label>
              <select
                className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs text-slate-900 dark:text-white"
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
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Constituency Chapter *
              </label>
              <select
                className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs text-slate-900 dark:text-white"
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
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Executive Role *
              </label>
              <select
                className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs text-slate-900 dark:text-white"
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
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Custom Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Executive Committee Head"
                className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs text-slate-900 dark:text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tenure End Date (Optional)
              </label>
              <input
                type="date"
                className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs text-slate-900 dark:text-white"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <Button type="submit" disabled={isSubmitting} className="w-full h-9 text-xs">
                {isSubmitting ? 'Appointing...' : 'Authorize & Appoint Officer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Active Officers Directory */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Active Chapter Executive Officers</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Legitimate appointed leadership across all 16 Malappuram chapters.
            </CardDescription>
          </div>
          <Badge variant="primary">{officers.length} APPOINTED</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {officers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No chapter executive leadership appointments recorded in the database yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-6">Officer Name</th>
                    <th className="p-3.5">Assigned Chapter</th>
                    <th className="p-3.5">Executive Role</th>
                    <th className="p-3.5">Tenure Start</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {officers.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 pl-6">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {o.user.profile?.fullName || o.user.username || 'Officer'}
                        </div>
                        <div className="text-[11px] text-slate-500">{o.user.email}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-slate-900 dark:text-white">{o.chapter.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{o.chapter.code}</div>
                      </td>
                      <td className="p-3.5">
                        <Badge variant="primary" className="text-[10px]">
                          {o.role.replace(/_/g, ' ')}
                        </Badge>
                        {o.title && <span className="text-[11px] text-slate-500 block mt-0.5">{o.title}</span>}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {new Date(o.startDate).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <Badge variant={o.isActive ? 'success' : 'neutral'} className="text-[10px]">
                          {o.isActive ? 'ACTIVE' : 'EXPIRED'}
                        </Badge>
                      </td>
                      <td className="p-3.5 pr-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevoke(o.chapter.id, o.id)}
                          className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
