import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EventService } from '@/features/events/server/event.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  ChevronLeft,
  Share2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { EventDetailBookingCard } from '@/features/events/components/event-detail-booking-card';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PublicEventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await EventService.getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const startDate = new Date(event.startsAt);
  const formattedDate = startDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: event.timezone || 'Asia/Kolkata',
  });

  const levelBadgeLabel =
    event.scope === 'MAIN'
      ? 'Central Forum Main Event'
      : event.scope === 'DISTRICT'
      ? 'Malappuram District Conclave'
      : `${event.chapter?.name || 'Constituency'} Chapter Event`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link href="/events" className="flex items-center gap-1 hover:text-[#035AFC]">
          <ChevronLeft className="h-4 w-4" /> Back to All Events
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="primary">{levelBadgeLabel}</Badge>
          <Badge variant="neutral">{event.mode}</Badge>
        </div>
      </div>

      {/* Hero Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 to-[#070A10] text-white p-6 sm:p-10 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success" className="text-xs">
            {event.eventType === 'FREE' ? '100% Free NGO Pass' : `Paid Ticket • ₹${event.basePriceINR}`}
          </Badge>
          <span className="text-xs text-slate-400 font-mono">
            Category: {event.category}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
          {event.title}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#035AFC] shrink-0" />
            <div>
              <div className="font-bold text-white">{formattedDate}</div>
              <div className="text-xs text-slate-400">{formattedTime} IST</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#035AFC] shrink-0" />
            <div>
              <div className="font-bold text-white">{event.venueName}</div>
              <div className="text-xs text-slate-400 truncate max-w-[200px]">
                {event.venueAddress || 'Malappuram, Kerala'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#035AFC] shrink-0" />
            <div>
              <div className="font-bold text-white">
                {event.registeredCount} / {event.capacity} Registered
              </div>
              <div className="text-xs text-emerald-400 font-semibold">
                {event.capacity - event.registeredCount} seats remaining
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Details, Sessions, Speakers */}
        <div className="lg:col-span-8 space-y-8">
          {/* About Event */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-lg font-bold">About This Conclave</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
              <p className="whitespace-pre-line">{event.description}</p>
            </CardContent>
          </Card>

          {/* Program Schedule / Sessions */}
          {event.sessions.length > 0 && (
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#035AFC]" /> Program Schedule & Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {event.sessions.map((sess) => (
                    <div key={sess.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {sess.title}
                        </div>
                        {sess.speakerName && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            Speaker: <strong className="text-slate-700 dark:text-slate-300">{sess.speakerName}</strong>
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-400 shrink-0">
                        {new Date(sess.startsAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: event.timezone || 'Asia/Kolkata',
                        })}
                        {' - '}
                        {new Date(sess.endsAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: event.timezone || 'Asia/Kolkata',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organizer / Contact Info */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#035AFC]" /> Event Organizer & Governance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Jurisdiction Level:</span>
                <span className="font-bold text-slate-900 dark:text-white">{levelBadgeLabel}</span>
              </div>
              {event.chapter && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Constituency Chapter:</span>
                  <Link href={`/chapters/${event.chapter.slug}`} className="font-bold text-[#035AFC] hover:underline">
                    {event.chapter.name} ({event.chapter.code})
                  </Link>
                </div>
              )}
              {event.organizerName && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Organizer / Coordinator:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{event.organizerName}</span>
                </div>
              )}
              {event.organizerEmail && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Contact Email:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{event.organizerEmail}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Ticket Reservation Card */}
        <div className="lg:col-span-4 sticky top-6 space-y-6">
          <EventDetailBookingCard
            eventId={event.id}
            eventTitle={event.title}
            eventType={event.eventType}
            basePriceINR={event.basePriceINR}
            capacity={event.capacity}
            registeredCount={event.registeredCount}
            ticketTiers={event.ticketTiers}
          />
        </div>
      </div>
    </div>
  );
}
