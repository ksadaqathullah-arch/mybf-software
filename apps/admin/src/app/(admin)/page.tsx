import * as React from 'react';
import Link from 'next/link';
import { getCurrentAdmin } from '@/server/auth';
import { SuperAdminService } from '@shared/features/super-admin/server/super-admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageHeader, PortalStatCard } from '@/components/ui/portal-elements';
import { SuperAdminApplicationsQueue } from '@/components/views/super-admin-applications-queue';
import { SuperAdminAgeExceptionQueue } from '@/components/views/super-admin-age-exception-queue';
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

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;

  const actor = {
    userId: admin.id,
    email: admin.email,
    phone: admin.phone,
    status: 'ACTIVE' as const,
    roles: admin.roles as any,
  };

  const metrics = await SuperAdminService.getSystemOverviewMetrics(actor);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <PortalPageHeader
        badge="CENTRAL CLOUD ADMINISTRATION"
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
        <PortalStatCard
          label="Pending Applications"
          value={metrics.pendingApplicationsCount}
          subValue="Awaiting Super Admin Approval"
          detail="Maker-Checker Review Pipeline"
          icon={UserCheck}
        />
        <PortalStatCard
          label="Pending Age Exceptions"
          value={metrics.pendingAgeExceptionsCount}
          subValue="Rule: 35 Years or Below"
          detail="Requires Secretariat Exception Approval"
          icon={Clock}
        />
        <PortalStatCard
          label="Active Chapters"
          value={metrics.activeChaptersCount}
          subValue="16 Formed Chapters"
          detail="Malappuram District Footprint"
          icon={Layers}
        />
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/applications" className="group block">
          <Card className="hover:border-blue transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="primary">Primary Gate</Badge>
                <ArrowRight className="h-4 w-4 text-ink group-hover:translate-x-1 transition-transform" />
              </div>
              <CardTitle className="text-base font-extrabold mt-3">Membership Applications</CardTitle>
              <CardDescription className="text-xs">
                Review and approve or reject applicant identities, chapter assignments, and qualifications.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/age-exceptions" className="group block">
          <Card className="hover:border-blue transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Policy Gate</Badge>
                <ArrowRight className="h-4 w-4 text-ink group-hover:translate-x-1 transition-transform" />
              </div>
              <CardTitle className="text-base font-extrabold mt-3">Age Exception Reviews</CardTitle>
              <CardDescription className="text-xs">
                Evaluate justification filings for applicants above 35 years seeking formal exception.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/organizations" className="group block">
          <Card className="hover:border-blue transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="neutral">Enterprise Hierarchy</Badge>
                <ArrowRight className="h-4 w-4 text-ink group-hover:translate-x-1 transition-transform" />
              </div>
              <CardTitle className="text-base font-extrabold mt-3">Organizations & Districts</CardTitle>
              <CardDescription className="text-xs">
                Inspect organizational tenants, district boundaries, and active constituent chapter registries.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Pending Queues */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-ink pb-3">
          <div>
            <h3 className="text-xl font-extrabold text-ink font-display">
              Membership Approval Worklist
            </h3>
            <p className="text-xs font-serif text-muted">
              Live submission pipeline requiring Super Administrator authorization.
            </p>
          </div>
          <Link href="/applications">
            <Button variant="outline" size="sm">
              View Full Worklist ({metrics.pendingApplicationsCount})
            </Button>
          </Link>
        </div>

        <SuperAdminApplicationsQueue />
      </div>

      {metrics.pendingAgeExceptionsCount > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-ink pb-3">
            <div>
              <h3 className="text-xl font-extrabold text-ink font-display">
                Age Exception Worklist
              </h3>
              <p className="text-xs font-serif text-muted">
                Official policy requires applicants aged above 35 to obtain Super Admin waiver.
              </p>
            </div>
            <Link href="/age-exceptions">
              <Button variant="outline" size="sm">
                View All Exceptions ({metrics.pendingAgeExceptionsCount})
              </Button>
            </Link>
          </div>

          <SuperAdminAgeExceptionQueue />
        </div>
      )}

      {/* Security & System Posture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue" />
              <CardTitle className="text-sm font-extrabold">Data Storage Tier</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-ink/10 pb-1.5">
              <span className="font-serif text-muted">Engine:</span>
              <strong className="text-ink">PostgreSQL (Neon Managed)</strong>
            </div>
            <div className="flex justify-between border-b border-ink/10 pb-1.5">
              <span className="font-serif text-muted">Active Users:</span>
              <span className="font-mono text-ink font-bold">{metrics.totalRegisteredUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-serif text-muted">Target Capacity:</span>
              <span className="font-mono text-blue font-bold">5,000,000+ Records</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue" />
              <CardTitle className="text-sm font-extrabold">Authorization Enforcement</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-ink/10 pb-1.5">
              <span className="font-serif text-muted">Security Policy:</span>
              <strong className="text-ink">Server-Side Deny-By-Default</strong>
            </div>
            <div className="flex justify-between border-b border-ink/10 pb-1.5">
              <span className="font-serif text-muted">Chapter Officers:</span>
              <span className="font-mono text-ink font-bold">{metrics.activeChapterOfficersCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-serif text-muted">Maker-Checker:</span>
              <span className="font-bold text-emerald-800">Enforced by Super Admin</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <CardTitle className="text-sm font-extrabold">Audit Telemetry</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-ink/10 pb-1.5">
              <span className="font-serif text-muted">Recorded Events:</span>
              <span className="font-mono text-ink font-bold">{metrics.totalAuditEventsCount} Entries</span>
            </div>
            <div className="flex justify-between border-b border-ink/10 pb-1.5">
              <span className="font-serif text-muted">Integrity Model:</span>
              <strong className="text-ink">Append-Only Immutability</strong>
            </div>
            <div className="pt-1">
              <Link href="/audit-logs">
                <Button variant="outline" size="sm" className="w-full text-[11px] h-8">
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Audit Trail
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
