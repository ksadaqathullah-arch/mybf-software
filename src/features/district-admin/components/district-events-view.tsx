'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
      e.chapter ? 'Chapter-specific' : 'District-wide',
      e.chapter ? `"${e.chapter.name}"` : 'All Malappuram Chapters',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-6 w-6 text-[#035AFC]" /> District Events & Summits Oversight
            </h1>
            <Badge variant="primary">{events.length} CONCLAVES</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative tracking of district-wide conclaves and chapter-level youth entrepreneurship workshops
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs text-slate-500">
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
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Conclaves</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {events.length}
            </div>
            <p className="text-[11px] text-slate-500">{districtWideCount} District-wide Summits</p>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Upcoming Schedule</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {upcomingCount}
            </div>
            <p className="text-[11px] text-slate-500">Scheduled programs ahead</p>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Registrations</span>
            <div className="text-2xl font-black text-[#035AFC] mt-1">
              {totalRegistrations.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500">Across all community conclaves</p>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Fee Policy</span>
            <div className="text-2xl font-black text-amber-500 mt-1">
              100% Free
            </div>
            <p className="text-[11px] text-slate-500">Zero dues or ticketing fees</p>
          </CardHeader>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search event title, venue, or category..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#035AFC]"
              />
            </div>

            {/* Scope Filter */}
            <div>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
                aria-label="Filter by Event Scope"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
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
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
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
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Conclaves & Programs Schedule</CardTitle>
              <CardDescription className="text-xs">
                Showing {filteredEvents.length} of {events.length} tracked events
              </CardDescription>
            </div>
            <span className="text-xs text-slate-400 font-mono">Malappuram District (MLP)</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 font-semibold uppercase text-[10px]">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No events match the specified search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((e) => {
                    const pct = e.capacity > 0 ? Math.min(100, Math.round((e.registeredCount / e.capacity) * 100)) : 0;

                    return (
                      <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {e.title}
                          </div>
                          <div className="text-[10px] text-slate-400">
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
                          <div className="text-slate-700 dark:text-slate-300 font-medium">
                            {e.venueName}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                            {e.venueAddress}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {e.startsAt.split('T')[0]}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="font-extrabold text-[#035AFC]">
                            {e.registeredCount} / {e.capacity}
                          </div>
                          <div className="w-16 mx-auto h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-[#035AFC] rounded-full" style={{ width: `${pct}%` }} />
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
                              className="h-7 text-[10px] px-2 text-emerald-600 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 font-medium"
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
                              <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 font-medium">
                                <FileSpreadsheet className="h-3 w-3 mr-1 text-[#035AFC]" />
                                Roster
                              </Button>
                            </a>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedEvent(e)}
                              className="h-7 text-[10px] px-2 font-medium"
                            >
                              Details
                            </Button>
                            <a href={`/events/${e.slug}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 text-[#035AFC]">
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
          <div className="w-full max-w-xl bg-white dark:bg-[#0B101B] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedEvent.title}
                  </h3>
                  <Badge variant="primary">{selectedEvent.status}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scope: {selectedEvent.chapter ? selectedEvent.chapter.name : 'All 16 Malappuram Chapters'}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Venue</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{selectedEvent.venueName}</span>
                  <span className="text-[10px] text-slate-400">{selectedEvent.venueAddress}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Schedule</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {new Date(selectedEvent.startsAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Capacity & Registration</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {selectedEvent.registeredCount} / {selectedEvent.capacity} Attendees
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Pricing</span>
                  <span className="font-semibold text-emerald-600 mt-0.5 block">
                    100% Free NGO Conclave
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedEvent.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
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
          <div className="w-full max-w-xl bg-white dark:bg-[#0B101B] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-[#035AFC]" /> Reception Check-In Scanner
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{scanningEvent.title}</p>
              </div>
              <button
                onClick={() => setScanningEvent(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex justify-end">
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
