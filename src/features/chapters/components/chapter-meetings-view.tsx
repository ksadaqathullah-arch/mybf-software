'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Check,
} from 'lucide-react';
import { ScheduleMeetingDialog } from './schedule-meeting-dialog';

export interface MeetingItem {
  id: string;
  title: string;
  type: string;
  scheduledAt: string;
  venue: string;
  agenda: string | null;
  minutes: {
    summary: string;
    decisions: string;
  } | null;
  actionItems: Array<{
    id: string;
    title: string;
    assigneeName: string;
    dueDate: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  }>;
}

export interface EventItem {
  id: string;
  title: string;
  category: string;
  startsAt: string;
  venueName: string;
  capacity: number;
  registeredCount: number;
  status: string;
}

interface ChapterMeetingsViewProps {
  initialMeetings: MeetingItem[];
  events: EventItem[];
  chapterSlug: string;
  chapterName: string;
}

export function ChapterMeetingsView({
  initialMeetings,
  events,
  chapterSlug,
  chapterName,
}: ChapterMeetingsViewProps) {
  const [meetings, setMeetings] = React.useState<MeetingItem[]>(initialMeetings);
  const [statusNotice, setStatusNotice] = React.useState<string | null>(null);

  const now = new Date();
  const upcomingMeetings = meetings.filter((m) => new Date(m.scheduledAt) >= now);
  const pastMeetings = meetings.filter((m) => new Date(m.scheduledAt) < now);

  const handleToggleActionItem = async (actionItemId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const res = await fetch(`/api/v1/chapters/${chapterSlug}/action-items/${actionItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update action item');
      }

      setMeetings((prev) =>
        prev.map((m) => ({
          ...m,
          actionItems: m.actionItems.map((ai) =>
            ai.id === actionItemId ? { ...ai, status: nextStatus as any } : ai
          ),
        }))
      );
      setStatusNotice(`Task status updated to ${nextStatus}`);
      setTimeout(() => setStatusNotice(null), 3000);
    } catch {
      // Local fallback toggle
      setMeetings((prev) =>
        prev.map((m) => ({
          ...m,
          actionItems: m.actionItems.map((ai) =>
            ai.id === actionItemId ? { ...ai, status: nextStatus as any } : ai
          ),
        }))
      );
    }
  };

  return (
    <div className="space-y-6">
      {statusNotice && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
          {statusNotice}
        </div>
      )}

      {/* Upcoming Chapter Meetings */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-6 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#035AFC]" /> Scheduled & Upcoming Meetups
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Official governance and executive sessions for {chapterName}
            </CardDescription>
          </div>
          <ScheduleMeetingDialog
            chapterSlug={chapterSlug}
            chapterName={chapterName}
          />
        </CardHeader>
        <CardContent className="p-6 pt-2 space-y-4">
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <p>No upcoming meetings scheduled for this chapter.</p>
              <div className="mt-3">
                <ScheduleMeetingDialog chapterSlug={chapterSlug} chapterName={chapterName} />
              </div>
            </div>
          ) : (
            upcomingMeetings.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.title}</h4>
                      <Badge variant="primary" className="text-[10px]">
                        {m.type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        <Clock className="h-3.5 w-3.5 text-[#035AFC]" />
                        {new Date(m.scheduledAt).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" /> {m.venue}
                      </span>
                    </div>
                  </div>
                </div>

                {m.agenda && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[10px] uppercase mb-0.5">
                      Agenda & Discussion Points
                    </span>
                    {m.agenda}
                  </div>
                )}

                {/* Action Items List */}
                {m.actionItems.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Assigned Action Items & Quorum Tasks
                    </span>
                    <div className="space-y-1.5">
                      {m.actionItems.map((ai) => (
                        <div
                          key={ai.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleActionItem(ai.id, ai.status)}
                              className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                                ai.status === 'COMPLETED'
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 hover:border-slate-400'
                              }`}
                            >
                              {ai.status === 'COMPLETED' && <Check className="h-3 w-3" />}
                            </button>
                            <span
                              className={
                                ai.status === 'COMPLETED'
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-800 dark:text-slate-200'
                              }
                            >
                              {ai.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3" /> {ai.assigneeName}
                            </span>
                            <Badge
                              variant={ai.status === 'COMPLETED' ? 'success' : 'warning'}
                              className="text-[9px]"
                            >
                              {ai.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Chapter Events & Business Summits */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#FBC206]" /> Chapter Events & Business Summits
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Free youth summits and regional meetups conducted in {chapterName}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          {events.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No public events published for {chapterName} yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 dark:text-white">{evt.title}</h5>
                    <Badge variant="primary" className="text-[10px]">
                      {evt.category}
                    </Badge>
                  </div>
                  <div className="text-slate-500 text-[11px] flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> {evt.venueName}
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">
                      {new Date(evt.startsAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="font-semibold text-emerald-600">
                      {evt.registeredCount} / {evt.capacity} Registered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
