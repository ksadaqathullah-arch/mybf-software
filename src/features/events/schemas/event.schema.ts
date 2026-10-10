import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3, 'Event title must be at least 3 characters').max(150),
  category: z.string().min(2, 'Please specify category (e.g. SUMMIT, WORKSHOP, EXPO)'),
  description: z.string().min(10, 'Please provide an event description'),
  venueName: z.string().min(2, 'Venue name is required'),
  venueAddress: z.string().optional(),
  chapterId: z.string().uuid().optional(),
  eventType: z.enum(['FREE', 'PAID']),
  basePriceINR: z.number().int().min(0).default(0),
  capacity: z.number().int().min(1, 'Capacity must be at least 1 attendee'),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const registerEventSchema = z.object({
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type RegisterEventInput = z.infer<typeof registerEventSchema>;

export const checkInAttendeeSchema = z.object({
  eventId: z.string().uuid(),
  qrToken: z.string().min(10, 'Invalid check-in token format'),
});

export type CheckInAttendeeInput = z.infer<typeof checkInAttendeeSchema>;
