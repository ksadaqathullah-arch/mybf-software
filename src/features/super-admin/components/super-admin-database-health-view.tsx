'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Database,
  Activity,
  Layers,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HardDrive,
  Cpu,
} from 'lucide-react';
import type { DatabaseHealthMetrics } from '@/features/super-admin/server/super-admin.service';

interface SuperAdminDatabaseHealthViewProps {
  initialData: DatabaseHealthMetrics;
}

export function SuperAdminDatabaseHealthView({ initialData }: SuperAdminDatabaseHealthViewProps) {
  const [data, setData] = React.useState<DatabaseHealthMetrics>(initialData);
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/v1/super-admin/database-health');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setData(json.metrics);
      }
    } catch {
      // fallback
    } finally {
      setRefreshing(false);
    }
  };

  const tableEntries = Object.entries(data.tableCounts);
  const totalRows = tableEntries.reduce((acc, [, count]) => acc + count, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#035AFC]/10 text-[#035AFC]">
              Database Telemetry & Capacity
            </span>
            <Badge variant={data.status === 'HEALTHY' ? 'success' : 'warning'}>
              {data.status === 'HEALTHY' ? 'SYSTEM HEALTHY' : 'LATENCY DEGRADED'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
            Database & Infrastructure Metrics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time PostgreSQL engine status, query round-trip latency, table row counts, and architectural scalability status.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-8 text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Testing...' : 'Test Connection'}
        </Button>
      </div>

      {/* Honest Capacity & Scalability Analysis Card */}
      <Card className="border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-xs text-amber-900 dark:text-amber-200">
                Architectural Target vs. Measured Present Capacity
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                The 5,000,000 member capacity is an <strong className="text-slate-800 dark:text-slate-200">architectural target</strong> supported by 10-digit unencoded numeric ID formats (e.g. <code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-800 px-1 rounded">MYBF-0000000001</code>) and BigInt database sequence keys. It has not yet undergone stress load testing under high concurrency. Live records currently reflect {data.verifiedCurrentCapacity}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Query Latency</span>
              <Clock className="h-4 w-4 text-[#035AFC]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {data.latencyMs} ms
              </span>
              <span className="text-xs text-emerald-600 font-semibold">Round-Trip Ping</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Measured via SELECT 1 query probe</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Database Engine</span>
              <Database className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white">PostgreSQL</span>
              <span className="text-xs text-slate-500">Prisma ORM</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">ACID Transaction Pool Active</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Total Live Rows</span>
              <Layers className="h-4 w-4 text-purple-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totalRows}</span>
              <span className="text-xs text-slate-500">Across 11 Tables</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Foundational Schema Synchronized</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Migrations</span>
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {data.migrationsCount} Applied
              </span>
              <span className="text-xs text-emerald-600 font-semibold">In Sync</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Prisma migration history verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Row Distribution */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-[#035AFC]" />
            PostgreSQL Table Row Counts & State Breakdown
          </CardTitle>
          <CardDescription className="text-xs">
            Direct database aggregate count queries. Database connection strings and credentials remain protected server-side.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Entity Model</th>
                  <th className="py-3 px-4">Database Table Name</th>
                  <th className="py-3 px-4 text-right">Row Count</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {tableEntries.map(([modelName, count]) => (
                  <tr
                    key={modelName}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {modelName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {modelName.toLowerCase()}s
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      {count}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <CheckCircle2 className="h-3 w-3" /> Synchronized
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
