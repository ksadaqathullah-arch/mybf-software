'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Search,
  Download,
  ExternalLink,
  QrCode,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { EventCreationModal } from '@/features/events/components/event-creation-modal';
import { EventAttendanceScanner } from '@/features/events/components/event-attendance-scanner';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-6 w-6 text-[#035AFC]" /> Centralized Multi-Level Event Governance
            </h1>
            <Badge variant="primary">SUPER ADMIN AUTHORITY</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global lifecycle administration for Main Forum Events, Malappuram District Conclaves, and 16 Chapter Workshops
          </p>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Events</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {events.length}
            </div>
            <p className="text-[11px] text-slate-500">Across all 3 tiers</p>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Main Forum</span>
            <div className="text-2xl font-black text-[#035AFC] mt-0.5">
              {mainEventsCount}
            </div>
            <p className="text-[11px] text-slate-500">Central Summits</p>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">District Tier</span>
            <div className="text-2xl font-black text-purple-600 mt-0.5">
              {districtEventsCount}
            </div>
            <p className="text-[11px] text-slate-500">Malappuram District</p>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Chapter Tier</span>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">
              {chapterEventsCount}
            </div>
            <p className="text-[11px] text-slate-500">16 Constituencies</p>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Attendees</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalRegistrations.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold">{totalAdmitted} Admitted</p>
          </CardHeader>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

            <div>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
                aria-label="Filter by Organizational Level"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
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
              <CardTitle className="text-base font-bold">Event Roster & Governance Registry</CardTitle>
              <CardDescription className="text-xs">
                Authoritative event schedule across central, district, and chapter jurisdictions
              </CardDescription>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredEvents.length} of {events.length} events
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4">Level Scope</th>
                  <th className="py-3 px-4">Schedule & Venue</th>
                  <th className="py-3 px-4 text-center">Registrations</th>
                  <th className="py-3 px-4 text-center">Admitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No events match the active search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {e.title}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {e.category} &bull; {e.mode} &bull; {e.eventType === 'FREE' ? 'Free Pass' : `₹${e.basePriceINR}`}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            e.scope === 'MAIN' ? 'primary' : e.scope === 'DISTRICT' ? 'secondary' : 'neutral'
                          }
                          className="text-[10px]"
                        >
                          {e.scope === 'MAIN'
                            ? 'Main Forum'
                            : e.scope === 'DISTRICT'
                            ? 'District'
                            : e.chapter?.name || 'Chapter'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {new Date(e.startsAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {e.venueName}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-[#035AFC]">
                        {e.registeredCount} / {e.capacity}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">
                        {e.attendanceCount}
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
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveScannerEvent(e)}
                            className="h-6 text-[10px] px-2 text-[#035AFC]"
                            title="Open Reception QR Scanner"
                          >
                            <QrCode className="h-3 w-3 mr-1" /> Scan
                          </Button>
                          <a
                            href={`/api/v1/events/export?eventId=${e.id}`}
                            download
                            title="Export Attendee CSV"
                          >
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1.5 text-slate-500">
                              <Download className="h-3 w-3" />
                            </Button>
                          </a>
                          <a
                            href={`/events/${e.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Public Page"
                          >
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1.5 text-slate-500">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* QR Reception Scanner Modal */}
      {activeScannerEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#0B101B] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Reception Check-In Scanner
                </h3>
                <p className="text-xs text-slate-500">{activeScannerEvent.title}</p>
              </div>
              <button
                onClick={() => setActiveScannerEvent(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <EventAttendanceScanner
                eventId={activeScannerEvent.id}
                eventTitle={activeScannerEvent.title}
                initialAttendanceCount={activeScannerEvent.attendanceCount}
                capacity={activeScannerEvent.capacity}
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
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-right">
              <Button variant="outline" size="sm" onClick={() => setActiveScannerEvent(null)} className="text-xs">
                Close Scanner
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
