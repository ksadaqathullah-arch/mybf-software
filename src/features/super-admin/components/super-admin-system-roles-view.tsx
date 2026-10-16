'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Key, Plus, Search, RefreshCw, CheckCircle2 } from 'lucide-react';

interface RoleAssignment {
  id: string;
  roleCode: string;
  roleName: string;
  chapter: { id: string; code: string; name: string } | null;
  createdAt: string;
}

interface UserItem {
  id: string;
  email: string | null;
  username: string | null;
  status: string;
  fullName: string;
  phone: string | null;
  roles: RoleAssignment[];
}

interface SystemRole {
  id: string;
  code: string;
  name: string;
  description: string | null;
  hierarchyLevel: number;
}

interface SuperAdminSystemRolesViewProps {
  initialUsers: UserItem[];
  availableRoles: SystemRole[];
  currentAdminId: string;
}

export function SuperAdminSystemRolesView({
  initialUsers,
  availableRoles,
  currentAdminId,
}: SuperAdminSystemRolesViewProps) {
  const [users, setUsers] = React.useState<UserItem[]>(initialUsers);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAssigning, setIsAssigning] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState('');
  const [selectedRoleCode, setSelectedRoleCode] = React.useState('DISTRICT_ADMIN');
  const [submitting, setSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/v1/super-admin/roles');
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users);
      }
    } catch {
      // ignore
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedRoleCode) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/v1/super-admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUserId,
          roleCode: selectedRoleCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to assign role.');
      }

      setFeedback({ type: 'success', message: data.message || 'Role successfully assigned.' });
      setIsAssigning(false);
      await refreshUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error assigning role.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeRole = async (targetUserId: string, roleCode: string) => {
    if (targetUserId === currentAdminId && roleCode === 'SUPER_ADMIN') {
      alert('Protection Error: You cannot revoke your own Super Admin access.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to revoke the role '${roleCode}' from this user? This takes effect immediately.`
    );
    if (!confirmed) return;

    setFeedback(null);
    try {
      const res = await fetch(
        `/api/v1/super-admin/roles?targetUserId=${encodeURIComponent(targetUserId)}&roleCode=${encodeURIComponent(roleCode)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to revoke role.');
      }

      setFeedback({ type: 'success', message: data.message || 'Role revoked successfully.' });
      await refreshUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error revoking role.' });
    }
  };

  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      const query = searchTerm.toLowerCase();
      const matchName = u.fullName.toLowerCase().includes(query);
      const matchEmail = (u.email || '').toLowerCase().includes(query);
      const matchRole = u.roles.some((r) => r.roleCode.toLowerCase().includes(query));
      return matchName || matchEmail || matchRole;
    });
  }, [users, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#035AFC]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshUsers}
            className="h-8 text-xs text-slate-600 dark:text-slate-300"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAssigning(!isAssigning)}
            className="h-8 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Assign Role
          </Button>
        </div>
      </div>

      {/* Assign Role Drawer / Card */}
      {isAssigning && (
        <Card className="border-[#035AFC]/30 bg-blue-50/20 dark:bg-blue-950/10 animate-fade-in">
          <CardHeader className="p-4 border-b border-blue-100 dark:border-blue-900/30">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-[#035AFC]" /> Assign System RBAC Role
            </CardTitle>
            <CardDescription className="text-xs">
              Direct server authorization assignment. Self-elevation and self-demotion protections are enforced.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleAssignRole} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#035AFC]"
                >
                  <option value="">Select candidate user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.email || u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  System Role
                </label>
                <select
                  value={selectedRoleCode}
                  onChange={(e) => setSelectedRoleCode(e.target.value)}
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#035AFC]"
                >
                  {availableRoles.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting || !selectedUserId}
                  className="h-9 flex-1 text-xs"
                >
                  {submitting ? 'Applying...' : 'Confirm Assignment'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAssigning(false)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users & Roles Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Assigned System Roles</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      No users match the search term.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                            {(user.fullName[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-white">
                              {user.fullName}
                              {user.id === currentAdminId && (
                                <span className="ml-2 text-[10px] text-[#035AFC] font-semibold bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </p>
                            <span className="text-[11px] text-slate-400">
                              {user.email || user.username || 'No email attached'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={user.status === 'ACTIVE' ? 'success' : 'secondary'}
                          className="text-[10px]"
                        >
                          {user.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {user.roles.length === 0 ? (
                            <span className="text-[11px] text-slate-400 italic">No roles assigned</span>
                          ) : (
                            user.roles.map((ra) => {
                              const isRoot = ra.roleCode === 'SUPER_ADMIN';
                              const isDistrict = ra.roleCode.includes('DISTRICT');
                              const isChapter = ra.roleCode.startsWith('CHAPTER_');

                              return (
                                <span
                                  key={ra.id}
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                    isRoot
                                      ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                                      : isDistrict
                                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                      : isChapter
                                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  <span>{ra.roleCode}</span>
                                  {user.id === currentAdminId && isRoot ? null : (
                                    <button
                                      type="button"
                                      onClick={() => handleRevokeRole(user.id, ra.roleCode)}
                                      className="text-slate-400 hover:text-red-500 transition-colors"
                                      title={`Revoke ${ra.roleCode}`}
                                    >
                                      ✕
                                    </button>
                                  )}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setIsAssigning(true);
                          }}
                          className="h-7 px-2.5 text-[11px] text-[#035AFC] hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        >
                          + Assign
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
