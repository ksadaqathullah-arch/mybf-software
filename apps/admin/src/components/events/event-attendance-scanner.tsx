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
import { checkInAttendeeAction } from '@/server/event.actions';

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

      if (res.success) {
        setScanResult({
          success: true,
          alreadyCheckedIn: res.alreadyCheckedIn,
          attendeeName: res.attendeeName,
          ticketTier: res.ticketTier || 'General Delegate',
          scannedAt: res.scannedAt,
          message: res.message,
        });

        if (!res.alreadyCheckedIn) {
          setAttendanceCount((prev) => prev + 1);
          if (onAttendeeScanned) onAttendeeScanned();
        }

        setRecentScans((prev) => [
          {
            attendeeName: res.attendeeName,
            ticketTier: res.ticketTier || 'General Delegate',
            scannedAt: new Date(res.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            alreadyCheckedIn: res.alreadyCheckedIn,
          },
          ...prev.slice(0, 4),
        ]);

        setTokenInput('');
      } else {
        setScanResult({
          success: false,
          message: res.error || 'Failed to verify QR pass token.',
        });
      }
    } catch {
      setScanResult({
        success: false,
        message: 'System error processing pass check-in.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-ink/5 border-2 border-ink">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted">Admitted In Venue</div>
          <div className="text-2xl font-black text-ink">
            {attendanceCount} <span className="text-xs font-normal text-muted">/ {capacity}</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted">Capacity Occupancy</div>
          <div className="text-2xl font-black text-primary">
            {Math.min(100, Math.round((attendanceCount / (capacity || 1)) * 100))}%
          </div>
        </div>
      </div>

      {/* Manual Token / Hardware Scanner Input */}
      <form onSubmit={handleScanSubmit} className="space-y-3">
        <label className="block text-xs font-mono uppercase tracking-wider text-ink font-bold">
          Scan QR Code or Enter Pass Token
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Scan className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste or scan QR token payload..."
              disabled={isScanning}
              autoFocus
              className="w-full pl-9 pr-3 py-2 bg-paper border-2 border-ink text-sm font-mono focus:outline-hidden focus:bg-primary/5"
            />
          </div>
          <Button
            type="submit"
            disabled={isScanning || !tokenInput.trim()}
            className="border-2 border-ink bg-primary text-primary-foreground hover:bg-ink hover:text-paper font-mono uppercase text-xs px-4"
          >
            {isScanning ? 'Verifying...' : 'Validate'}
          </Button>
        </div>
        <p className="text-[11px] text-muted">
          Accepts standard USB / Bluetooth 2D barcode scanners in keyboard emulation mode.
        </p>
      </form>

      {/* Verification Feedback Banner */}
      {scanResult && (
        <div
          className={`p-4 border-2 ${
            scanResult.success
              ? scanResult.alreadyCheckedIn
                ? 'bg-amber-500/10 border-amber-600 text-amber-950 dark:text-amber-200'
                : 'bg-emerald-500/10 border-emerald-600 text-emerald-950 dark:text-emerald-200'
              : 'bg-red-500/10 border-red-600 text-red-950 dark:text-red-200'
          } animate-in fade-in duration-200`}
        >
          <div className="flex items-start gap-3">
            {scanResult.success ? (
              scanResult.alreadyCheckedIn ? (
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              )
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-bold text-sm tracking-tight">
                {scanResult.success
                  ? scanResult.alreadyCheckedIn
                    ? 'ALREADY ADMITTED (DUPLICATE PASS)'
                    : 'PASS VERIFIED — ADMISSION GRANTED'
                  : 'INVALID OR UNRECOGNIZED PASS'}
              </div>
              <div className="text-xs mt-1 leading-relaxed">{scanResult.message}</div>
              {scanResult.attendeeName && (
                <div className="mt-2 pt-2 border-t border-ink/10 flex items-center justify-between text-xs font-mono">
                  <span>Delegate: <strong>{scanResult.attendeeName}</strong></span>
                  <Badge variant="neutral" className="text-[10px] uppercase font-bold">
                    {scanResult.ticketTier}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Check-in Audit Stream */}
      {recentScans.length > 0 && (
        <div className="space-y-2 border-t-2 border-ink pt-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
            Recent Scans at this Gate
          </div>
          <div className="space-y-1.5">
            {recentScans.map((scan, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs p-2 bg-ink/5 border border-ink/20 font-mono"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      scan.alreadyCheckedIn ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="font-bold text-ink">{scan.attendeeName}</span>
                  <span className="text-muted">({scan.ticketTier})</span>
                </div>
                <span className="text-muted text-[11px]">{scan.scannedAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
