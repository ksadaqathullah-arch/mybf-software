import 'server-only';
import { db } from '@/server/db';
import crypto from 'crypto';
import type { Prisma } from '@prisma/client';
import {
  CreateEventInput,
  RegisterEventInput,
  CheckInAttendeeInput,
  EventScope,
  TicketTier,
} from './event.schema';
import { AuthActor } from './types';

export interface EventQueryParams {
  scope?: string;
  chapterId?: string;
  chapterSlug?: string;
  category?: string;
  status?: string;
  search?: string;
  upcomingOnly?: boolean;
  page?: number;
  pageSize?: number;
}

async function resolveAuditActorId(actorUserId?: string | null): Promise<string | null> {
  if (!actorUserId) return null;
  const user = await db.user.findUnique({ where: { id: actorUserId }, select: { id: true } });
  return user ? user.id : null;
}

export class EventService {
  /**
   * Asserts actor has permission to create/manage events at the specified organizational level
   */
  static assertCanManageEvent(actor: AuthActor, scope: EventScope, chapterId?: string | null) {
    if (!actor || actor.status !== 'ACTIVE') {
      const err = new Error('Unauthorized: Active authentication required.');
      (err as any).statusCode = 401;
      throw err;
    }

    const isSuperAdmin = actor.roles.includes('SUPER_ADMIN');
    const isDistrictAdmin = actor.roles.includes('DISTRICT_ADMIN');
    const isChapterOfficer = actor.roles.some((r) =>
      ['CHAPTER_PRESIDENT', 'CHAPTER_SECRETARY', 'CHAPTER_TREASURER', 'CHAPTER_OFFICER', 'COORDINATOR'].includes(r)
    );

    // Super Admin has global authority across all levels
    if (isSuperAdmin) {
      return true;
    }

    if (scope === 'MAIN') {
      const err = new Error('Forbidden: Only Super Administrators can manage Central Forum Main Events.');
      (err as any).statusCode = 403;
      throw err;
    }

    if (scope === 'DISTRICT') {
      if (!isDistrictAdmin) {
        const err = new Error('Forbidden: District Administrator credentials required for District-level events.');
        (err as any).statusCode = 403;
        throw err;
      }
      return true;
    }

    if (scope === 'CHAPTER') {
      if (isDistrictAdmin) {
        return true; // District Admins can manage / oversee chapter events
      }

      if (isChapterOfficer) {
        if (!chapterId || actor.chapterId !== chapterId) {
          const err = new Error('Forbidden: Cross-chapter access denied. Chapter officers may only manage their assigned constituency events.');
          (err as any).statusCode = 403;
          throw err;
        }
        return true;
      }

      const err = new Error('Forbidden: Chapter Officer privileges required to manage chapter events.');
      (err as any).statusCode = 403;
      throw err;
    }

    const err = new Error('Forbidden: Unauthorized event management operation.');
    (err as any).statusCode = 403;
    throw err;
  }

  /**
   * Asserts actor has scanning / check-in authority for an event
   */
  static async assertCanCheckIn(actor: AuthActor, eventId: string) {
    if (!actor || actor.status !== 'ACTIVE') {
      const err = new Error('Unauthorized: Authentication required to perform attendee check-in.');
      (err as any).statusCode = 401;
      throw err;
    }

    if (actor.roles.includes('SUPER_ADMIN') || actor.roles.includes('DISTRICT_ADMIN')) {
      return true;
    }

    const event = await db.event.findUnique({
      where: { id: eventId },
      select: { chapterId: true },
    });

    if (!event) {
      const err = new Error('Event not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    if (event.chapterId && actor.chapterId === event.chapterId) {
      return true;
    }

    const err = new Error('Forbidden: You do not have check-in authority for this event.');
    (err as any).statusCode = 403;
    throw err;
  }

  /**
   * Create an event at MAIN, DISTRICT, or CHAPTER level
   */
  static async createEvent(actor: AuthActor, input: CreateEventInput) {
    const org = await db.organization.findFirst();
    if (!org) {
      throw new Error('Organization not found in database.');
    }

    const scope: EventScope = input.scope || 'CHAPTER';
    this.assertCanManageEvent(actor, scope, input.chapterId);

    // Resolve slug
    const baseSlug = input.slug?.trim() || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = baseSlug;
    const existingSlug = await db.event.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Default ticket tiers if none provided
    const defaultTiers: TicketTier[] =
      input.ticketTiers && input.ticketTiers.length > 0
        ? input.ticketTiers.map((t, idx) => ({
            id: t.id || `tier_${idx + 1}`,
            name: t.name,
            description: t.description,
            priceINR: t.priceINR ?? 0,
            capacity: t.capacity,
            bookedCount: t.bookedCount ?? 0,
            eligibility: t.eligibility || 'ALL_MEMBERS',
          }))
        : [
            {
              id: 'tier_free_admission',
              name: input.eventType === 'PAID' ? 'Standard Admission' : 'Free Youth Pass',
              description: input.eventType === 'PAID' ? 'Standard conference admission' : '100% Free Community Pass',
              priceINR: input.basePriceINR || 0,
              capacity: input.capacity,
              bookedCount: 0,
              eligibility: 'ALL_MEMBERS',
            },
          ];

    const event = await db.event.create({
      data: {
        organizationId: org.id,
        chapterId: scope === 'CHAPTER' ? input.chapterId : null,
        scope,
        title: input.title,
        slug,
        category: input.category,
        description: input.description || '',
        venueName: input.venueName,
        venueAddress: input.venueAddress || null,
        mode: input.mode,
        timezone: input.timezone || 'Asia/Kolkata',
        eventType: input.eventType,
        basePriceINR: input.basePriceINR,
        capacity: input.capacity,
        registeredCount: 0,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        regOpensAt: input.regOpensAt ? new Date(input.regOpensAt) : null,
        regClosesAt: input.regClosesAt ? new Date(input.regClosesAt) : null,
        status: (input.status || 'PUBLISHED') as any,
        bannerUrl: input.bannerUrl || null,
        organizerName: input.organizerName || null,
        organizerEmail: input.organizerEmail || null,
        organizerPhone: input.organizerPhone || null,
        ticketTiersJson: defaultTiers as any,
        speakersJson: (input.speakers || []) as any,
        sponsorsJson: (input.sponsors || []) as any,
        sessions: {
          create: (input.sessions || []).map((s) => ({
            title: s.title,
            speakerName: s.speakerName || null,
            startsAt: new Date(s.startsAt),
            endsAt: new Date(s.endsAt),
          })),
        },
      },
      include: {
        chapter: { select: { id: true, name: true, code: true, slug: true } },
        sessions: true,
      },
    });

    // Immutable audit log
    const auditActorId = await resolveAuditActorId(actor.userId);
    await db.auditEvent.create({
      data: {
        actorId: auditActorId,
        actorEmail: actor.email,
        action: 'EVENT_CREATED',
        resource: 'Event',
        resourceId: event.id,
        organizationId: org.id,
        chapterId: event.chapterId,
        diffJson: {
          title: event.title,
          scope: event.scope,
          eventType: event.eventType,
          capacity: event.capacity,
        },
      },
    });

    return event;
  }

  /**
   * Update an existing event with ownership validation
   */
  static async updateEvent(actor: AuthActor, eventId: string, input: Partial<CreateEventInput>) {
    const existing = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!existing) {
      const err = new Error('Event not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    this.assertCanManageEvent(actor, existing.scope as EventScope, existing.chapterId);

    const updateData: Prisma.EventUpdateInput = {};

    if (input.title) updateData.title = input.title;
    if (input.description) updateData.description = input.description;
    if (input.category) updateData.category = input.category;
    if (input.venueName) updateData.venueName = input.venueName;
    if (input.venueAddress !== undefined) updateData.venueAddress = input.venueAddress;
    if (input.mode) updateData.mode = input.mode;
    if (input.capacity !== undefined) updateData.capacity = input.capacity;
    if (input.eventType) updateData.eventType = input.eventType;
    if (input.basePriceINR !== undefined) updateData.basePriceINR = input.basePriceINR;
    if (input.status) updateData.status = input.status as any;
    if (input.bannerUrl !== undefined) updateData.bannerUrl = input.bannerUrl;
    if (input.organizerName !== undefined) updateData.organizerName = input.organizerName;
    if (input.organizerEmail !== undefined) updateData.organizerEmail = input.organizerEmail;
    if (input.organizerPhone !== undefined) updateData.organizerPhone = input.organizerPhone;
    if (input.startsAt) updateData.startsAt = new Date(input.startsAt);
    if (input.endsAt) updateData.endsAt = new Date(input.endsAt);
    if (input.regOpensAt !== undefined) updateData.regOpensAt = input.regOpensAt ? new Date(input.regOpensAt) : null;
    if (input.regClosesAt !== undefined) updateData.regClosesAt = input.regClosesAt ? new Date(input.regClosesAt) : null;
    if (input.ticketTiers) updateData.ticketTiersJson = input.ticketTiers as any;
    if (input.speakers) updateData.speakersJson = input.speakers as any;
    if (input.sponsors) updateData.sponsorsJson = input.sponsors as any;

    const updated = await db.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        chapter: { select: { id: true, name: true, code: true, slug: true } },
        sessions: true,
      },
    });

    await db.auditEvent.create({
      data: {
        actorId: actor.userId,
        actorEmail: actor.email,
        action: 'EVENT_UPDATED',
        resource: 'Event',
        resourceId: eventId,
        chapterId: updated.chapterId,
        diffJson: { updatedFields: Object.keys(updateData) },
      },
    });

    return updated;
  }

  /**
   * Transition event state (Approve, Publish, Cancel)
   */
  static async setEventStatus(actor: AuthActor, eventId: string, status: string, reason?: string) {
    const existing = await db.event.findUnique({ where: { id: eventId } });
    if (!existing) {
      const err = new Error('Event not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    this.assertCanManageEvent(actor, existing.scope as EventScope, existing.chapterId);

    const updated = await db.event.update({
      where: { id: eventId },
      data: { status: status as any },
    });

    const auditActorId = await resolveAuditActorId(actor.userId);
    await db.auditEvent.create({
      data: {
        actorId: auditActorId,
        actorEmail: actor.email,
        action: `EVENT_STATUS_${status}`,
        resource: 'Event',
        resourceId: eventId,
        diffJson: { previousStatus: existing.status, newStatus: status, reason },
      },
    });

    return updated;
  }

  /**
   * Fetch paginated list of events with multi-level filtering
   */
  static async getEvents(params: EventQueryParams = {}) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(5, params.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const where: Prisma.EventWhereInput = {};

    if (params.scope && params.scope !== 'ALL') {
      where.scope = params.scope;
    }

    if (params.status && params.status !== 'ALL') {
      where.status = params.status as any;
    }

    if (params.category && params.category !== 'ALL') {
      where.category = params.category;
    }

    if (params.chapterId && params.chapterId !== 'ALL') {
      where.chapterId = params.chapterId;
    }

    if (params.chapterSlug && params.chapterSlug !== 'ALL') {
      where.chapter = { slug: params.chapterSlug };
    }

    if (params.upcomingOnly) {
      where.startsAt = { gte: new Date() };
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { venueName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, events] = await Promise.all([
      db.event.count({ where }),
      db.event.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          chapter: { select: { id: true, name: true, code: true, slug: true } },
          sessions: { orderBy: { startsAt: 'asc' } },
          _count: {
            select: {
              registrations: true,
              attendance: true,
            },
          },
        },
        orderBy: { startsAt: 'asc' },
      }),
    ]);

    return {
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        scope: e.scope,
        category: e.category,
        description: e.description,
        venueName: e.venueName,
        venueAddress: e.venueAddress,
        mode: e.mode,
        timezone: e.timezone,
        eventType: e.eventType,
        basePriceINR: e.basePriceINR,
        capacity: e.capacity,
        registeredCount: e.registeredCount,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt.toISOString(),
        status: e.status,
        bannerUrl: e.bannerUrl,
        organizerName: e.organizerName,
        organizerEmail: e.organizerEmail,
        ticketTiers: (e.ticketTiersJson as any) || [],
        speakers: (e.speakersJson as any) || [],
        sponsors: (e.sponsorsJson as any) || [],
        chapter: e.chapter,
        sessionsCount: e.sessions.length,
        attendanceCount: e._count.attendance,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  /**
   * Fetch single event by slug
   */
  static async getEventBySlug(slug: string) {
    const event = await db.event.findUnique({
      where: { slug },
      include: {
        chapter: { select: { id: true, name: true, code: true, slug: true } },
        sessions: { orderBy: { startsAt: 'asc' } },
        _count: {
          select: { registrations: true, attendance: true },
        },
      },
    });

    if (!event) return null;

    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      scope: event.scope,
      category: event.category,
      description: event.description,
      venueName: event.venueName,
      venueAddress: event.venueAddress,
      mode: event.mode,
      timezone: event.timezone,
      eventType: event.eventType,
      basePriceINR: event.basePriceINR,
      capacity: event.capacity,
      registeredCount: event.registeredCount,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
      status: event.status,
      bannerUrl: event.bannerUrl,
      organizerName: event.organizerName,
      organizerEmail: event.organizerEmail,
      organizerPhone: event.organizerPhone,
      ticketTiers: ((event.ticketTiersJson as any) || []) as TicketTier[],
      speakers: (event.speakersJson as any) || [],
      sponsors: (event.sponsorsJson as any) || [],
      sessions: event.sessions.map((s) => ({
        id: s.id,
        title: s.title,
        speakerName: s.speakerName,
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
      })),
      chapter: event.chapter,
      attendanceCount: event._count.attendance,
    };
  }

  /**
   * Concurrency-safe event registration supporting multi-tier booking
   */
  static async registerForEvent(input: RegisterEventInput) {
    return await db.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: input.eventId },
      });

      if (!event) {
        throw new Error('Event not found.');
      }

      if (event.status !== 'PUBLISHED' && (event.status as any) !== 'REGISTRATION_OPEN') {
        throw new Error('This event is not currently accepting registrations.');
      }

      if (event.registeredCount >= event.capacity) {
        throw new Error('Registration capacity has been reached for this event.');
      }

      // Resolve registered user ID
      const userId = input.userId;
      if (!userId) {
        throw new Error('User ID required for registration.');
      }

      // Check if user already booked this event
      const existing = await tx.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId,
          },
        },
      });

      if (existing) {
        if (input.throwOnDuplicate) {
          throw new Error('You have already registered for this event.');
        }
        return existing; // Idempotent return of existing registration
      }

      // Parse ticket tiers
      const tiers: TicketTier[] = ((event.ticketTiersJson as any) || []) as TicketTier[];
      let selectedTierName = input.ticketTierName || 'Free Admission';
      let selectedPriceINR = event.basePriceINR;

      if (input.ticketTierId && tiers.length > 0) {
        const matchingTier = tiers.find((t) => t.id === input.ticketTierId);
        if (matchingTier) {
          if (matchingTier.bookedCount >= matchingTier.capacity) {
            throw new Error(`The selected ticket tier (${matchingTier.name}) is fully booked.`);
          }
          selectedTierName = matchingTier.name;
          selectedPriceINR = matchingTier.priceINR;
          matchingTier.bookedCount += 1;
        }
      }

      // Generate cryptographically unique QR token
      const qrToken = `EVT-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;

      const registration = await tx.eventRegistration.create({
        data: {
          eventId: input.eventId,
          userId,
          ticketTierName: selectedTierName,
          ticketPriceINR: selectedPriceINR,
          qrToken,
          status: 'CONFIRMED',
        },
      });

      // Increment registered count and update tier counts atomically
      await tx.event.update({
        where: { id: input.eventId },
        data: {
          registeredCount: { increment: 1 },
          ticketTiersJson: tiers as any,
        },
      });

      return registration;
    });
  }

  /**
   * Retrieve all registered tickets for a member
   */
  static async getUserTickets(userId: string) {
    const registrations = await db.eventRegistration.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            chapter: { select: { id: true, name: true, slug: true, code: true } },
          },
        },
        attendance: true,
      },
      orderBy: { registeredAt: 'desc' },
    });

    return registrations.map((r) => ({
      id: r.id,
      ticketCode: r.qrToken,
      ticketTierName: r.ticketTierName || 'Free Admission',
      ticketPriceINR: r.ticketPriceINR,
      status: r.status,
      registeredAt: r.registeredAt.toISOString(),
      checkedIn: Boolean(r.attendance),
      checkedInAt: r.attendance?.scannedAt.toISOString() || null,
      event: {
        id: r.event.id,
        title: r.event.title,
        slug: r.event.slug,
        scope: r.event.scope,
        category: r.event.category,
        venueName: r.event.venueName,
        venueAddress: r.event.venueAddress,
        startsAt: r.event.startsAt.toISOString(),
        endsAt: r.event.endsAt.toISOString(),
        chapterName: r.event.chapter?.name || (r.event.scope === 'DISTRICT' ? 'Malappuram District' : 'Central Forum'),
        basePriceINR: r.event.basePriceINR,
      },
    }));
  }

  /**
   * Idempotent QR Code Check-in scan
   */
  static async checkInAttendee(actor: AuthActor, input: CheckInAttendeeInput) {
    await this.assertCanCheckIn(actor, input.eventId);

    if (!input.qrToken || typeof input.qrToken !== 'string') {
      throw new Error('Invalid ticket token or token does not match this event.');
    }

    return await db.$transaction(async (tx) => {
      const registration = await tx.eventRegistration.findUnique({
        where: { qrToken: input.qrToken.trim().toUpperCase() },
        include: {
          user: { include: { profile: true } },
          event: true,
        },
      });

      if (!registration || registration.eventId !== input.eventId) {
        throw new Error('Invalid ticket token or token does not match this event.');
      }

      // Check existing attendance for idempotency
      const existing = await tx.attendanceRecord.findUnique({
        where: { registrationId: registration.id },
      });

      const attendeeName = registration.user.profile?.fullName || registration.user.username || registration.user.email || 'Registered Delegate';

      if (existing) {
        return {
          success: true,
          alreadyCheckedIn: true,
          scannedAt: existing.scannedAt.toISOString(),
          attendeeName,
          ticketTier: registration.ticketTierName,
          message: `Already Checked In: Attendee was already admitted at ${existing.scannedAt.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}.`,
        };
      }

      // Record first check-in
      const record = await tx.attendanceRecord.create({
        data: {
          eventId: input.eventId,
          registrationId: registration.id,
          userId: registration.userId,
          scannedById: actor.userId,
          method: 'QR_SCAN',
        },
      });

      return {
        success: true,
        alreadyCheckedIn: false,
        scannedAt: record.scannedAt.toISOString(),
        attendeeName,
        ticketTier: registration.ticketTierName,
        message: 'Check-in confirmed! Welcome to the MYBF event.',
      };
    });
  }

  /**
   * Fetch event attendee roster for authorized organizers
   */
  static async getEventAttendanceRoster(actor: AuthActor, eventId: string) {
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: {
        chapter: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!event) {
      const err = new Error('Event not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    this.assertCanManageEvent(actor, event.scope as EventScope, event.chapterId);

    const registrations = await db.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            profile: {
              select: {
                fullName: true,
                primaryPhone: true,
                memberCategory: true,
                currentPosition: true,
              },
            },
          },
        },
        attendance: true,
      },
      orderBy: { registeredAt: 'desc' },
    });

    return {
      event: {
        id: event.id,
        title: event.title,
        scope: event.scope,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
      },
      attendees: registrations.map((r) => ({
        id: r.id,
        qrToken: r.qrToken,
        ticketTierName: r.ticketTierName || 'Free Admission',
        ticketPriceINR: r.ticketPriceINR,
        status: r.status,
        registeredAt: r.registeredAt.toISOString(),
        isCheckedIn: Boolean(r.attendance),
        checkedInAt: r.attendance?.scannedAt.toISOString() || null,
        user: {
          id: r.user.id,
          fullName: r.user.profile?.fullName || r.user.username || r.user.email || 'Delegate',
          email: r.user.email,
          phone: r.user.profile?.primaryPhone || null,
          category: r.user.profile?.memberCategory || null,
          position: r.user.profile?.currentPosition || null,
        },
      })),
    };
  }

  /**
   * Event Analytics for Super Admin & District Admin reporting
   */
  static async getEventAnalytics(actor?: AuthActor, filters?: { scope?: string; chapterId?: string }) {
    const where: Prisma.EventWhereInput = {};
    if (filters?.scope && filters.scope !== 'ALL') where.scope = filters.scope;
    if (filters?.chapterId && filters.chapterId !== 'ALL') where.chapterId = filters.chapterId;

    const [events, totalRegistrations, totalCheckedIn] = await Promise.all([
      db.event.findMany({
        where,
        select: {
          id: true,
          scope: true,
          title: true,
          eventType: true,
          basePriceINR: true,
          capacity: true,
          registeredCount: true,
          status: true,
          _count: { select: { attendance: true } },
        },
      }),
      db.eventRegistration.count({
        where: { event: where },
      }),
      db.attendanceRecord.count({
        where: { event: where },
      }),
    ]);

    const scopeCounts = { MAIN: 0, DISTRICT: 0, CHAPTER: 0 };
    events.forEach((e) => {
      const s = e.scope as keyof typeof scopeCounts;
      if (scopeCounts[s] !== undefined) scopeCounts[s] += 1;
    });

    return {
      totalEvents: events.length,
      scopeCounts,
      totalRegistrations,
      totalCheckedIn,
      attendanceRate: totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0,
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        scope: e.scope,
        capacity: e.capacity,
        registeredCount: e.registeredCount,
        checkedInCount: e._count.attendance,
        status: e.status,
      })),
    };
  }
}
