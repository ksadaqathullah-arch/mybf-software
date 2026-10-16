import { notFound } from 'next/navigation';
import { getCurrentActor } from '@/server/auth/session';
import { db } from '@/server/db';
import { SuperAdminUnifiedRolesTabs } from '@/features/super-admin/components/super-admin-unified-roles-tabs';
import { Badge } from '@/components/ui/badge';
import { Key } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SuperAdminRolesPage() {
  const actor = await getCurrentActor();
  if (!actor || actor.status !== 'ACTIVE' || !actor.roles.includes('SUPER_ADMIN')) {
    notFound();
  }

  // 1. Fetch system users with assigned roles
  const [rawSystemUsers, availableRoles, rawOfficers, chapters, rawEligibleUsers] = await Promise.all([
    db.user.findMany({
      include: {
        profile: {
          select: { fullName: true, primaryPhone: true },
        },
        roleAssignments: {
          include: {
            role: true,
            chapter: { select: { id: true, code: true, name: true } },
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),

    // 2. Available system roles
    db.role.findMany({
      orderBy: { name: 'asc' },
    }),

    // 3. Chapter leadership appointments
    db.chapterLeadership.findMany({
      include: {
        chapter: {
          select: { id: true, code: true, name: true, slug: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            profile: {
              select: { fullName: true, primaryPhone: true },
            },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    }),

    // 4. All 16 constituency chapters
    db.chapter.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, code: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),

    // 5. Eligible active users for appointments
    db.user.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        email: true,
        username: true,
        profile: {
          select: { fullName: true, primaryPhone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const formattedSystemUsers = rawSystemUsers.map((u) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    status: u.status,
    fullName: u.profile?.fullName || u.username || u.email || 'Unnamed User',
    phone: u.profile?.primaryPhone || u.phone,
    roles: u.roleAssignments.map((ra) => ({
      id: ra.id,
      roleCode: ra.role.code,
      roleName: ra.role.name,
      chapter: ra.chapter,
      createdAt: ra.assignedAt.toISOString(),
    })),
  }));

  const formattedOfficers = rawOfficers.map((o) => ({
    id: o.id,
    role: o.role,
    title: o.title,
    startDate: o.startDate.toISOString(),
    endDate: o.endDate ? o.endDate.toISOString() : null,
    isActive: o.isActive,
    chapter: o.chapter,
    user: {
      id: o.user.id,
      email: o.user.email,
      username: o.user.username,
      profile: o.user.profile
        ? {
            fullName: o.user.profile.fullName,
            primaryPhone: o.user.profile.primaryPhone,
          }
        : null,
    },
  }));

  const formattedEligibleUsers = rawEligibleUsers.map((u) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    fullName: u.profile?.fullName || u.username || u.email || 'Unnamed Member',
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#035AFC]/10 text-[#035AFC]">
              Access Governance
            </span>
            <Badge variant="primary">STRICT DENY-BY-DEFAULT RBAC</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
            Roles, Permissions & Chapter Leadership
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Centrally manage global tenant roles (Super Admin, District Admin) and constituency chapter appointments (President, Secretary, Treasurer).
          </p>
        </div>
      </div>

      <SuperAdminUnifiedRolesTabs
        initialUsers={formattedSystemUsers}
        availableRoles={availableRoles}
        currentAdminId={actor.userId}
        officers={formattedOfficers}
        chapters={chapters}
        eligibleUsers={formattedEligibleUsers}
      />
    </div>
  );
}
