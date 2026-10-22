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
  Filter,
  Download,
  MapPin,
  Users,
  ExternalLink,
  Building2,
  Clock,
  Sparkles,
  RotateCcw,
  X,
  Ticket,
  QrCode,
  FileSpreadsheet,
} from 'lucide-react';
import { EventCreationModal } from '@/features/events/components/event-creation-modal';
import { EventAttendanceScanner } from '@/features/events/components/event-attendance-scanner';

export interface DistrictEventItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  venueName: string;
  venueAddress?: string | null;
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
}

interface DistrictEventsViewProps {
  events: DistrictEventItem[];
}

export function DistrictEventsView({ events }: DistrictEventsViewProps) {
  const [search, setSearch] = React.useState('');
  const [scopeFilter, setScopeFilter] = React.useState('ALL');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [selectedEvent, setSelectedEvent] = React.useState<DistrictEventItem | null>(null);
  const [scanningEvent, setScanningEvent] = React.useState<DistrictEventItem | null>(null);

  const filteredEvents = React.useMemo(() => {
    return events.filter((e) => {
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
      if (scopeFilter === 'DISTRICT' && e.chapter !== null) return false;
      if (scopeFilter === 'CHAPTER' && e.chapter === null) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesVenue = e.venueName.toLowerCase().includes(q);
        const matchesCat = e.category.toLowerCase().includes(q);
        const matchesChapter = e.chapter ? e.chapter.name.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesVenue && !matchesCat && !matchesChapter) return false;
      }
      return true;
    });
  }, [events, search, scopeFilter, statusFilter]);

  // Aggregate Metrics
  const now = new Date();
  const upcomingCount = events.filter((e) => new Date(e.startsAt) >= now).length;
  const totalRegistrations = events.reduce((sum, e) => sum + e.registeredCount, 0);
  const districtWideCount = events.filter((e) => e.chapter === null).length;

  const handleExportCsv = () => {
    const headers = [
      'Event ID',
      'Title',
      'Slug',
      'Category',
      'Scope',
      'Chapter',
      'Venue Name',
      'Venue Address',
      'Capacity',
      'Registered Attendees',
      'Starts At',
      'Ends At',
      'Status',
    ];

    const rows = filteredEvents.map((e) => [
      e.id,
      `"${e.title.replace(/"/g, '""')}"`,
      e.slug,
      e.category,
      e.chapter ? 'CHAPTER' : 'DISTRICT',
      e.chapter ? `"${e.chapter.name}"` : 'ALL DISTRICT',
      `"${e.venueName.replace(/"/g, '""')}"`,
      `"${(e.venueAddress || '').replace(/"/g, '""')}"`,
      e.capacity,
      e.registeredCount,
      e.startsAt,
      e.endsAt,
      e.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MYBF_Malappuram_Events_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setSearch('');
    setScopeFilter('ALL');
    setStatusFilter('ALL');
  };

  const isFiltered = search.trim() !== '' || scopeFilter !== 'ALL' || statusFilter !== 'ALL';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PortalPageHeader
        tag="MALAPPURAM DISTRICT CONCLAVES"
        badge={`${events.length} CONCLAVES`}
        title="District Events & Summits Oversight"
        description="Authoritative tracking of district-wide conclaves and chapter-level youth entrepreneurship workshops."
        actions={
          <div className="flex items-center gap-2">
            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs text-ink/70">
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-8 text-xs font-semibold">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export Events (CSV)
            </Button>
            <EventCreationModal
              defaultScope="DISTRICT"
              allowedScopes={['DISTRICT', 'CHAPTER']}
              triggerButtonText="Create Event"
            />
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PortalStatCard
          label="Total Conclaves"
          value={events.length}
          subValue={`${districtWideCount} District-wide Summits`}
          icon={Calendar}
        />

        <PortalStatCard
          label="Upcoming Schedule"
          value={upcomingCount}
          subValue="Scheduled programs ahead"
          icon={Clock}
        />

        <PortalStatCard
          label="Total Registrations"
          value={totalRegistrations.toLocaleString()}
          subValue="Across all community conclaves"
          icon={Users}
        />

        <PortalStatCard
          label="Fee Policy"
          value="100% Free"
          subValue="Zero dues or ticketing fees"
          icon={Ticket}
        />
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-ink/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search event title, venue, or category..."
                className="w-full pl-9 pr-3 py-1.5 border-2 border-ink bg-paper text-xs text-ink font-serif focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </div>

            {/* Scope Filter */}
            <div>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
                aria-label="Filter by Event Scope"
                className="w-full border-2 border-ink bg-paper px-2.5 py-1.5 text-xs text-ink font-display font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue"
              >
                <option value="ALL">All Event Scopes</option>
                <option value="DISTRICT">District-Wide Only</option>
                <option value="CHAPTER">Chapter-Specific Only</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by Event Status"
                className="w-full border-2 border-ink bg-paper px-2.5 py-1.5 text-xs text-ink font-display font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader className="p-5 pb-3 border-b-2 border-ink flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl font-black font-display uppercase tracking-wider text-ink">Conclaves & Programs Schedule</CardTitle>
            <CardDescription className="text-xs text-ink/70 font-serif mt-1">
              Showing {filteredEvents.length} of {events.length} tracked events
            </CardDescription>
          </div>
          <span className="text-[10px] font-bold text-ink/60 font-mono uppercase bg-paper-sunken border border-ink/20 px-2 py-1">
            Malappuram District (MLP)
          </span>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="border-b-2 border-ink bg-paper-sunken text-ink font-display font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Event Title</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-center">Registrations</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 font-mono text-[11px]">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-ink/50 font-serif italic text-sm">
                      No events match the specified search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((e) => {
                    const pct = e.capacity > 0 ? Math.min(100, Math.round((e.registeredCount / e.capacity) * 100)) : 0;

                    return (
                      <tr key={e.id} className="hover:bg-yellow/10 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-ink font-sans text-xs">
                            {e.title}
                          </div>
                          <div className="text-[10px] text-ink/60 font-serif">
                            {e.category} &bull; {e.eventType}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {e.chapter ? (
                            <Badge variant="secondary" className="text-[10px]">
                              {e.chapter.name}
                            </Badge>
                          ) : (
                            <Badge variant="primary" className="text-[10px]">
                              District-Wide
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-ink font-sans font-medium">
                            {e.venueName}
                          </div>
                          <div className="text-[10px] text-ink/60 truncate max-w-[180px] font-serif">
                            {e.venueAddress}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-ink/70">
                          {e.startsAt.split('T')[0]}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="font-black text-ink text-sm">
                            {e.registeredCount} / {e.capacity}
                          </div>
                          <div className="w-16 mx-auto h-2 bg-paper-sunken border border-ink/20 overflow-hidden mt-1">
                            <div className="h-full bg-blue" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              e.status === 'PUBLISHED'
                                ? 'success'
                                : e.status === 'COMPLETED'
                                ? 'neutral'
                                : 'warning'
                            }
                            className="text-[10px]"
                          >
                            {e.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setScanningEvent(e)}
                              className="h-7 text-[10px] px-2 text-emerald-800 font-semibold"
                              title="Reception QR Check-In Scanner"
                            >
                              <QrCode className="h-3 w-3 mr-1" />
                              Scan
                            </Button>
                            <a
                              href={`/api/v1/events/export?eventId=${e.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Export Attendee Roster (CSV)"
                            >
                              <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 font-semibold">
                                <FileSpreadsheet className="h-3 w-3 mr-1 text-blue" />
                                Roster
                              </Button>
                            </a>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedEvent(e)}
                              className="h-7 text-[10px] px-2 font-semibold"
                            >
                              Details
                            </Button>
                            <a href={`/events/${e.slug}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 text-blue">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl bg-paper border-2 border-ink shadow-[8px_8px_0px_#14161c] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b-2 border-ink flex items-center justify-between bg-paper-sunken">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black font-display uppercase tracking-wider text-ink">
                    {selectedEvent.title}
                  </h3>
                  <Badge variant="primary">{selectedEvent.status}</Badge>
                </div>
                <p className="text-xs text-ink/70 font-serif mt-0.5">
                  Scope: {selectedEvent.chapter ? selectedEvent.chapter.name : 'All 16 Malappuram Chapters'}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="border-2 border-ink p-1 bg-paper text-ink hover:bg-yellow shadow-[1px_1px_0px_#14161c] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-paper border-2 border-ink shadow-[2px_2px_0px_#14161c]">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-ink/60 font-display block">Venue</span>
                  <span className="font-bold text-ink mt-0.5 block font-sans">{selectedEvent.venueName}</span>
                  <span className="text-[10px] text-ink/60 font-serif">{selectedEvent.venueAddress}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-ink/60 font-display block">Schedule</span>
                  <span className="font-bold text-ink mt-0.5 block font-mono">
                    {new Date(selectedEvent.startsAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-ink/60 font-display block">Capacity & Registration</span>
                  <span className="font-bold text-ink mt-0.5 block font-mono">
                    {selectedEvent.registeredCount} / {selectedEvent.capacity} Attendees
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-ink/60 font-display block">Pricing</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block font-display uppercase tracking-wider">
                    100% Free NGO Conclave
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-ink/60 font-display block mb-1">Description</span>
                <p className="text-ink/80 font-serif leading-relaxed">
                  {selectedEvent.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t-2 border-ink bg-paper-sunken flex items-center justify-between">
              <a href={`/events/${selectedEvent.slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open Public Event Page
                </Button>
              </a>
              <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QR Attendance Scanner Modal */}
      {scanningEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl bg-paper border-2 border-ink shadow-[8px_8px_0px_#14161c] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b-2 border-ink flex items-center justify-between bg-paper-sunken">
              <div>
                <h3 className="text-sm font-black font-display uppercase tracking-wider text-ink flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-blue" /> Reception Check-In Scanner
                </h3>
                <p className="text-xs text-ink/60 font-serif mt-0.5">{scanningEvent.title}</p>
              </div>
              <button
                onClick={() => setScanningEvent(null)}
                className="border-2 border-ink p-1 bg-paper text-ink hover:bg-yellow shadow-[1px_1px_0px_#14161c] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <EventAttendanceScanner
                eventId={scanningEvent.id}
                eventTitle={scanningEvent.title}
                capacity={scanningEvent.capacity}
                initialAttendanceCount={scanningEvent.registeredCount}
              />
            </div>
            <div className="p-3 border-t-2 border-ink bg-paper-sunken flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setScanningEvent(null)} className="text-xs">
                Close Scanner
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
