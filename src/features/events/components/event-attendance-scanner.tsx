'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Scan,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  RotateCcw,
} from 'lucide-react';
import { checkInAttendeeAction } from '../server/event.actions';

interface EventAttendanceScannerProps {
  eventId: string;
  eventTitle: string;
  initialAttendanceCount?: number;
  capacity?: number;
  onAttendeeScanned?: () => void;
}

export function EventAttendanceScanner({
  eventId,
  eventTitle,
  initialAttendanceCount = 0,
  capacity = 100,
  onAttendeeScanned,
}: EventAttendanceScannerProps) {
  const [tokenInput, setTokenInput] = React.useState('');
  const [isScanning, setIsScanning] = React.useState(false);
  const [attendanceCount, setAttendanceCount] = React.useState(initialAttendanceCount);
  const [scanResult, setScanResult] = React.useState<{
    success: boolean;
    alreadyCheckedIn?: boolean;
    attendeeName?: string;
    ticketTier?: string;
    scannedAt?: string;
    message: string;
  } | null>(null);

  const [recentScans, setRecentScans] = React.useState<
    Array<{
      attendeeName: string;
      ticketTier: string;
      scannedAt: string;
      alreadyCheckedIn: boolean;
    }>
  >([]);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = tokenInput.trim();
    if (!token) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      const res = await checkInAttendeeAction(eventId, token);

      if (!res.success) {
        setScanResult({
          success: false,
          message: res.error || 'Check-in failed.',
        });
        return;
      }

      setScanResult({
        success: true,
        alreadyCheckedIn: res.alreadyCheckedIn,
        attendeeName: res.attendeeName,
        ticketTier: res.ticketTier || undefined,
        scannedAt: res.scannedAt,
        message: res.message,
      });

      if (!res.alreadyCheckedIn) {
        setAttendanceCount((prev) => prev + 1);
        onAttendeeScanned?.();
      }

      setRecentScans((prev) => [
        {
          attendeeName: res.attendeeName || 'Delegate',
          ticketTier: res.ticketTier || 'Standard',
          scannedAt: res.scannedAt || new Date().toISOString(),
          alreadyCheckedIn: Boolean(res.alreadyCheckedIn),
        },
        ...prev.slice(0, 4),
      ]);

      setTokenInput('');
    } catch (err: any) {
      setScanResult({
        success: false,
        message: err.message || 'Network error scanning ticket.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const attendancePct = capacity > 0 ? Math.min(100, Math.round((attendanceCount / capacity) * 100)) : 0;

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="p-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-[#035AFC]" />
              <CardTitle className="text-base font-bold">Reception QR Attendance Scanner</CardTitle>
              <Badge variant="primary">LIVE SCANNER</Badge>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Instant cryptographic admission scan for &ldquo;{eventTitle}&rdquo;. Idempotent entry prevents duplicate badges.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#035AFC] font-mono">
              {attendanceCount} / {capacity} Admitted ({attendancePct}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${attendancePct}%` }} />
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-2 space-y-4">
        {/* Scanner Input Form */}
        <form onSubmit={handleScanSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Scan className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Scan ticket QR code or enter token (e.g. EVT-ABCD...)"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#035AFC]"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isScanning || !tokenInput.trim()}
            className="text-xs font-semibold px-4"
          >
            {isScanning ? 'Verifying...' : 'Verify Pass'}
          </Button>
        </form>

        {/* Scan Result Alert */}
        {scanResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs animate-in fade-in duration-150 flex items-start gap-2.5 ${
              !scanResult.success
                ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-950 dark:bg-red-950/20 dark:text-red-300'
                : scanResult.alreadyCheckedIn
                ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-950 dark:bg-amber-950/20 dark:text-amber-300'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-300'
            }`}
          >
            {!scanResult.success ? (
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            ) : scanResult.alreadyCheckedIn ? (
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            )}

            <div className="space-y-0.5">
              <div className="font-bold flex items-center gap-2">
                <span>{scanResult.message}</span>
                {scanResult.ticketTier && (
                  <Badge variant="primary" className="text-[9px]">
                    {scanResult.ticketTier}
                  </Badge>
                )}
              </div>
              {scanResult.attendeeName && (
                <div className="text-[11px] opacity-90">
                  Delegate: <strong>{scanResult.attendeeName}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Scans Stream */}
        {recentScans.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Recent Reception Check-Ins
            </span>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {recentScans.map((scan, idx) => (
                <div key={idx} className="py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {scan.attendeeName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({scan.ticketTier})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(scan.scannedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
