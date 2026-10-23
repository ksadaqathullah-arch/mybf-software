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

    if (!confirm(`Are you sure you want to revoke ${roleCode} from this user?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/super-admin/roles?targetUserId=${targetUserId}&roleCode=${roleCode}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to revoke role.');
      }
      setFeedback({ type: 'success', message: `Revoked ${roleCode} successfully.` });
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
          className={`p-4 border-2 flex items-center justify-between text-xs font-bold shadow-[2px_2px_0px_#14161c] animate-fade-in ${
            feedback.type === 'success'
              ? 'border-emerald-800 bg-emerald-50 text-emerald-950'
              : 'border-rose-800 bg-rose-50 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-ink hover:opacity-75 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border-2 border-ink bg-white text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-yellow font-sans shadow-[2px_2px_0px_#14161c]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshUsers}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAssigning(!isAssigning)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Assign Role
          </Button>
        </div>
      </div>

      {/* Assign Role Drawer / Card */}
      {isAssigning && (
        <Card className="border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c] animate-fade-in">
          <CardHeader className="p-4 border-b-2 border-ink bg-paper-2/50">
            <CardTitle className="font-display font-extrabold text-base text-ink uppercase tracking-tight flex items-center gap-2">
              <Key className="h-4 w-4 text-blue" /> Assign System RBAC Role
            </CardTitle>
            <CardDescription className="font-serif text-xs text-muted">
              Direct server authorization assignment. Self-elevation and self-demotion protections are enforced.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleAssignRole} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-ink mb-1">
                  Target User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="w-full text-xs border-2 border-ink bg-white p-2 text-ink focus:ring-2 focus:ring-yellow outline-none font-sans shadow-[2px_2px_0px_#14161c]"
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
                <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-ink mb-1">
                  System Role
                </label>
                <select
                  value={selectedRoleCode}
                  onChange={(e) => setSelectedRoleCode(e.target.value)}
                  required
                  className="w-full text-xs border-2 border-ink bg-white p-2 text-ink focus:ring-2 focus:ring-yellow outline-none font-sans shadow-[2px_2px_0px_#14161c]"
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
                  className="flex-1"
                >
                  {submitting ? 'Applying...' : 'Confirm Assignment'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAssigning(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users & Roles Table */}
      <Card className="border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b-2 border-ink bg-ink text-paper font-display text-[11px] font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-paper">User Details</th>
                  <th className="py-3 px-4 text-paper">Account Status</th>
                  <th className="py-3 px-4 text-paper">Assigned System Roles</th>
                  <th className="py-3 px-4 text-paper text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/15 font-sans">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted font-serif">
                      No users match the search term.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-yellow/15 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-ink">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-paper-2 border-2 border-ink text-ink flex items-center justify-center font-display font-black text-xs shadow-[1px_1px_0px_#14161c]">
                            {(user.fullName[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-display font-extrabold text-sm text-ink uppercase">
                              {user.fullName}
                              {user.id === currentAdminId && (
                                <span className="ml-2 font-mono text-[10px] text-paper font-black bg-blue border border-ink px-1.5 py-0.2">
                                  You
                                </span>
                              )}
                            </p>
                            <span className="font-serif text-[11px] text-muted">
                              {user.email || user.username || 'No email attached'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={user.status === 'ACTIVE' ? 'success' : 'secondary'}
                        >
                          {user.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {user.roles.length === 0 ? (
                            <span className="text-[11px] text-muted font-serif italic">No roles assigned</span>
                          ) : (
                            user.roles.map((ra) => {
                              const isRoot = ra.roleCode === 'SUPER_ADMIN';
                              const isDistrict = ra.roleCode.includes('DISTRICT');

                              return (
                                <span
                                  key={ra.id}
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 border border-ink font-mono text-[11px] font-bold shadow-[1px_1px_0px_#14161c] ${
                                    isRoot
                                      ? 'bg-rose-100 text-rose-950 border-rose-800'
                                      : isDistrict
                                      ? 'bg-blue text-paper border-ink'
                                      : 'bg-yellow text-ink border-ink'
                                  }`}
                                >
                                  <span>{ra.roleCode}</span>
                                  {user.id === currentAdminId && isRoot ? null : (
                                    <button
                                      type="button"
                                      onClick={() => handleRevokeRole(user.id, ra.roleCode)}
                                      className="text-ink hover:text-rose-600 transition-colors cursor-pointer"
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
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setIsAssigning(true);
                          }}
                          className="h-7 px-2.5 text-[10px]"
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
