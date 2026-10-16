'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, FileText, UserCheck, X } from 'lucide-react';

interface ScheduleMeetingDialogProps {
  chapterSlug: string;
  chapterName: string;
  onMeetingScheduled?: () => void;
}

export function ScheduleMeetingDialog({
  chapterSlug,
  chapterName,
  onMeetingScheduled,
}: ScheduleMeetingDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successNotice, setSuccessNotice] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    title: '',
    type: 'CHAPTER_EXECUTIVE',
    date: new Date().toISOString().split('T')[0],
    time: '19:30',
    venue: `${chapterName} Town Hall / Boardroom`,
    agenda: '',
    coordinatorName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/chapters/${chapterSlug}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to schedule meeting.');
      }

      setSuccessNotice(`Meeting "${formData.title}" scheduled successfully!`);
      setTimeout(() => {
        setSuccessNotice(null);
        setIsOpen(false);
        if (onMeetingScheduled) onMeetingScheduled();
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error scheduling meeting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <Calendar className="h-4 w-4 mr-1.5" /> Schedule Meeting
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#035AFC]" /> Schedule Chapter Meeting
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official administrative meetup for {chapterName}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                {error}
              </div>
            )}

            {successNotice && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
                {successNotice}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Executive Governance & Review"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                  >
                    <option value="CHAPTER_EXECUTIVE">Chapter Executive</option>
                    <option value="GENERAL_BODY">General Body</option>
                    <option value="CORE_COMMITTEE">Core Committee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" /> Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-slate-400" /> Coordinator
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chapter Secretary"
                    value={formData.coordinatorName}
                    onChange={(e) => setFormData({ ...formData, coordinatorName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" /> Venue / Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manjeri Chamber Hall / Online Conference"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <FileText className="h-3 w-3 text-slate-400" /> Agenda / Discussion Points
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline key discussion items, new member introductions, community initiative reviews..."
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Scheduling...' : 'Save & Publish Meeting'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
