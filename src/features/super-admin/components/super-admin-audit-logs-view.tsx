'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Search,
  Download,
  Filter,
  RefreshCw,
  Eye,
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  actorEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  diffJson: any;
  createdAt: string;
}

interface SuperAdminAuditLogsViewProps {
  initialLogs: AuditLogEntry[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
}

export function SuperAdminAuditLogsView({
  initialLogs,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
}: SuperAdminAuditLogsViewProps) {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>(initialLogs);
  const [total, setTotal] = React.useState(initialTotal);
  const [page, setPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [totalPages, setTotalPages] = React.useState(initialTotalPages);
  const [loading, setLoading] = React.useState(false);

  // Filters
  const [actionFilter, setActionFilter] = React.useState('');
  const [resourceFilter, setResourceFilter] = React.useState('');
  const [actorEmailFilter, setActorEmailFilter] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  // Selected Log for inspection modal
  const [selectedLog, setSelectedLog] = React.useState<AuditLogEntry | null>(null);
  const [copied, setCopied] = React.useState(false);

  const fetchLogs = React.useCallback(
    async (targetPage = page) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(targetPage));
        params.set('pageSize', String(pageSize));
        if (actionFilter.trim()) params.set('action', actionFilter.trim());
        if (resourceFilter.trim()) params.set('resource', resourceFilter.trim());
        if (actorEmailFilter.trim()) params.set('actorEmail', actorEmailFilter.trim());
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);

        const res = await fetch(`/api/v1/super-admin/audit-logs?${params.toString()}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setLogs(data.logs);
          setTotal(data.total);
          setPage(data.page);
          setPageSize(data.pageSize);
          setTotalPages(data.totalPages);
        }
      } catch (err) {
        console.error('Failed to query audit logs:', err);
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize, actionFilter, resourceFilter, actorEmailFilter, startDate, endDate]
  );

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs(1);
  };

  const handleResetFilters = () => {
    setActionFilter('');
    setResourceFilter('');
    setActorEmailFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setTimeout(() => {
      fetch('/api/v1/super-admin/audit-logs?page=1&pageSize=20')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setLogs(data.logs);
            setTotal(data.total);
            setPage(1);
            setTotalPages(data.totalPages);
          }
        });
    }, 50);
  };

  const handleExport = (format: 'csv' | 'json') => {
    const params = new URLSearchParams();
    params.set('export', format);
    if (actionFilter.trim()) params.set('action', actionFilter.trim());
    if (resourceFilter.trim()) params.set('resource', resourceFilter.trim());
    if (actorEmailFilter.trim()) params.set('actorEmail', actorEmailFilter.trim());
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    window.open(`/api/v1/super-admin/audit-logs?${params.toString()}`, '_blank');
  };

  const handleCopyJson = () => {
    if (!selectedLog) return;
    navigator.clipboard.writeText(JSON.stringify(selectedLog.diffJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Integrity Disclaimer */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-[#035AFC] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Audit Trail Verification & Technical Properties</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
            Audit entries are recorded in the PostgreSQL <code className="font-mono text-[10px] bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">audit_events</code> table via server-side transactions. Database integrity constraints prevent unauthorized modification through standard application interfaces. Cryptographic write-once-read-many (WORM) hardware storage requires external cold storage replication.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4">
          <form onSubmit={handleApplyFilters} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Action
                </label>
                <input
                  type="text"
                  placeholder="e.g. APPROVED, ROLE..."
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#035AFC]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Resource
                </label>
                <input
                  type="text"
                  placeholder="e.g. MembershipApplication"
                  value={resourceFilter}
                  onChange={(e) => setResourceFilter(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#035AFC]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Actor Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. admin@mybf.in"
                  value={actorEmailFilter}
                  onChange={(e) => setActorEmailFilter(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#035AFC]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#035AFC]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#035AFC]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" size="sm" className="h-8 text-xs font-semibold">
                  <Filter className="h-3.5 w-3.5 mr-1.5" /> Filter Logs
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-8 text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reset
                </Button>
                <span className="text-xs text-slate-400 ml-2">
                  Showing {logs.length} of {total} records
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  className="h-8 text-xs"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExport('json')}
                  className="h-8 text-xs"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Export JSON
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Timestamp (IST)</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                      Loading audit records from PostgreSQL...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                      No audit events match the specified query filters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4 font-bold text-[#035AFC] dark:text-blue-400">
                        {log.action}
                      </td>

                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        <span className="font-sans font-semibold text-xs">{log.resource}</span>
                        {log.resourceId && (
                          <span className="block text-[10px] text-slate-400 truncate max-w-[120px]">
                            {log.resourceId}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {log.actorEmail || 'System / Automated'}
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {log.ipAddress || 'Internal'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {log.diffJson ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="h-7 px-2 text-[11px] font-sans text-slate-600 dark:text-slate-300 hover:text-[#035AFC]"
                          >
                            <Eye className="h-3 w-3 mr-1" /> View Diff
                          </Button>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700 text-[10px] italic">
                            Empty
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Page {page} of {totalPages} ({total} total logs)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => {
                    const next = Math.max(1, page - 1);
                    setPage(next);
                    fetchLogs(next);
                  }}
                  className="h-8 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || loading}
                  onClick={() => {
                    const next = Math.min(totalPages, page + 1);
                    setPage(next);
                    fetchLogs(next);
                  }}
                  className="h-8 text-xs"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* JSON Diff Drawer / Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <Card className="max-w-2xl w-full border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#070A10]">
            <CardHeader className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#035AFC]" />
                  Audit Event Diff & Payload
                </CardTitle>
                <CardDescription className="text-xs">
                  Action: {selectedLog.action} • Resource: {selectedLog.resource}
                </CardDescription>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Recorded: {new Date(selectedLog.createdAt).toLocaleString()}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyJson}
                  className="h-7 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 mr-1 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" /> Copy JSON
                    </>
                  )}
                </Button>
              </div>

              <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto max-h-96">
                <pre>{JSON.stringify(selectedLog.diffJson, null, 2)}</pre>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedLog(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
