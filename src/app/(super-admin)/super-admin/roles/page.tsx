import { notFound } from 'next/navigation';
import { getCurrentActor } from '@/server/auth/session';
import { db } from '@/server/db';
import { SuperAdminOfficersView } from '@/features/chapters/components/super-admin-officers-view';
import { ShieldCheck, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function SuperAdminRolesPage() {
  const actor = await getCurrentActor();
  if (!actor || !actor.roles.includes('SUPER_ADMIN')) {
    notFound();
  }

  // Fetch active and historical officers
  const rawOfficers = await db.chapterLeadership.findMany({
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
  });

  const officers = rawOfficers.map((o) => ({
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

  // Fetch all 16 constituency chapters
  const chapters = await db.chapter.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, code: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  });

  // Fetch active users eligible for appointment
  const rawUsers = await db.user.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      email: true,
      username: true,
      profile: {
        select: { fullName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const users = rawUsers.map((u) => ({
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
              RBAC Governance
            </span>
            <span className="text-xs text-slate-500 font-medium">Chapter Leadership Appointments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Chapter Executive Roles & Officer Assignments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Appoint, audit, and revoke Chapter Presidents, Secretaries, and Treasurers across all 16 Malappuram chapters.
          </p>
        </div>
      </div>

      <SuperAdminOfficersView
        initialOfficers={officers}
        chapters={chapters}
        users={users}
      />
    </div>
  );
}
