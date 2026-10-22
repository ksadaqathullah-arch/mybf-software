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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="relative w-full max-w-lg bg-paper border-2 border-ink shadow-[8px_8px_0px_#14161c] p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b-2 border-ink">
              <div>
                <h3 className="text-lg font-black font-display uppercase tracking-wider text-ink flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue" /> Schedule Chapter Meeting
                </h3>
                <p className="text-xs text-ink/70 font-serif mt-0.5">
                  Official administrative meetup for {chapterName}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="border-2 border-ink p-1 bg-paper text-ink hover:bg-yellow shadow-[1px_1px_0px_#14161c] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 border-2 border-ink bg-danger/20 text-danger text-xs font-bold">
                {error}
              </div>
            )}

            {successNotice && (
              <div className="mt-4 p-3 border-2 border-ink bg-emerald-100 text-emerald-950 text-xs font-bold">
                {successNotice}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-black font-display uppercase tracking-wider text-ink mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Executive Governance & Review"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-2 border-ink bg-paper px-3 py-2 text-xs text-ink font-serif focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black font-display uppercase tracking-wider text-ink mb-1">
                    Meeting Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border-2 border-ink bg-paper px-3 py-2 text-xs text-ink font-display font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue"
                  >
                    <option value="CHAPTER_EXECUTIVE">Chapter Executive</option>
                    <option value="GENERAL_BODY">General Body</option>
                    <option value="CORE_COMMITTEE">Core Committee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black font-display uppercase tracking-wider text-ink mb-1">
                    Meeting Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border-2 border-ink bg-paper px-3 py-2 text-xs text-ink font-mono focus:outline-none focus:ring-2 focus:ring-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black font-display uppercase tracking-wider text-ink mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-ink/40" /> Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full border-2 border-ink bg-paper px-3 py-2 text-xs text-ink font-mono focus:outline-none focus:ring-2 focus:ring-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black font-display uppercase tracking-wider text-ink mb-1 flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-ink/40" /> Coordinator
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chapter Secretary"
                    value={formData.coordinatorName}
                    onChange={(e) => setFormData({ ...formData, coordinatorName: e.target.value })}
                    className="w-full border-2 border-ink bg-paper px-3 py-2 text-xs text-ink font-serif focus:outline-none focus:ring-2 focus:ring-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black font-display uppercase tracking-wider text-ink mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-ink/40" /> Venue / Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manjeri Chamber Hall / Online Conference"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full border-2 border-ink bg-paper px-3 py-2 text-xs text-ink font-serif focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-black font-display uppercase tracking-wider text-ink mb-1 flex items-center gap-1">
                  <FileText className="h-3 w-3 text-ink/40" /> Agenda / Discussion Points
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline key discussion items, new member introductions, community initiative reviews..."
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  className="w-full border-2 border-ink bg-paper px-3 py-2 text-xs text-ink font-serif focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-ink">
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
