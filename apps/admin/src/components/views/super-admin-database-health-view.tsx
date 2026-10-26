'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageHeader, PortalStatCard } from '@/components/ui/portal-elements';
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
      <PortalPageHeader
        badge="Database Telemetry & Capacity"
        tag={data.status === 'HEALTHY' ? 'System Healthy' : 'Latency Degraded'}
        title="Database & Infrastructure Metrics"
        description="Real-time PostgreSQL engine status, query round-trip latency, table row counts, and architectural scalability status."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Testing...' : 'Test Connection'}
          </Button>
        }
      />

      {/* Honest Capacity & Scalability Analysis Card */}
      <div className="border-2 border-ink bg-paper-2/60 p-5 shadow-[4px_4px_0px_#14161c]">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-ink shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-sans font-bold text-sm text-ink tracking-tight">
              Architectural Target vs. Measured Present Capacity
            </h4>
            <p className="font-sans text-xs text-muted leading-relaxed">
              The 5,000,000 member capacity is an <strong className="text-ink">architectural target</strong> supported by 10-digit unencoded numeric ID formats (e.g. <code className="font-mono text-xs bg-white border border-ink px-1 py-0.5 shadow-[1px_1px_0px_#14161c]">MYBF-0000000001</code>) and BigInt database sequence keys. Live records currently reflect {data.verifiedCurrentCapacity}.
            </p>
          </div>
        </div>
      </div>

      {/* Core Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <PortalStatCard
          label="Query Latency"
          value={`${data.latencyMs} ms`}
          subValue="Round-Trip Ping"
          detail="Measured via SELECT 1 query probe"
          icon={Clock}
          accent="blue"
        />
        <PortalStatCard
          label="Database Engine"
          value={data.databaseEngine.split(' ')[0] || 'PostgreSQL'}
          subValue="Neon Serverless"
          detail="Full ACID transaction isolation"
          icon={Database}
          accent="emerald"
        />
        <PortalStatCard
          label="Tracked Entities"
          value={tableEntries.length}
          subValue="Tables"
          detail="Normalized relational schema"
          icon={Layers}
        />
        <PortalStatCard
          label="Total Rows"
          value={totalRows.toLocaleString()}
          subValue="Live Rows"
          detail="Active PostgreSQL records"
          icon={HardDrive}
          accent="yellow"
        />
      </div>

      {/* Database Tables Telemetry Breakdown */}
      <Card className="border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c]">
        <CardHeader className="p-5 sm:p-6 pb-4 border-b-2 border-ink bg-paper-2/40">
          <CardTitle className="font-sans font-bold text-lg sm:text-xl text-ink tracking-tight flex items-center gap-2">
            <Server className="h-5 w-5 text-blue" /> PostgreSQL Entity Table Row Breakdown
          </CardTitle>
          <CardDescription className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
            Live counts across core identity, governance, chapter, application, and immutable audit logs.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b-2 border-ink bg-ink text-paper font-sans text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-paper">Table Name</th>
                  <th className="py-3 px-4 text-paper">Domain Classification</th>
                  <th className="py-3 px-4 text-right text-paper">Live Record Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/15 font-sans">
                {tableEntries.map(([table, count]) => {
                  const domain = table.includes('application')
                    ? 'Membership & Onboarding'
                    : table.includes('user') || table.includes('profile')
                    ? 'Identity & Credentials'
                    : table.includes('chapter')
                    ? '16 Constituencies Chapter Hub'
                    : table.includes('audit')
                    ? 'Immutable Security Logs'
                    : 'System Configuration';

                  return (
                    <tr key={table} className="hover:bg-yellow/15 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-ink">
                        {table}
                      </td>
                      <td className="py-3 px-4 font-sans text-muted">
                        {domain}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm text-ink">
                        {count.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
