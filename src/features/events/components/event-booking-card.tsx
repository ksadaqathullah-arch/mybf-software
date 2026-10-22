'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Ticket, Check, Sparkles, AlertCircle } from 'lucide-react';

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  venueName: string;
  venueAddress: string;
  eventType: string;
  basePriceINR: number;
  capacity: number;
  registeredCount: number;
  startsAt: string;
  endsAt: string;
  chapter?: { id: string; name: string; slug: string } | null;
}

interface EventBookingCardProps {
  onTicketBooked?: () => void;
  registeredEventIds?: string[];
}

export function EventBookingCard({ onTicketBooked, registeredEventIds = [] }: EventBookingCardProps) {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [bookingId, setBookingId] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchEvents = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/events');
      const data = await res.json();
      if (res.ok && data.success) {
        setEvents(data.events || []);
      }
    } catch {
      // Ignore network errors in demo
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleBook = async (eventId: string, title: string) => {
    setBookingId(eventId);
    setNotice(null);

    try {
      const res = await fetch('/api/v1/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reserve ticket.');
      }

      setNotice({
        text: `Free ticket confirmed for "${title}"! Ticket QR code generated in My Tickets.`,
        type: 'success',
      });

      fetchEvents();
      onTicketBooked?.();
    } catch (err: any) {
      setNotice({
        text: err.message || 'Ticket booking could not be completed.',
        type: 'error',
      });
    } finally {
      setBookingId(null);
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="p-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#035AFC]" />
              <CardTitle className="text-lg">Upcoming MYBF Events & Summits</CardTitle>
              <Badge variant="success">100% FREE NGO PASS</Badge>
            </div>
            <CardDescription className="text-xs mt-1">
              Malappuram district summits and chapter meetups. Community membership grants free pass admission.
            </CardDescription>
          </div>
        </div>

        {notice && (
          <div
            className={`mt-3 p-3 rounded-lg text-xs flex items-center justify-between border ${
              notice.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}
          >
            <span>{notice.text}</span>
            <button onClick={() => setNotice(null)} className="ml-2 font-bold">×</button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6 pt-2">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading scheduled events...</div>
        ) : events.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No events currently scheduled. Check back soon.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => {
              const startDate = new Date(evt.startsAt);
              const formattedDate = startDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const isRegistered = registeredEventIds.includes(evt.id);
              const isFull = evt.registeredCount >= evt.capacity;

              return (
                <div
                  key={evt.id}
                  className="border-2 border-ink p-4 bg-paper flex flex-col justify-between space-y-3 shadow-[3px_3px_0px_#14161c]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="neutral" className="text-[10px]">
                        {evt.chapter?.name || 'District Wide'}
                      </Badge>
                      <span className="text-[10px] font-mono font-bold text-blue flex items-center gap-1 uppercase">
                        <Sparkles className="h-3 w-3" /> Free NGO Ticket
                      </span>
                    </div>

                    <h4 className="font-display font-black text-sm text-ink uppercase tracking-tight leading-snug">
                      {evt.title}
                    </h4>

                    <p className="font-serif italic text-xs text-ink/70 line-clamp-2">
                      {evt.description}
                    </p>

                    <div className="space-y-1 text-xs font-mono text-ink/80 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-blue shrink-0" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-yellow shrink-0" />
                        <span className="truncate">{evt.venueName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-ink/60">
                        <Users className="h-3.5 w-3.5 text-ink/60 shrink-0" />
                        <span>{evt.registeredCount} / {evt.capacity} seats confirmed</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t-2 border-ink/20 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-ink/60 uppercase">₹0 Pass</span>
                    <Button
                      variant={isRegistered ? 'secondary' : 'default'}
                      size="sm"
                      disabled={isRegistered || isFull || bookingId === evt.id}
                      onClick={() => handleBook(evt.id, evt.title)}
                      className={`h-8 text-xs px-3 font-display uppercase tracking-wider border-2 border-ink shadow-[2px_2px_0px_#14161c] ${
                        !isRegistered && !isFull ? 'bg-blue text-paper' : ''
                      }`}
                    >
                      {bookingId === evt.id ? (
                        'Confirming...'
                      ) : isRegistered ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1 text-ink" /> Booked
                        </>
                      ) : isFull ? (
                        'Capacity Full'
                      ) : (
                        <>
                          <Ticket className="h-3.5 w-3.5 mr-1" /> Book Free Ticket
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
