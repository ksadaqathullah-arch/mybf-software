import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Ticket, ArrowRight } from 'lucide-react';

const SAMPLE_EVENTS = [
  {
    id: 'evt-1',
    title: 'MYBF Annual Business Summit 2026',
    slug: 'annual-summit-2026',
    category: 'DISTRICT SUMMIT',
    chapter: 'Malappuram Central Chapter',
    date: '28 October 2026',
    venue: 'Civil Station Auditorium, Malappuram',
    capacity: 500,
    registered: 340,
    eventType: 'FREE',
    description: 'The premier annual gathering of youth entrepreneurs, innovators, and investors across Kerala.',
  },
  {
    id: 'evt-2',
    title: 'Manjeri Retail & Export Conclave',
    slug: 'manjeri-retail-conclave',
    category: 'TRADE WORKSHOP',
    chapter: 'Manjeri Chapter',
    date: '12 November 2026',
    venue: 'Trade Center, Manjeri',
    capacity: 150,
    registered: 92,
    eventType: 'FREE',
    description: 'Scaling local retail brands to GCC and global diaspora consumer markets.',
  },
  {
    id: 'evt-3',
    title: 'Coastal Logistics & Fishery Innovation Meet',
    slug: 'coastal-logistics-meet',
    category: 'SECTOR FORUM',
    chapter: 'Ponnani Chapter',
    date: '20 November 2026',
    venue: 'Harbor Hall, Ponnani',
    capacity: 120,
    registered: 75,
    eventType: 'FREE',
    description: 'Modernizing maritime cold chain supply and sustainable food processing.',
  },
];

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Title */}
      <div className="space-y-4 max-w-3xl">
        <Badge variant="primary">Events & Summits</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          MYBF Knowledge & Networking Sessions
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Join chapter meetups, industry conclaves, and district-wide business summits with QR-ticketed admission.
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {SAMPLE_EVENTS.map((event) => (
          <Card key={event.id} className="flex flex-col justify-between hover:shadow-lg transition-all border-slate-200 dark:border-slate-800">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px]">{event.category}</Badge>
                <Badge variant="neutral" className="text-[10px]">{event.eventType}</Badge>
              </div>
              <CardTitle className="text-xl mt-3">{event.title}</CardTitle>
              <CardDescription className="text-xs mt-2 line-clamp-2">
                {event.description}
              </CardDescription>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#035AFC] shrink-0" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#035AFC] shrink-0" />
                  <span className="truncate">{event.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#035AFC] shrink-0" />
                  <span>{event.registered} / {event.capacity} Registered</span>
                </div>
              </div>
            </CardHeader>

            <CardFooter className="p-6 pt-0">
              <Link href="/register" className="w-full">
                <Button className="w-full" size="sm">
                  Register for Pass <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
