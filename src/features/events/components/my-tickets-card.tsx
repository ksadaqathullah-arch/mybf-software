'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, QrCode, Calendar, MapPin, CheckCircle2, Clock } from 'lucide-react';

export interface TicketItem {
  id: string;
  ticketCode: string;
  status: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  event: {
    id: string;
    title: string;
    slug: string;
    category: string;
    venueName: string;
    venueAddress: string;
    startsAt: string;
    endsAt: string;
    chapterName: string;
    basePriceINR: number;
  };
}

interface MyTicketsCardProps {
  refreshTrigger?: number;
  onTicketsLoaded?: (tickets: TicketItem[]) => void;
}

export function MyTicketsCard({ refreshTrigger, onTicketsLoaded }: MyTicketsCardProps) {
  const [tickets, setTickets] = React.useState<TicketItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchTickets = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/events/my-tickets');
      const data = await res.json();
      if (res.ok && data.success) {
        setTickets(data.tickets || []);
        onTicketsLoaded?.(data.tickets || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [onTicketsLoaded]);

  React.useEffect(() => {
    fetchTickets();
  }, [fetchTickets, refreshTrigger]);

  if (loading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm p-6 text-center text-xs text-slate-400">
        Loading your registered event tickets...
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm p-6 text-center space-y-2">
        <Ticket className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
        <CardTitle className="text-base">No Event Tickets Yet</CardTitle>
        <CardDescription className="text-xs">
          You haven&apos;t registered for any events yet. Check out the upcoming summits above to reserve your free pass.
        </CardDescription>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="p-6 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-lg">My Event Tickets ({tickets.length})</CardTitle>
          </div>
          <Badge variant="success">CONFIRMED PASSES</Badge>
        </div>
        <CardDescription className="text-xs">
          Digital admission passes with cryptographic QR verification tokens. Present at the reception for instant check-in scan.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 pt-2 space-y-4">
        {tickets.map((t) => {
          const startDate = new Date(t.event.startsAt);
          const formattedDate = startDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={t.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-[#070A10] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" className="text-[10px]">{t.event.chapterName}</Badge>
                  {t.checkedIn ? (
                    <Badge variant="success" className="text-[10px]">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Admitted at Reception
                    </Badge>
                  ) : (
                    <Badge variant="primary" className="text-[10px]">
                      <Clock className="h-3 w-3 mr-1" /> Valid for Admission
                    </Badge>
                  )}
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.event.title}
                </h4>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> {formattedDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> {t.event.venueName}
                  </span>
                </div>
              </div>

              {/* QR Code and Pass Details */}
              <div className="shrink-0 flex items-center gap-3 p-2.5 rounded-lg bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800">
                <div className="h-14 w-14 rounded bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <QrCode className="h-10 w-10 text-[#035AFC]" />
                </div>
                <div className="text-left space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">QR Verification Code</span>
                  <span className="font-mono font-bold text-xs text-[#035AFC] block truncate max-w-[130px]">
                    {t.ticketCode}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">100% Free Pass</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
