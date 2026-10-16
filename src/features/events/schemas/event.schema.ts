import { z } from 'zod';

export const EventScopeEnum = z.enum(['MAIN', 'DISTRICT', 'CHAPTER']);
export type EventScope = z.infer<typeof EventScopeEnum>;

export const EventModeEnum = z.enum(['OFFLINE', 'ONLINE', 'HYBRID']);
export type EventMode = z.infer<typeof EventModeEnum>;

export const EventStatusEnum = z.enum([
  'DRAFT',
  'SUBMITTED_FOR_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'REGISTRATION_OPEN',
  'REGISTRATION_CLOSED',
  'COMPLETED',
  'CANCELLED',
]);
export type EventStatus = z.infer<typeof EventStatusEnum>;

export const ticketTierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Ticket tier name is required'),
  description: z.string().optional(),
  priceINR: z.number().int().min(0, 'Price must be non-negative').default(0),
  capacity: z.number().int().min(1, 'Tier capacity must be at least 1'),
  bookedCount: z.number().int().min(0).default(0),
  eligibility: z.string().optional().default('ALL_MEMBERS'),
});
export type TicketTier = z.infer<typeof ticketTierSchema>;

export const eventSessionSchema = z.object({
  title: z.string().min(2, 'Session title required'),
  speakerName: z.string().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
});
export type EventSessionInput = z.infer<typeof eventSessionSchema>;

export const eventSpeakerSchema = z.object({
  name: z.string().min(2, 'Speaker name required'),
  role: z.string().optional(),
  company: z.string().optional(),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
});
export type EventSpeakerInput = z.infer<typeof eventSpeakerSchema>;

export const eventSponsorSchema = z.object({
  name: z.string().min(2, 'Sponsor name required'),
  tier: z.string().default('PARTNER'),
  logoUrl: z.string().optional(),
});
export type EventSponsorInput = z.infer<typeof eventSponsorSchema>;

export const createEventSchema = z.object({
  title: z.string().min(3, 'Event title must be at least 3 characters').max(150),
  slug: z.string().optional(),
  scope: EventScopeEnum.default('CHAPTER'),
  category: z.string().min(2, 'Please specify category (e.g. SUMMIT, WORKSHOP, NETWORKING, CONCLAVE)'),
  description: z.string().optional().default(''),
  venueName: z.string().min(2, 'Venue name is required'),
  venueAddress: z.string().optional(),
  mode: EventModeEnum.default('OFFLINE'),
  timezone: z.string().default('Asia/Kolkata'),
  chapterId: z.string().uuid().optional().nullable(),
  organizerName: z.string().optional(),
  organizerEmail: z.string().email().optional().or(z.literal('')),
  organizerPhone: z.string().optional(),
  eventType: z.enum(['FREE', 'PAID']).default('FREE'),
  basePriceINR: z.number().int().min(0).default(0),
  capacity: z.number().int().min(1, 'Capacity must be at least 1 attendee'),
  startsAt: z.string(),
  endsAt: z.string(),
  regOpensAt: z.string().optional().nullable(),
  regClosesAt: z.string().optional().nullable(),
  bannerUrl: z.string().optional().nullable(),
  ticketTiers: z.array(ticketTierSchema).optional().default([]),
  sessions: z.array(eventSessionSchema).optional().default([]),
  speakers: z.array(eventSpeakerSchema).optional().default([]),
  sponsors: z.array(eventSponsorSchema).optional().default([]),
  status: EventStatusEnum.default('PUBLISHED'),
});
export type CreateEventInput = z.input<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.partial().extend({
  id: z.string().uuid(),
});
export type UpdateEventInput = z.input<typeof updateEventSchema>;

export const registerEventSchema = z.object({
  eventId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  ticketTierId: z.string().optional(),
  ticketTierName: z.string().optional().default('Free Admission'),
  guestFullName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  throwOnDuplicate: z.boolean().optional().default(false),
});
export type RegisterEventInput = z.input<typeof registerEventSchema>;

export const checkInAttendeeSchema = z.object({
  eventId: z.string().uuid(),
  qrToken: z.string().min(5, 'Invalid check-in token format'),
});
export type CheckInAttendeeInput = z.input<typeof checkInAttendeeSchema>;
