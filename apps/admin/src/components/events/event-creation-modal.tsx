'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Plus,
  Trash2,
  X,
  Building2,
  Users,
  Save,
} from 'lucide-react';
import { INITIAL_16_CHAPTERS } from '@/constants/founding-chapters';
import { createEventAction } from '@/server/event.actions';
import { EventScope, EventMode, TicketTier, EventSessionInput } from '@/server/event.schema';

interface EventCreationModalProps {
  defaultScope?: EventScope;
  allowedScopes?: EventScope[];
  defaultChapterId?: string | null;
  defaultChapterName?: string;
  triggerButtonText?: string;
  onEventCreated?: (event: any) => void;
}

export function EventCreationModal({
  defaultScope = 'CHAPTER',
  allowedScopes = ['CHAPTER', 'DISTRICT', 'MAIN'],
  defaultChapterId = null,
  defaultChapterName = '',
  triggerButtonText = 'Create Event',
  onEventCreated,
}: EventCreationModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Form State
  const [title, setTitle] = React.useState('');
  const [scope, setScope] = React.useState<EventScope>(defaultScope);
  const [chapterId, setChapterId] = React.useState<string | null>(defaultChapterId);
  const [category, setCategory] = React.useState('SUMMIT');
  const [description, setDescription] = React.useState('');
  const [venueName, setVenueName] = React.useState('');
  const [venueAddress, setVenueAddress] = React.useState('');
  const [mode, setMode] = React.useState<EventMode>('OFFLINE');
  const [eventType, setEventType] = React.useState<'FREE' | 'PAID'>('FREE');
  const [basePriceINR, setBasePriceINR] = React.useState(0);
  const [capacity, setCapacity] = React.useState(200);
  const [startsAt, setStartsAt] = React.useState('');
  const [endsAt, setEndsAt] = React.useState('');
  const [organizerName, setOrganizerName] = React.useState('');
  const [organizerEmail, setOrganizerEmail] = React.useState('');

  // Ticket Tiers
  const [ticketTiers, setTicketTiers] = React.useState<TicketTier[]>([
    {
      id: 'tier_standard',
      name: 'Free Youth Pass',
      description: '100% Free NGO community admission',
      priceINR: 0,
      capacity: 200,
      bookedCount: 0,
      eligibility: 'ALL_MEMBERS',
    },
  ]);

  // Program Sessions
  const [sessions, setSessions] = React.useState<EventSessionInput[]>([]);

  // Reset form
  const resetForm = () => {
    setTitle('');
    setScope(defaultScope);
    setChapterId(defaultChapterId);
    setCategory('SUMMIT');
    setDescription('');
    setVenueName('');
    setVenueAddress('');
    setMode('OFFLINE');
    setEventType('FREE');
    setBasePriceINR(0);
    setCapacity(200);
    setStartsAt('');
    setEndsAt('');
    setOrganizerName('');
    setOrganizerEmail('');
    setTicketTiers([
      {
        id: 'tier_standard',
        name: 'Free Youth Pass',
        description: '100% Free NGO community admission',
        priceINR: 0,
        capacity: 200,
        bookedCount: 0,
        eligibility: 'ALL_MEMBERS',
      },
    ]);
    setSessions([]);
    setErrorMessage(null);
  };

  const handleAddTier = () => {
    const newId = `tier_${Date.now()}`;
    setTicketTiers((prev) => [
      ...prev,
      {
        id: newId,
        name: 'VIP Delegate Pass',
        description: 'Priority front-row seating and networking session',
        priceINR: eventType === 'PAID' ? 500 : 0,
        capacity: 50,
        bookedCount: 0,
        eligibility: 'ALL_MEMBERS',
      },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    if (ticketTiers.length <= 1) return;
    setTicketTiers((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddSession = () => {
    setSessions((prev) => [
      ...prev,
      {
        title: 'Keynote Address & Panel Discussion',
        speakerName: 'Industry Leader',
        startsAt: startsAt || new Date().toISOString(),
        endsAt: endsAt || new Date().toISOString(),
      },
    ]);
  };

  const handleRemoveSession = (index: number) => {
    setSessions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    if (!startsAt || !endsAt) {
      setErrorMessage('Please select both start and end dates.');
      setIsSubmitting(false);
      return;
    }

    if (new Date(endsAt) <= new Date(startsAt)) {
      setErrorMessage('Event end time must be after the start time.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await createEventAction({
        title,
        scope,
        category,
        description,
        venueName,
        venueAddress,
        mode,
        eventType,
        basePriceINR: eventType === 'PAID' ? basePriceINR : 0,
        capacity,
        startsAt,
        endsAt,
        chapterId: scope === 'CHAPTER' ? chapterId : null,
        organizerName,
        organizerEmail,
        ticketTiers,
        sessions,
        status: 'PUBLISHED',
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to create event.');
      }

      setIsOpen(false);
      resetForm();
      onEventCreated?.(res.event);
    } catch (err: any) {
      setErrorMessage(err.message || 'Event creation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setIsOpen(true)} className="h-8 text-xs font-semibold">
        <Plus className="h-3.5 w-3.5 mr-1" /> {triggerButtonText}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0B101B] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Create MYBF Event / Conclave
                  </h3>
                  <Badge variant="primary">{scope} LEVEL</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Universal event creation supporting Central Forum, District Conclaves, and Chapter Workshops
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Title & Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Event Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Malappuram Youth Startup Conclave 2026"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#035AFC]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Jurisdiction Level
                  </label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as EventScope)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white"
                  >
                    {allowedScopes.includes('CHAPTER') && <option value="CHAPTER">Chapter Event</option>}
                    {allowedScopes.includes('DISTRICT') && <option value="DISTRICT">District Event</option>}
                    {allowedScopes.includes('MAIN') && <option value="MAIN">Main Forum Event</option>}
                  </select>
                </div>
              </div>

              {/* Chapter selector if Chapter Event */}
              {scope === 'CHAPTER' && (
                <div className="space-y-1 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-[#035AFC]" /> Owning Constituency Chapter
                  </label>
                  {defaultChapterName ? (
                    <div className="font-bold text-slate-900 dark:text-white">{defaultChapterName}</div>
                  ) : (
                    <select
                      value={chapterId || ''}
                      onChange={(e) => setChapterId(e.target.value || null)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white"
                    >
                      <option value="">Select Chapter...</option>
                      {INITIAL_16_CHAPTERS.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Category, Mode, Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white"
                  >
                    <option value="SUMMIT">Summit / Conclave</option>
                    <option value="WORKSHOP">Workshop / Bootcamp</option>
                    <option value="NETWORKING">Networking Session</option>
                    <option value="SEMINAR">Seminar</option>
                    <option value="EXPO">Business Expo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as EventMode)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white"
                  >
                    <option value="OFFLINE">In-Person (Offline)</option>
                    <option value="ONLINE">Online (Virtual)</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Ticketing Policy</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white"
                  >
                    <option value="FREE">100% Free NGO Pass (₹0)</option>
                    <option value="PAID">Paid Ticketed Event</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Event Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the agenda, topics, target audience, and youth takeaways..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#035AFC]"
                />
              </div>

              {/* Venue & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Venue Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. Trade Center Auditorium"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Max Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 100)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Venue Address */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Venue Address</label>
                <input
                  type="text"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  placeholder="e.g. Court Road, Down Hill, Malappuram - 676505"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Starts At <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Ends At <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Ticket Tiers Editor */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-[#035AFC]" /> Configurable Ticket Tiers
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddTier} className="h-6 text-[10px] px-2">
                    <Plus className="h-2.5 w-2.5 mr-1" /> Add Tier
                  </Button>
                </div>

                <div className="space-y-2">
                  {ticketTiers.map((tier, idx) => (
                    <div
                      key={tier.id || idx}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                    >
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTicketTiers((prev) =>
                            prev.map((t, i) => (i === idx ? { ...t, name: val } : t))
                          );
                        }}
                        placeholder="Tier Name (e.g. VIP)"
                        className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs"
                      />
                      <input
                        type="number"
                        min={0}
                        value={tier.priceINR}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          setTicketTiers((prev) =>
                            prev.map((t, i) => (i === idx ? { ...t, priceINR: val } : t))
                          );
                        }}
                        placeholder="Price INR"
                        className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs"
                      />
                      <input
                        type="number"
                        min={1}
                        value={tier.capacity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 10;
                          setTicketTiers((prev) =>
                            prev.map((t, i) => (i === idx ? { ...t, capacity: val } : t))
                          );
                        }}
                        placeholder="Capacity"
                        className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs"
                      />
                      <div className="flex items-center justify-end">
                        {ticketTiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(idx)}
                            className="p-1 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sessions Editor */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#035AFC]" /> Program Schedule & Sessions (Optional)
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddSession} className="h-6 text-[10px] px-2">
                    <Plus className="h-2.5 w-2.5 mr-1" /> Add Session
                  </Button>
                </div>

                {sessions.map((sess, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center"
                  >
                    <input
                      type="text"
                      value={sess.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSessions((prev) =>
                          prev.map((s, i) => (i === idx ? { ...s, title: val } : s))
                        );
                      }}
                      placeholder="Session Title"
                      className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs sm:col-span-2"
                    />
                    <div className="flex items-center justify-between gap-1">
                      <input
                        type="text"
                        value={sess.speakerName || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSessions((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, speakerName: val } : s))
                          );
                        }}
                        placeholder="Speaker Name"
                        className="flex-1 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSession(idx)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="text-xs font-semibold">
                  <Save className="h-3.5 w-3.5 mr-1" />
                  {isSubmitting ? 'Publishing Event...' : 'Publish Event'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
