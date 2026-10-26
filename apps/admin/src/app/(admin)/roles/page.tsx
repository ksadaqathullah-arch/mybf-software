import { getCurrentAdmin } from '@/server/auth';
import { db } from '@/server/db';
import { SuperAdminUnifiedRolesTabs } from '@/components/views/super-admin-unified-roles-tabs';
import { PortalPageHeader } from '@/components/ui/portal-elements';

export const dynamic = 'force-dynamic';

export default async function AdminRolesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;

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
      <PortalPageHeader
        badge="Access Governance"
        tag="Strict Deny-by-Default RBAC"
        title="Roles, Permissions & Chapter Leadership"
        description="Centrally manage global tenant roles (Super Admin, District Admin) and constituency chapter appointments (President, Secretary, Treasurer)."
      />

      <SuperAdminUnifiedRolesTabs
        initialUsers={formattedSystemUsers}
        availableRoles={availableRoles}
        currentAdminId={admin.id}
        officers={formattedOfficers}
        chapters={chapters}
        eligibleUsers={formattedEligibleUsers}
      />
    </div>
  );
}
