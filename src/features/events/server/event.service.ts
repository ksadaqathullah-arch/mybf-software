import 'server-only';
import { db } from '@/server/db';
import crypto from 'crypto';
import { CreateEventInput, RegisterEventInput, CheckInAttendeeInput } from '../schemas/event.schema';
import { assertAuthorized } from '@/server/auth/policy';
import { AuthActor } from '@/server/auth/types';

export class EventService {
  /**
   * Create an event (Chapter or District level)
   */
  static async createEvent(actor: AuthActor, organizationId: string, input: CreateEventInput) {
    assertAuthorized({
      actor,
      action: 'event.create',
      resource: 'event',
      chapterId: input.chapterId,
      organizationId,
    });

    const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    return await db.event.create({
      data: {
        organizationId,
        chapterId: input.chapterId,
        title: input.title,
        slug,
        category: input.category,
        description: input.description,
        venueName: input.venueName,
        venueAddress: input.venueAddress,
        eventType: input.eventType,
        basePriceINR: input.basePriceINR,
        capacity: input.capacity,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        status: 'PUBLISHED',
      },
    });
  }

  /**
   * Register for an event with concurrency and capacity guard
   */
  static async registerForEvent(input: RegisterEventInput) {
    return await db.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: input.eventId },
      });

      if (!event || event.status !== 'PUBLISHED') {
        throw new Error('Event is not open for registration.');
      }

      if (event.registeredCount >= event.capacity) {
        throw new Error('Registration capacity has been reached for this event.');
      }

      const existingReg = await tx.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId: input.userId,
          },
        },
      });

      if (existingReg) {
        return existingReg; // Idempotent registration return
      }

      const qrToken = `EVT-${crypto.randomBytes(12).toString('hex')}`;

      const registration = await tx.eventRegistration.create({
        data: {
          eventId: input.eventId,
          userId: input.userId,
          qrToken,
          status: 'CONFIRMED',
        },
      });

      // Increment registered count safely
      await tx.event.update({
        where: { id: input.eventId },
        data: {
          registeredCount: { increment: 1 },
        },
      });

      return registration;
    });
  }

  /**
   * Idempotent check-in scan
   * If scanned multiple times, it returns existing attendance record without duplicate counting
   */
  static async checkInAttendee(actor: AuthActor, input: CheckInAttendeeInput) {
    assertAuthorized({
      actor,
      action: 'event.checkin',
      resource: 'attendance',
    });

    return await db.$transaction(async (tx) => {
      const registration = await tx.eventRegistration.findUnique({
        where: { qrToken: input.qrToken },
        include: {
          user: { include: { profile: true } },
          event: true,
        },
      });

      if (!registration || registration.eventId !== input.eventId) {
        throw new Error('Invalid ticket or wrong event registration token.');
      }

      // Check existing attendance for idempotency
      const existingRecord = await tx.attendanceRecord.findUnique({
        where: { registrationId: registration.id },
      });

      if (existingRecord) {
        return {
          alreadyCheckedIn: true,
          scannedAt: existingRecord.scannedAt,
          attendeeName: registration.user.profile?.fullName || registration.user.email,
          message: 'Attendee has already been admitted.',
        };
      }

      // Record first check-in
      const newRecord = await tx.attendanceRecord.create({
        data: {
          eventId: input.eventId,
          registrationId: registration.id,
          userId: registration.userId,
          scannedById: actor.userId,
          method: 'QR_SCAN',
        },
      });

      return {
        alreadyCheckedIn: false,
        scannedAt: newRecord.scannedAt,
        attendeeName: registration.user.profile?.fullName || registration.user.email,
        message: 'Check-in successful! Welcome to the MYBF event.',
      };
    });
  }
}
