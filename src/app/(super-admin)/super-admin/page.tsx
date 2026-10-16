import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentActor } from '@/server/auth/session';
import { SuperAdminService } from '@/features/super-admin/server/super-admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SuperAdminApplicationsQueue } from '@/features/memberships/components/super-admin-applications-queue';
import { SuperAdminAgeExceptionQueue } from '@/features/memberships/components/super-admin-age-exception-queue';
import {
  Users,
  UserCheck,
  Clock,
  Layers,
  Calendar,
  FileText,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Database,
  Lock,
  CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SuperAdminDashboardPage() {
  const actor = await getCurrentActor();
  if (!actor || actor.status !== 'ACTIVE' || !actor.roles.includes('SUPER_ADMIN')) {
    notFound();
  }

  const metrics = await SuperAdminService.getSystemOverviewMetrics(actor);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#035AFC]/10 text-[#035AFC]">
              Global Tenant Administration
            </span>
            <Badge variant="primary">ROOT GOVERNANCE</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
            System Overview & Operational Posture
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time aggregates, maker-checker membership queues, active chapter leadership, and live audit telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="px-3 py-1 text-xs">
            <ShieldCheck className="h-4 w-4 mr-1.5" /> Database Connected
          </Badge>
        </div>
      </div>

      {/* Real Aggregate Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Members */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Total Members</span>
              <Users className="h-4 w-4 text-[#035AFC]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {metrics.totalRegisteredUsers}
              </span>
              <span className="text-xs text-emerald-600 font-semibold">
                {metrics.activeMembers} Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Registered Accounts in PostgreSQL
            </p>
          </CardContent>
        </Card>

        {/* Pending Applications */}
        <Link href="/super-admin/applications">
          <Card className="border-slate-200 dark:border-slate-800 hover:border-[#035AFC] transition-colors cursor-pointer group">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400 group-hover:text-[#035AFC]">
                  Applications
                </span>
                <UserCheck className="h-4 w-4 text-blue-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {metrics.pendingApplicationsCount}
                </span>
                <span className="text-xs text-amber-600 font-semibold">Pending Review</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>{metrics.approvedApplicationsCount} Approved</span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#035AFC]" />
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Age Exceptions */}
        <Link href="/super-admin/age-exceptions">
          <Card className="border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors cursor-pointer group">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400 group-hover:text-amber-500">
                  Age Exceptions
                </span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {metrics.pendingAgeExceptionsCount}
                </span>
                <span className="text-xs text-amber-600 font-semibold">Age 36+ Requests</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>Super Admin Decision</span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Constituency Chapters */}
        <Link href="/super-admin/organizations">
          <Card className="border-slate-200 dark:border-slate-800 hover:border-purple-500 transition-colors cursor-pointer group">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400 group-hover:text-purple-500">
                  Chapters
                </span>
                <Layers className="h-4 w-4 text-purple-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {metrics.activeChaptersCount}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {metrics.activeChapterOfficersCount} Officers
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>Assembly Roster</span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" />
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Active Review Queues */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-[#035AFC]" />
            Membership Approval Queue
          </h2>
          <Link href="/super-admin/applications">
            <Button variant="ghost" size="sm" className="text-xs text-[#035AFC]">
              View Full Queue <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
        <SuperAdminApplicationsQueue />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Age Exception Review Queue
          </h2>
          <Link href="/super-admin/age-exceptions">
            <Button variant="ghost" size="sm" className="text-xs text-amber-600">
              View Full Queue <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
        <SuperAdminAgeExceptionQueue />
      </div>

      {/* Verified Architecture & Database Posture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Database Engine</span>
              <Database className="h-5 w-5 text-[#035AFC]" />
            </div>
            <CardTitle className="text-lg mt-2">PostgreSQL 14+ via Prisma</CardTitle>
            <CardDescription className="text-xs">
              UUID PKs, schema migrations synchronized, ACID transactional boundaries.
            </CardDescription>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-emerald-600 font-semibold">
              <span>Connected & Operational</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Security Architecture</span>
              <Lock className="h-5 w-5 text-amber-500" />
            </div>
            <CardTitle className="text-lg mt-2">Deny-by-Default RBAC</CardTitle>
            <CardDescription className="text-xs">
              Server-side boundary enforcement with chapter-scoped isolation.
            </CardDescription>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-emerald-600 font-semibold">
              <span>Zero Client Trust</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Audit Trail</span>
              <FileText className="h-5 w-5 text-purple-500" />
            </div>
            <CardTitle className="text-lg mt-2">Audit Logging</CardTitle>
            <CardDescription className="text-xs">
              {metrics.totalAuditEventsCount} recorded administrative and security events.
            </CardDescription>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-purple-600 font-semibold">
              <span>Active Logging</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Real Live Audit Log Stream */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Live Administrative Activity Stream
              </CardTitle>
              <CardDescription className="text-xs">
                Real audit records queried from PostgreSQL database table (db.auditEvent).
              </CardDescription>
            </div>
            <Link href="/super-admin/audit-logs">
              <Button variant="outline" size="sm" className="text-xs">
                View All {metrics.totalAuditEventsCount} Logs <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-2">
          {metrics.recentActivity.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No recent audit records available.
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-[#070A10] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#035AFC] dark:text-blue-400">
                        {log.action}
                      </span>
                      <Badge variant="neutral" className="text-[9px]">
                        {log.resource}
                      </Badge>
                      {log.resourceId && (
                        <span className="font-mono text-[10px] text-slate-400">
                          #{log.resourceId.slice(0, 8)}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Actor:{' '}
                      <span className="font-mono text-slate-600 dark:text-slate-300">
                        {log.actorEmail}
                      </span>{' '}
                      • IP: {log.ipAddress}
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 font-mono">
                    {new Date(log.createdAt).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
