'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageHeader, PortalStatCard } from '@/components/ui/portal-elements';
import {
  Calendar,
  Search,
  Download,
  ExternalLink,
  QrCode,
  X,
  FileSpreadsheet,
  MapPin,
  Users,
} from 'lucide-react';
import { EventCreationModal } from '@shared/features/events/components/event-creation-modal';
import { EventAttendanceScanner } from '@shared/features/events/components/event-attendance-scanner';

export interface AdminEventItem {
  id: string;
  title: string;
  slug: string;
  scope: string;
  category: string;
  description: string;
  venueName: string;
  venueAddress: string | null;
  mode: string;
  eventType: string;
  basePriceINR: number;
  capacity: number;
  registeredCount: number;
  startsAt: string;
  endsAt: string;
  status: string;
  chapter: {
    id: string;
    code: string;
    name: string;
    slug: string;
  } | null;
  attendanceCount: number;
}

interface SuperAdminEventsViewProps {
  events: AdminEventItem[];
}

export function SuperAdminEventsView({ events: initialEvents }: SuperAdminEventsViewProps) {
  const [events, setEvents] = React.useState<AdminEventItem[]>(initialEvents);
  const [search, setSearch] = React.useState('');
  const [scopeFilter, setScopeFilter] = React.useState('ALL');
  const [statusFilter, setStatusFilter] = React.useState('ALL');

  const [activeScannerEvent, setActiveScannerEvent] = React.useState<AdminEventItem | null>(null);

  const filteredEvents = React.useMemo(() => {
    return events.filter((e) => {
      if (scopeFilter !== 'ALL' && e.scope !== scopeFilter) return false;
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesVenue = e.venueName.toLowerCase().includes(q);
        const matchesCategory = e.category.toLowerCase().includes(q);
        const matchesChapter = e.chapter ? e.chapter.name.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesVenue && !matchesCategory && !matchesChapter) return false;
      }
      return true;
    });
  }, [events, search, scopeFilter, statusFilter]);

  // Aggregate Metrics
  const totalRegistrations = events.reduce((sum, e) => sum + e.registeredCount, 0);
  const totalAdmitted = events.reduce((sum, e) => sum + e.attendanceCount, 0);
  const mainEventsCount = events.filter((e) => e.scope === 'MAIN').length;
  const districtEventsCount = events.filter((e) => e.scope === 'DISTRICT').length;
  const chapterEventsCount = events.filter((e) => e.scope === 'CHAPTER').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <PortalPageHeader
        badge="SUPER ADMIN AUTHORITY"
        tag="MULTI-LEVEL CONCLAVES"
        title="Centralized Multi-Level Event Governance"
        description="Global lifecycle administration for Main Forum Events, Malappuram District Conclaves, and 16 Chapter Workshops."
        actions={
          <EventCreationModal
            allowedScopes={['MAIN', 'DISTRICT', 'CHAPTER']}
            triggerButtonText="Create Global Event"
            onEventCreated={(newEvent) => {
              setEvents((prev) => [
                {
                  ...newEvent,
                  attendanceCount: 0,
                  registeredCount: 0,
                  chapter: newEvent.chapter || null,
                  venueAddress: newEvent.venueAddress || null,
                },
                ...prev,
              ]);
            }}
          />
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <PortalStatCard
          label="Total Events"
          value={events.length}
          detail="Across all 3 tiers"
          icon={Calendar}
        />
        <PortalStatCard
          label="Main Forum"
          value={mainEventsCount}
          detail="Central Summits"
          accent="blue"
        />
        <PortalStatCard
          label="District Tier"
          value={districtEventsCount}
          detail="Malappuram Conclaves"
          accent="yellow"
        />
        <PortalStatCard
          label="Chapter Tier"
          value={chapterEventsCount}
          detail="16 Constituencies"
          accent="emerald"
        />
        <PortalStatCard
          label="Attendees"
          value={totalRegistrations.toLocaleString()}
          subValue={`${totalAdmitted} Admitted`}
          detail="100% Free Passes"
          icon={Users}
        />
      </div>

      {/* Filter Toolbar */}
      <div className="border-2 border-ink bg-paper p-4 shadow-[3px_3px_0px_#14161c]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search event title, venue, or category..."
              className="w-full pl-9 pr-3 py-2 border-2 border-ink bg-white text-xs text-ink placeholder:text-muted focus:ring-2 focus:ring-yellow outline-none font-sans shadow-[2px_2px_0px_#14161c]"
            />
          </div>

          <div>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              aria-label="Filter by Organizational Level"
              className="w-full border-2 border-ink bg-white px-3 py-2 text-xs text-ink outline-none focus:ring-2 focus:ring-yellow font-sans shadow-[2px_2px_0px_#14161c]"
            >
              <option value="ALL">All Organizational Levels</option>
              <option value="MAIN">Main Forum Events Only</option>
              <option value="DISTRICT">District Events Only</option>
              <option value="CHAPTER">Chapter Events Only</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Status"
              className="w-full border-2 border-ink bg-white px-3 py-2 text-xs text-ink outline-none focus:ring-2 focus:ring-yellow font-sans shadow-[2px_2px_0px_#14161c]"
            >
              <option value="ALL">All Event Statuses</option>
              <option value="PUBLISHED">Published & Active</option>
              <option value="DRAFT">Draft Mode</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full border-2 border-ink bg-paper p-12 text-center shadow-[4px_4px_0px_#14161c]">
            <p className="font-serif text-sm text-muted">No events matching the active filter criteria.</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="border-2 border-ink bg-paper p-5 shadow-[4px_4px_0px_#14161c] flex flex-col justify-between hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider bg-yellow text-ink px-2 py-0.5 border border-ink">
                    {event.scope} SCOPE
                  </span>
                  <Badge variant={event.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                    {event.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-display font-extrabold text-lg text-ink uppercase tracking-tight line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="font-serif text-xs text-muted mt-1 line-clamp-2">
                    {event.description}
                  </p>
                </div>

                <div className="border-t-2 border-ink/15 pt-2.5 space-y-1.5 font-sans text-xs">
                  <div className="flex items-center gap-2 text-ink">
                    <Calendar className="h-3.5 w-3.5 text-muted shrink-0" />
                    <span>
                      {new Date(event.startsAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-ink">
                    <MapPin className="h-3.5 w-3.5 text-muted shrink-0" />
                    <span className="truncate">{event.venueName}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted font-serif">Capacity:</span>
                    <strong className="font-mono text-ink">
                      {event.registeredCount} / {event.capacity}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-ink flex items-center justify-between gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveScannerEvent(event)}
                  className="h-8 text-[10px]"
                >
                  <QrCode className="h-3.5 w-3.5 mr-1" /> QR Check-in
                </Button>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`/api/v1/events/export?eventId=${event.id}`}
                    download
                    className="p-1.5 border-2 border-ink bg-paper hover:bg-ink hover:text-paper shadow-[1px_1px_0px_#14161c] transition-colors"
                    title="Export Attendees CSV"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                  <Link
                    href={`/events/${event.slug}`}
                    className="p-1.5 border-2 border-ink bg-paper hover:bg-ink hover:text-paper shadow-[1px_1px_0px_#14161c] transition-colors"
                    title="View Event Page"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR Code Attendance Scanner Modal */}
      {activeScannerEvent && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="max-w-md w-full border-2 border-ink bg-paper text-ink shadow-[12px_12px_0px_#14161c] p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <div>
                <h3 className="font-display font-extrabold text-base text-ink uppercase tracking-tight">
                  QR Pass Gate Verification
                </h3>
                <p className="font-serif text-xs text-muted truncate max-w-xs">
                  {activeScannerEvent.title}
                </p>
              </div>
              <button
                onClick={() => setActiveScannerEvent(null)}
                className="p-1 border border-ink text-ink hover:bg-ink hover:text-paper cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <EventAttendanceScanner
              eventId={activeScannerEvent.id}
              eventTitle={activeScannerEvent.title}
              onAttendeeScanned={() => {
                setEvents((prev) =>
                  prev.map((e) =>
                    e.id === activeScannerEvent.id
                      ? { ...e, attendanceCount: e.attendanceCount + 1 }
                      : e
                  )
                );
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
