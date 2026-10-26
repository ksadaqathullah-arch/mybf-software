import Link from 'next/link';
import { EventService } from '@/features/events/server/event.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Ticket, ArrowRight, Sparkles, Building2, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    scope?: string;
    category?: string;
    search?: string;
  }>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const result = await EventService.getEvents({
    scope: sp.scope,
    category: sp.category,
    search: sp.search,
    status: 'PUBLISHED',
    pageSize: 30,
  });

  const events = result.events;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
      {/* Title & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2">
            <Badge variant="primary">Conclaves & Summits</Badge>
            <Badge variant="success">Free Admission Passes</Badge>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            MYBF Knowledge, Networking & Youth Conclaves
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Central youth forums, Malappuram district conclaves, and 16 constituency chapter workshops with cryptographically verified QR admission.
          </p>
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/events">
            <Button variant={!sp.scope ? 'primary' : 'outline'} size="sm" className="h-8 text-xs font-semibold">
              All Levels
            </Button>
          </Link>
          <Link href="/events?scope=MAIN">
            <Button variant={sp.scope === 'MAIN' ? 'primary' : 'outline'} size="sm" className="h-8 text-xs font-semibold">
              Main Forum
            </Button>
          </Link>
          <Link href="/events?scope=DISTRICT">
            <Button variant={sp.scope === 'DISTRICT' ? 'primary' : 'outline'} size="sm" className="h-8 text-xs font-semibold">
              District
            </Button>
          </Link>
          <Link href="/events?scope=CHAPTER">
            <Button variant={sp.scope === 'CHAPTER' ? 'primary' : 'outline'} size="sm" className="h-8 text-xs font-semibold">
              Chapters
            </Button>
          </Link>
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
          <CardTitle className="text-lg">No Published Events Found</CardTitle>
          <CardDescription className="text-xs max-w-md mx-auto">
            There are currently no active public conclaves matching this filter. New sessions across Malappuram chapters will be announced soon.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const startDate = new Date(event.startsAt);
            const formattedDate = startDate.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            const levelBadge =
              event.scope === 'MAIN'
                ? 'Central Forum'
                : event.scope === 'DISTRICT'
                ? 'District Level'
                : event.chapter?.name || 'Chapter Event';

            return (
              <Card
                key={event.id}
                className="flex flex-col justify-between hover:shadow-lg transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10]"
              >
                <CardHeader className="p-6">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={event.scope === 'MAIN' ? 'primary' : event.scope === 'DISTRICT' ? 'secondary' : 'neutral'}>
                      {levelBadge}
                    </Badge>
                    <Badge variant="success">
                      {event.eventType === 'FREE' ? 'Free Pass' : `₹${event.basePriceINR}`}
                    </Badge>
                  </div>

                  <CardTitle className="text-lg font-bold mt-3 leading-snug text-slate-900 dark:text-white line-clamp-2">
                    {event.title}
                  </CardTitle>

                  <CardDescription className="text-xs mt-2 line-clamp-2 text-slate-500">
                    {event.description}
                  </CardDescription>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-[#035AFC] shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#035AFC] shrink-0" />
                      <span className="truncate">{event.venueName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-[#035AFC] shrink-0" />
                      <span>{event.registeredCount} / {event.capacity} Registered</span>
                    </div>
                  </div>
                </CardHeader>

                <CardFooter className="p-6 pt-0">
                  <Link href={`/events/${event.slug}`} className="w-full">
                    <Button variant="primary" className="w-full text-xs font-semibold" size="sm">
                      View Conclave & Pass Options <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
