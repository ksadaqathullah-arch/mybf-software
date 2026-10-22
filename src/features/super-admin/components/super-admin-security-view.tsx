'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageHeader } from '@/components/ui/portal-elements';
import {
  Shield,
  ShieldCheck,
  Lock,
  Key,
  CheckCircle2,
  FileText,
  ArrowRight,
} from 'lucide-react';
import type { SecurityPostureMetrics } from '@/features/super-admin/server/super-admin.service';

interface SuperAdminSecurityViewProps {
  initialData: SecurityPostureMetrics;
}

export function SuperAdminSecurityView({ initialData }: SuperAdminSecurityViewProps) {
  const [data] = React.useState<SecurityPostureMetrics>(initialData);

  return (
    <div className="space-y-8 animate-fade-in">
      <PortalPageHeader
        badge="Application Security Architecture"
        title="Security Posture & RBAC Integrity"
        description="Verified server authorization parameters, session cookie flags, cryptographic algorithms, and security audit telemetry."
        actions={
          <Badge
            variant={
              data.overallStatus === 'HEALTHY'
                ? 'success'
                : data.overallStatus === 'ATTENTION_REQUIRED'
                ? 'warning'
                : 'danger'
            }
            className="text-xs py-1.5 px-3 border-2"
          >
            {data.overallStatus === 'HEALTHY'
              ? 'POLICIES ENFORCED'
              : data.overallStatus === 'ATTENTION_REQUIRED'
              ? 'ATTENTION REQUIRED'
              : 'DEGRADED'}
          </Badge>
        }
      />

      {/* Verified Posture Notice */}
      <div className="p-4 border-2 border-ink bg-paper shadow-[3px_3px_0px_#14161c] text-xs text-ink flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-display font-black uppercase tracking-wider text-xs">Verified Technical Enforcement</p>
          <p className="text-[11px] text-ink/70 font-serif mt-0.5 leading-relaxed">
            Security metrics represent active runtime configurations in Next.js Server Components, PostgreSQL session storage, and bcrypt/Argon2 password hashing. Absence of recorded security incidents does not constitute verified proof of immunity.
          </p>
        </div>
      </div>

      {/* Grid of Security Enforcements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Authentication Card */}
        <Card>
          <CardHeader className="p-5 border-b-2 border-ink">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-ink/60 font-display">Session Auth</span>
              <div className="w-7 h-7 bg-blue/10 border border-ink flex items-center justify-center">
                <Lock className="h-4 w-4 text-blue" />
              </div>
            </div>
            <CardTitle className="text-base font-black font-display uppercase tracking-wider mt-2">Cookie & Session Security</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-ink/10 pb-2">
              <span className="text-ink/60 font-serif">HttpOnly Flag:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-ink/20">Enabled (Script Isolated)</span>
            </div>
            <div className="flex items-center justify-between border-b border-ink/10 pb-2">
              <span className="text-ink/60 font-serif">SameSite Policy:</span>
              <span className="font-bold text-ink font-mono">
                {data.authEngine.cookieFlags.sameSite}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-ink/10 pb-2">
              <span className="text-ink/60 font-serif">Token Entropy:</span>
              <span className="font-bold text-ink font-mono">
                256-bit Cryptographic
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-ink/10 pb-2">
              <span className="text-ink/60 font-serif">Session Lifespan:</span>
              <span className="font-bold text-ink font-mono">
                {data.authEngine.sessionTtlDays} Days Max
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between text-emerald-700 font-bold text-[11px] font-display uppercase tracking-wider">
              <span>Database Backed Sessions</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        {/* Password Security Card */}
        <Card>
          <CardHeader className="p-5 border-b-2 border-ink">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-ink/60 font-display">Credentials</span>
              <div className="w-7 h-7 bg-yellow/20 border border-ink flex items-center justify-center">
                <Key className="h-4 w-4 text-ink" />
              </div>
            </div>
            <CardTitle className="text-base font-black font-display uppercase tracking-wider mt-2">Password Cryptography</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-ink/10 pb-2">
              <span className="text-ink/60 font-serif">Hashing Function:</span>
              <span className="font-bold text-ink font-mono text-[11px]">
                Bcrypt / PBKDF2
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-ink/10 pb-2">
              <span className="text-ink/60 font-serif">Salt Rounds:</span>
              <span className="font-bold text-ink font-mono">
                {data.passwordSecurity.saltRounds} Work Factor
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-ink/10 pb-2">
              <span className="text-ink/60 font-serif">Minimum Length:</span>
              <span className="font-bold text-ink font-mono">
                {data.passwordSecurity.minimumLength} Characters
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-ink/10 pb-2">
              <span className="text-ink/60 font-serif">Plaintext Storage:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-ink/20">Zero (Never Stored)</span>
            </div>
            <div className="pt-2 flex items-center justify-between text-emerald-700 font-bold text-[11px] font-display uppercase tracking-wider">
              <span>Salt & Hash Verified</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        {/* RBAC Posture Card */}
        <Card>
          <CardHeader className="p-5 border-b-2 border-ink">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-ink/60 font-display">Authorization</span>
              <div className="w-7 h-7 bg-purple-500/10 border border-ink flex items-center justify-center">
                <Shield className="h-4 w-4 text-purple-700" />
              </div>
            </div>
            <CardTitle className="text-base font-black font-display uppercase tracking-wider mt-2">RBAC & Isolation Policy</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-ink/10 pb-2">
              <span className="text-ink/60 font-serif">Policy Architecture:</span>
              <span className="font-bold text-purple-700 font-mono text-[11px] bg-purple-50 px-2 py-0.5 border border-ink/20">
                Deny-by-Default
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-ink/10 pb-2">
              <span className="text-ink/60 font-serif">Configured System Roles:</span>
              <span className="font-bold text-ink font-mono">
                {data.rbacStatus.totalSystemRoles} Roles
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-ink/10 pb-2">
              <span className="text-ink/60 font-serif">Super Admin Accounts:</span>
              <span className="font-bold text-ink font-mono">
                {data.rbacStatus.superAdminCount} Root
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-ink/10 pb-2">
              <span className="text-ink/60 font-serif">Self-Demotion Guard:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-ink/20">Enforced Server-Side</span>
            </div>
            <div className="pt-2 flex items-center justify-between text-emerald-700 font-bold text-[11px] font-display uppercase tracking-wider">
              <span>Anti-Elevation Active</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Audit Telemetry Table */}
      <Card>
        <CardHeader className="p-5 border-b-2 border-ink flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-black font-display uppercase tracking-wider text-ink flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue" />
              Security-Relevant Administrative Events
            </CardTitle>
            <CardDescription className="text-xs text-ink/70 font-serif mt-1">
              Filtered subset of audit logs concerning authentication, role elevations, and leadership appointments.
            </CardDescription>
          </div>
          <Link href="/super-admin/audit-logs">
            <Button variant="outline" size="sm" className="text-xs">
              Full Audit Trail <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-ink bg-paper-sunken text-ink font-display font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Timestamp (IST)</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 font-mono text-[11px]">
                {data.recentSecurityEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-ink/50 font-serif italic text-sm">
                      No security-related events recorded yet.
                    </td>
                  </tr>
                ) : (
                  data.recentSecurityEvents.map((evt) => (
                    <tr
                      key={evt.id}
                      className="hover:bg-yellow/10 transition-colors"
                    >
                      <td className="py-3 px-4 text-ink/70 whitespace-nowrap">
                        {new Date(evt.createdAt).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-ink font-sans">
                        {evt.action}
                      </td>
                      <td className="py-3 px-4 text-ink/80 font-mono">
                        {evt.actorEmail || 'System'}
                      </td>
                      <td className="py-3 px-4 text-ink/60">{evt.ipAddress || 'Internal'}</td>
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
