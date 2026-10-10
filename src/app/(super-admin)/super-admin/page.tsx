import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  Server,
  Database,
  Lock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Terminal,
} from 'lucide-react';

export default function SuperAdminDashboardPage() {
  const auditLogs = [
    {
      id: 'log-1',
      actor: 'president@manjeri.mybf.in',
      action: 'MEMBERSHIP_APPLICATION_APPROVED',
      resource: 'MembershipApplication',
      target: 'MYBF-0000000001 (Anas Mohammed)',
      timestamp: 'Today, 12:45:12 GMT+5:30',
      ip: '103.21.244.12',
    },
    {
      id: 'log-2',
      actor: 'gateway.razorpay.webhook',
      action: 'PAYMENT_SETTLED_WEBHOOK',
      resource: 'PaymentIntent',
      target: 'order_8923baf912 (₹3,000)',
      timestamp: 'Today, 12:44:50 GMT+5:30',
      ip: '52.66.192.4',
    },
    {
      id: 'log-3',
      actor: 'admin@mybf.in',
      action: 'LEADERSHIP_ROLE_ASSIGNED',
      resource: 'ChapterLeadership',
      target: 'CHP-01-MANJERI (Treasurer Appointed)',
      timestamp: 'Today, 10:15:00 GMT+5:30',
      ip: '103.21.244.1',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Super Administration & System Posture
            </h1>
            <Badge variant="primary">ROOT TENANT</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global architecture health, immutable audit log stream, and 5-million capacity readiness
          </p>
        </div>

        <div className="flex gap-2">
          <Badge variant="success" className="px-3 py-1 text-xs">
            <ShieldCheck className="h-4 w-4 mr-1.5" /> All Systems Secure
          </Badge>
        </div>
      </div>

      {/* Architecture Readiness Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Database Engine</span>
              <Database className="h-5 w-5 text-[#035AFC]" />
            </div>
            <CardTitle className="text-lg mt-2">PostgreSQL + Prisma</CardTitle>
            <CardDescription className="text-xs">
              UUID PKs, BigInt sequence allocation, composite indexes for chapter/org scopes.
            </CardDescription>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-emerald-600 font-semibold">
              <span>Schema Validated</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Security Engine</span>
              <Lock className="h-5 w-5 text-[#FBC206]" />
            </div>
            <CardTitle className="text-lg mt-2">Deny-by-Default RBAC</CardTitle>
            <CardDescription className="text-xs">
              Server-side boundary enforcement with chapter and organization data isolation.
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
              <span className="text-xs font-bold uppercase text-slate-400">Member Scalability</span>
              <Activity className="h-5 w-5 text-emerald-500" />
            </div>
            <CardTitle className="text-lg mt-2">5,000,000 Records Target</CardTitle>
            <CardDescription className="text-xs">
              10-digit unencoded numeric format (MYBF-0000000001) with unchangeable transfer persistence.
            </CardDescription>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-emerald-600 font-semibold">
              <span>Capacity Ready</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Immutable Audit Log Stream */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Immutable System Audit Log Stream</CardTitle>
              <CardDescription className="text-xs">
                Audited financial settlements, maker-checker membership decisions, and role delegations.
              </CardDescription>
            </div>
            <Badge variant="neutral">APPEND-ONLY AUDIT</Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-2">
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-[#070A10] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#035AFC] dark:text-blue-400">
                      {log.action}
                    </span>
                    <Badge variant="neutral" className="text-[9px]">{log.resource}</Badge>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 font-medium">
                    {log.target}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Actor: <span className="font-mono text-slate-500">{log.actor}</span> • IP: {log.ip}
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 font-mono">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
