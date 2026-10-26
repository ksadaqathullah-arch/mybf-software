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
    if (actionFilter) params.set('action', actionFilter);
    if (resourceFilter) params.set('resource', resourceFilter);
    if (actorEmailFilter) params.set('actorEmail', actorEmailFilter);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    params.set('format', format);
    window.open(`/api/v1/super-admin/audit-logs/export?${params.toString()}`, '_blank');
  };

  const handleCopyJson = () => {
    if (!selectedLog) return;
    navigator.clipboard.writeText(JSON.stringify(selectedLog.diffJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Filter and Export Toolbar Card */}
      <Card className="border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c]">
        <CardHeader className="p-5 pb-3 border-b-2 border-ink bg-paper-2/40">
          <CardTitle className="font-sans font-bold text-base text-ink tracking-tight flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue" /> Query & Audit Filtering
          </CardTitle>
          <CardDescription className="font-sans text-xs text-muted">
            Search across recorded events by action type, resource scope, actor, or date window.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleApplyFilters} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-sans">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Action
                </label>
                <input
                  type="text"
                  placeholder="e.g. APPROVE_APPLICATION"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full text-xs border-2 border-ink bg-white p-2 text-ink outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Resource
                </label>
                <input
                  type="text"
                  placeholder="e.g. MEMBERSHIP_APPLICATION"
                  value={resourceFilter}
                  onChange={(e) => setResourceFilter(e.target.value)}
                  className="w-full text-xs border-2 border-ink bg-white p-2 text-ink outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Actor Email
                </label>
                <input
                  type="text"
                  placeholder="admin@mybf.in"
                  value={actorEmailFilter}
                  onChange={(e) => setActorEmailFilter(e.target.value)}
                  className="w-full text-xs border-2 border-ink bg-white p-2 text-ink outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs border-2 border-ink bg-white p-2 text-ink outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs border-2 border-ink bg-white p-2 text-ink outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#14161c]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-ink">
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" size="sm">
                  <Filter className="h-3.5 w-3.5 mr-1.5" /> Filter Logs
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reset
                </Button>
                <span className="text-xs font-sans text-muted ml-2">
                  Showing {logs.length} of {total} records
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExport('csv')}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExport('json')}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Export JSON
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="border-2 border-ink bg-paper shadow-[4px_4px_0px_#14161c]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b-2 border-ink bg-ink text-paper font-sans text-xs font-semibold tracking-wide">
                <tr>
                  <th className="py-3 px-4 text-paper">Timestamp (IST)</th>
                  <th className="py-3 px-4 text-paper">Action</th>
                  <th className="py-3 px-4 text-paper">Resource</th>
                  <th className="py-3 px-4 text-paper">Actor</th>
                  <th className="py-3 px-4 text-paper">IP Address</th>
                  <th className="py-3 px-4 text-paper text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/15 font-mono text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted font-sans text-sm">
                      Loading audit records from database...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted font-sans text-sm">
                      No audit events match the specified query filters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-yellow/15 transition-colors"
                    >
                      <td className="py-3 px-4 text-muted whitespace-nowrap font-mono">
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

                      <td className="py-3 px-4 font-bold text-blue">
                        {log.action}
                      </td>

                      <td className="py-3 px-4 text-ink">
                        <span className="font-sans font-bold text-xs">{log.resource}</span>
                        {log.resourceId && (
                          <span className="block text-[10px] text-muted truncate max-w-[120px]">
                            {log.resourceId}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-ink font-sans">
                        {log.actorEmail || 'System / Automated'}
                      </td>

                      <td className="py-3 px-4 text-muted">
                        {log.ipAddress || 'Internal'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {log.diffJson ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="h-7 px-2 text-[10px]"
                          >
                            <Eye className="h-3 w-3 mr-1" /> View Diff
                          </Button>
                        ) : (
                          <span className="text-muted text-[10px] italic font-serif">
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
            <div className="flex items-center justify-between p-4 border-t-2 border-ink bg-paper-2/40">
              <span className="text-xs font-serif text-muted">
                Page <strong className="text-ink">{page}</strong> of <strong className="text-ink">{totalPages}</strong>
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
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="max-w-2xl w-full border-2 border-ink bg-paper text-ink shadow-[12px_12px_0px_#14161c] p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <div>
                <h3 className="font-sans font-bold text-base text-ink tracking-tight flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue" />
                  Audit Event Diff & Payload
                </h3>
                <p className="font-sans text-xs text-muted">
                  Action: <strong className="text-ink">{selectedLog.action}</strong> • Resource: <strong className="text-ink">{selectedLog.resource}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 border border-ink text-ink hover:bg-ink hover:text-paper cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 font-sans">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Recorded: {new Date(selectedLog.createdAt).toLocaleString()}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyJson}
                  className="h-7 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 mr-1 text-emerald-700" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" /> Copy JSON
                    </>
                  )}
                </Button>
              </div>

              <div className="border-2 border-ink bg-ink p-4 text-paper font-mono text-xs overflow-x-auto max-h-96 shadow-[2px_2px_0px_#14161c]">
                <pre>{JSON.stringify(selectedLog.diffJson, null, 2)}</pre>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedLog(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
