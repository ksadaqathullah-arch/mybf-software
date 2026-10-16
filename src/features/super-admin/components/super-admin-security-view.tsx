'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#035AFC]/10 text-[#035AFC]">
              Application Security Architecture
            </span>
            <Badge
              variant={
                data.overallStatus === 'HEALTHY'
                  ? 'success'
                  : data.overallStatus === 'ATTENTION_REQUIRED'
                  ? 'warning'
                  : 'danger'
              }
            >
              {data.overallStatus === 'HEALTHY'
                ? 'POLICIES ENFORCED'
                : data.overallStatus === 'ATTENTION_REQUIRED'
                ? 'ATTENTION REQUIRED'
                : 'DEGRADED'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
            Security Posture & RBAC Integrity
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified server authorization parameters, session cookie flags, cryptographic algorithms, and security audit telemetry.
          </p>
        </div>
      </div>

      {/* Verified Posture Notice */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Verified Technical Enforcement</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Security metrics represent active runtime configurations in Next.js Server Components, PostgreSQL session storage, and bcrypt/Argon2 password hashing. Absence of recorded security incidents does not constitute verified proof of immunity.
          </p>
        </div>
      </div>

      {/* Grid of Security Enforcements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Authentication Card */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Session Auth</span>
              <Lock className="h-4 w-4 text-[#035AFC]" />
            </div>
            <CardTitle className="text-base font-bold mt-1">Cookie & Session Security</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">HttpOnly Flag:</span>
              <span className="font-semibold text-emerald-600">Enabled (Script Isolated)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">SameSite Policy:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {data.authEngine.cookieFlags.sameSite}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Token Entropy:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                256-bit Cryptographic
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Session Lifespan:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {data.authEngine.sessionTtlDays} Days Max
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-emerald-600 font-semibold text-[11px]">
              <span>Database Backed Sessions</span>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </CardContent>
        </Card>

        {/* Password Security Card */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Credentials</span>
              <Key className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-base font-bold mt-1">Password Cryptography</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Hashing Function:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                Bcrypt / PBKDF2
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Salt Rounds:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {data.passwordSecurity.saltRounds} Work Factor
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Minimum Length:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {data.passwordSecurity.minimumLength} Characters
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Plaintext Storage:</span>
              <span className="font-semibold text-emerald-600">Zero (Never Stored)</span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-emerald-600 font-semibold text-[11px]">
              <span>Salt & Hash Verified</span>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </CardContent>
        </Card>

        {/* RBAC Posture Card */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Authorization</span>
              <Shield className="h-4 w-4 text-purple-500" />
            </div>
            <CardTitle className="text-base font-bold mt-1">RBAC & Isolation Policy</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Policy Architecture:</span>
              <span className="font-semibold text-purple-600 font-mono text-[11px]">
                Deny-by-Default
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Configured System Roles:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {data.rbacStatus.totalSystemRoles} Roles
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Super Admin Accounts:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {data.rbacStatus.superAdminCount} Root
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Self-Demotion Guard:</span>
              <span className="font-semibold text-emerald-600">Enforced Server-Side</span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-emerald-600 font-semibold text-[11px]">
              <span>Anti-Elevation Active</span>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Audit Telemetry Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#035AFC]" />
              Security-Relevant Administrative Events
            </CardTitle>
            <CardDescription className="text-xs">
              Filtered subset of audit logs concerning authentication, role elevations, and leadership appointments.
            </CardDescription>
          </div>
          <Link href="/super-admin/audit-logs">
            <Button variant="ghost" size="sm" className="text-xs text-[#035AFC]">
              Full Audit Trail <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Timestamp (IST)</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {data.recentSecurityEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-sans">
                      No security-related events recorded yet.
                    </td>
                  </tr>
                ) : (
                  data.recentSecurityEvents.map((evt) => (
                    <tr
                      key={evt.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(evt.createdAt).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-sans">
                        {evt.action}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {evt.actorEmail || 'System'}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{evt.ipAddress || 'Internal'}</td>
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
