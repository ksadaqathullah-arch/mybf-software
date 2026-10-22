import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentActor } from '@/server/auth/session';
import { SuperAdminService } from '@/features/super-admin/server/super-admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageHeader, PortalStatCard } from '@/components/ui/portal-elements';
import { SuperAdminApplicationsQueue } from '@/features/memberships/components/super-admin-applications-queue';
import { SuperAdminAgeExceptionQueue } from '@/features/memberships/components/super-admin-age-exception-queue';
import {
  Users,
  UserCheck,
  Clock,
  Layers,
  ShieldCheck,
  ArrowRight,
  Database,
  Lock,
  CheckCircle2,
  FileText,
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
      <PortalPageHeader
        badge="GLOBAL TENANT ADMINISTRATION"
        tag="ROOT GOVERNANCE"
        title="System Overview & Operational Posture"
        description="Real-time aggregates, maker-checker membership queues, active chapter leadership, and live audit telemetry across all 16 chapters."
        actions={
          <Badge variant="success" className="px-3 py-1.5 text-xs">
            <ShieldCheck className="h-4 w-4 mr-1.5 text-emerald-800" />
            <span>PostgreSQL Operational</span>
          </Badge>
        }
      />

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <PortalStatCard
          label="Total Members"
          value={metrics.totalRegisteredUsers}
          subValue={`${metrics.activeMembers} Active`}
          detail="Registered Accounts in PostgreSQL"
          icon={Users}
        />

        <Link href="/super-admin/applications" className="group block">
          <PortalStatCard
            label="Pending Applications"
            value={metrics.pendingApplicationsCount}
            subValue={`${metrics.approvedApplicationsCount} Approved`}
            detail="Maker-Checker Review Queue"
            icon={UserCheck}
            className="hover:border-blue group-hover:shadow-[6px_6px_0px_#14161c]"
          />
        </Link>

        <Link href="/super-admin/age-exceptions" className="group block">
          <PortalStatCard
            label="Age Exceptions (36+)"
            value={metrics.pendingAgeExceptionsCount}
            subValue="Decisions Pending"
            detail="Super Admin Exception Review"
            icon={Clock}
            className="hover:border-yellow group-hover:shadow-[6px_6px_0px_#14161c]"
          />
        </Link>

        <Link href="/super-admin/organizations" className="group block">
          <PortalStatCard
            label="Constituency Chapters"
            value={metrics.activeChaptersCount}
            subValue={`${metrics.activeChapterOfficersCount} Officers`}
            detail="Malappuram District Assembly Roster"
            icon={Layers}
            className="hover:border-ink group-hover:shadow-[6px_6px_0px_#14161c]"
          />
        </Link>
      </div>

      {/* Active Review Queues */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-ink pb-2">
          <h2 className="font-display font-extrabold text-xl text-ink uppercase tracking-tight flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue" />
            Membership Approval Queue
          </h2>
          <Link href="/super-admin/applications">
            <Button variant="ghost" size="sm" className="text-xs">
              View Full Queue <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
        <SuperAdminApplicationsQueue />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-ink pb-2">
          <h2 className="font-display font-extrabold text-xl text-ink uppercase tracking-tight flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow" />
            Age Exception Review Queue
          </h2>
          <Link href="/super-admin/age-exceptions">
            <Button variant="ghost" size="sm" className="text-xs">
              View Full Queue <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
        <SuperAdminAgeExceptionQueue />
      </div>

      {/* Architecture & Infrastructure Posture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c]">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-muted">
                Database Engine
              </span>
              <Database className="h-5 w-5 text-blue" />
            </div>
            <CardTitle className="font-display text-lg font-extrabold text-ink mt-2 uppercase">
              PostgreSQL 14+ via Prisma
            </CardTitle>
            <CardDescription className="font-serif text-xs text-muted">
              UUID PKs, schema migrations synchronized, ACID transactional boundaries.
            </CardDescription>
            <div className="mt-4 pt-3 border-t-2 border-ink/15 flex items-center justify-between text-xs font-display font-bold text-emerald-800 uppercase tracking-wider">
              <span>Connected & Operational</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c]">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-muted">
                Security Architecture
              </span>
              <Lock className="h-5 w-5 text-yellow" />
            </div>
            <CardTitle className="font-display text-lg font-extrabold text-ink mt-2 uppercase">
              Deny-by-Default RBAC
            </CardTitle>
            <CardDescription className="font-serif text-xs text-muted">
              Server-side boundary enforcement with chapter-scoped isolation.
            </CardDescription>
            <div className="mt-4 pt-3 border-t-2 border-ink/15 flex items-center justify-between text-xs font-display font-bold text-emerald-800 uppercase tracking-wider">
              <span>Zero Client Trust</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c]">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-muted">
                Audit Trail
              </span>
              <FileText className="h-5 w-5 text-ink" />
            </div>
            <CardTitle className="font-display text-lg font-extrabold text-ink mt-2 uppercase">
              Audit Logging
            </CardTitle>
            <CardDescription className="font-serif text-xs text-muted">
              {metrics.totalAuditEventsCount} recorded administrative and security events.
            </CardDescription>
            <div className="mt-4 pt-3 border-t-2 border-ink/15 flex items-center justify-between text-xs font-display font-bold text-blue uppercase tracking-wider">
              <span>Active Logging</span>
              <CheckCircle2 className="h-4 w-4 text-blue" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Real Live Audit Log Stream */}
      <Card className="border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c]">
        <CardHeader className="p-6 pb-4 border-b-2 border-ink bg-paper-2/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="font-display font-extrabold text-lg text-ink uppercase tracking-tight">
                Live Administrative Activity Stream
              </CardTitle>
              <CardDescription className="font-serif text-xs text-muted">
                Real audit records queried from PostgreSQL database table (db.auditEvent).
              </CardDescription>
            </div>
            <Link href="/super-admin/audit-logs">
              <Button variant="outline" size="sm">
                View All {metrics.totalAuditEventsCount} Logs <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {metrics.recentActivity.length === 0 ? (
            <div className="py-8 text-center text-muted text-xs font-display font-bold uppercase tracking-wider">
              No recent audit records available.
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="border-2 border-ink/20 bg-paper-2/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-ink hover:bg-yellow/15 transition-all shadow-[2px_2px_0px_#14161c]"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-blue">
                        {log.action}
                      </span>
                      <Badge variant="neutral" className="text-[9px]">
                        {log.resource}
                      </Badge>
                      {log.resourceId && (
                        <span className="font-mono text-[10px] text-muted font-bold">
                          #{log.resourceId.slice(0, 8)}
                        </span>
                      )}
                    </div>
                    <div className="text-muted text-[11px] font-sans">
                      Actor:{' '}
                      <span className="font-mono font-bold text-ink">
                        {log.actorEmail}
                      </span>{' '}
                      • IP: {log.ipAddress}
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-ink font-mono font-bold">
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
