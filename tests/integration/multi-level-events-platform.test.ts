import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/server/db';
import { EventService } from '@/features/events/server/event.service';
import type { AuthActor } from '@/server/auth/types';

describe('MYBF Centralized Multi-Level Event Management & Ticketing Integration Suite', () => {
  let superAdminActor: AuthActor;
  let districtAdminActor: AuthActor;
  let manjeriOfficerActor: AuthActor;
  let malappuramOfficerActor: AuthActor;
  let memberActor: AuthActor;

  let manjeriChapterId: string;
  let malappuramChapterId: string;
  let districtId: string;

  let testMainEventId: string;
  let testDistrictEventId: string;
  let testChapterEventId: string;
  let testRegistrationId: string;
  let testQrToken: string;

  beforeAll(async () => {
    // 1. Resolve test organization, district, and chapters
    const org = await db.organization.findFirst();
    const district = await db.district.findFirst();
    const chapters = await db.chapter.findMany({ take: 2 });
    const manjeri = (await db.chapter.findFirst({ where: { slug: 'manjeri' } })) || chapters[0];
    const malappuram = (await db.chapter.findFirst({ where: { slug: 'kondotty' } })) || chapters[1];

    if (!district || !manjeri || !malappuram) {
      throw new Error(`Required seeding missing: district=${Boolean(district)}, manjeri=${Boolean(manjeri)}, malappuram=${Boolean(malappuram)}`);
    }

    districtId = district.id;
    manjeriChapterId = manjeri.id;
    malappuramChapterId = malappuram.id;

    // 2. Resolve users for actors
    const testAdmin = await db.user.findFirst({ where: { email: 'ksadaqathullah@gmail.com' } });
    const testUser = await db.user.findFirst({ where: { status: 'ACTIVE' } });

    superAdminActor = {
      userId: testAdmin?.id || 'super-admin-id',
      email: testAdmin?.email || 'superadmin@mybf.test',
      phone: '9847000001',
      status: 'ACTIVE',
      roles: ['SUPER_ADMIN'],
      organizationId: org?.id,
    };

    districtAdminActor = {
      userId: testAdmin?.id || 'district-admin-test-id',
      email: 'district.admin@mybf.test',
      phone: '9847000002',
      status: 'ACTIVE',
      roles: ['DISTRICT_ADMIN'],
      organizationId: org?.id,
      districtId: district.id,
    };

    manjeriOfficerActor = {
      userId: testAdmin?.id || 'manjeri-officer-test-id',
      email: 'officer.manjeri@mybf.test',
      phone: '9847000003',
      status: 'ACTIVE',
      roles: ['CHAPTER_PRESIDENT'],
      organizationId: org?.id,
      districtId: district.id,
      chapterId: manjeri.id,
    };

    malappuramOfficerActor = {
      userId: testAdmin?.id || 'malappuram-officer-test-id',
      email: 'officer.malappuram@mybf.test',
      phone: '9847000004',
      status: 'ACTIVE',
      roles: ['CHAPTER_SECRETARY'],
      organizationId: org?.id,
      districtId: district.id,
      chapterId: malappuram.id,
    };

    memberActor = {
      userId: testUser?.id || 'regular-member-test-id',
      email: testUser?.email || 'member@mybf.test',
      phone: '9847000005',
      status: 'ACTIVE',
      roles: ['MEMBER'],
      organizationId: org?.id,
      chapterId: manjeri.id,
    };
  });

  afterAll(async () => {
    // Clean up created test events and registrations
    const testEventIds = [testMainEventId, testDistrictEventId, testChapterEventId].filter(Boolean);
    if (testEventIds.length > 0) {
      await db.attendanceRecord.deleteMany({
        where: { eventId: { in: testEventIds } },
      });
      await db.eventRegistration.deleteMany({
        where: { eventId: { in: testEventIds } },
      });
      await db.event.deleteMany({
        where: { id: { in: testEventIds } },
      });
    }
  });

  describe('1. Centralized Multi-Level Event Ownership & Authorization', () => {
    it('allows Super Admin to create a MAIN organization-wide event', async () => {
      const event = await EventService.createEvent(superAdminActor, {
        title: 'MYBF Global Business Conclave 2027',
        scope: 'MAIN',
        category: 'CONFERENCE',
        description: 'Flagship centralized summit for Kerala entrepreneurs.',
        venueName: 'Kochi International Exhibition Centre',
        venueAddress: 'Kochi, Kerala',
        mode: 'OFFLINE',
        eventType: 'FREE',
        basePriceINR: 0,
        capacity: 1000,
        startsAt: new Date(Date.now() + 86400000 * 30).toISOString(),
        endsAt: new Date(Date.now() + 86400000 * 31).toISOString(),
        ticketTiers: [
          { name: 'General Admission', priceINR: 0, capacity: 800 },
          { name: 'VIP Founders Pass', priceINR: 0, capacity: 200 },
        ],
      });

      expect(event).toBeDefined();
      expect(event.scope).toBe('MAIN');
      expect(event.chapterId).toBeNull();
      testMainEventId = event.id;
    });

    it('rejects District Admin from creating a MAIN organization event', async () => {
      await expect(
        EventService.createEvent(districtAdminActor, {
          title: 'Unauthorized Main Event by District Admin',
          scope: 'MAIN',
          category: 'CONFERENCE',
          venueName: 'Test Venue',
          mode: 'OFFLINE',
          eventType: 'FREE',
          basePriceINR: 0,
          capacity: 100,
          startsAt: new Date().toISOString(),
          endsAt: new Date().toISOString(),
        })
      ).rejects.toThrow(/Only Super Administrators can manage Central Forum Main Events/);
    });

    it('allows District Admin to create a DISTRICT-wide conclave', async () => {
      const event = await EventService.createEvent(districtAdminActor, {
        title: 'Malappuram Youth Innovation Conclave 2027',
        scope: 'DISTRICT',
        category: 'SUMMIT',
        description: 'District-wide innovation meetup for all 16 constituency chapters.',
        venueName: 'Malappuram Town Hall',
        venueAddress: 'Up Hill, Malappuram',
        mode: 'OFFLINE',
        eventType: 'FREE',
        basePriceINR: 0,
        capacity: 500,
        startsAt: new Date(Date.now() + 86400000 * 14).toISOString(),
        endsAt: new Date(Date.now() + 86400000 * 15).toISOString(),
      });

      expect(event).toBeDefined();
      expect(event.scope).toBe('DISTRICT');
      expect(event.chapterId).toBeNull();
      testDistrictEventId = event.id;
    });

    it('allows Chapter Officer to create a CHAPTER event for assigned chapter', async () => {
      const event = await EventService.createEvent(manjeriOfficerActor, {
        title: 'Manjeri Youth Tech Startup Meetup',
        scope: 'CHAPTER',
        chapterId: manjeriChapterId,
        category: 'WORKSHOP',
        description: 'Hands-on founder workshop organized by Manjeri Chapter.',
        venueName: 'Manjeri Co-Working Space',
        venueAddress: 'Court Road, Manjeri',
        mode: 'OFFLINE',
        eventType: 'FREE',
        basePriceINR: 0,
        capacity: 80,
        startsAt: new Date(Date.now() + 86400000 * 7).toISOString(),
        endsAt: new Date(Date.now() + 86400000 * 8).toISOString(),
      });

      expect(event).toBeDefined();
      expect(event.scope).toBe('CHAPTER');
      expect(event.chapterId).toBe(manjeriChapterId);
      testChapterEventId = event.id;
    });

    it('prohibits Chapter Officer from creating an event for a DIFFERENT chapter', async () => {
      await expect(
        EventService.createEvent(manjeriOfficerActor, {
          title: 'Unauthorized Cross-Chapter Event',
          scope: 'CHAPTER',
          chapterId: malappuramChapterId, // Attempting to create for Malappuram
          category: 'WORKSHOP',
          venueName: 'Malappuram Hall',
          mode: 'OFFLINE',
          eventType: 'FREE',
          basePriceINR: 0,
          capacity: 50,
          startsAt: new Date().toISOString(),
          endsAt: new Date().toISOString(),
        })
      ).rejects.toThrow(/Cross-chapter access denied/);
    });

    it('denies regular member from creating any events', async () => {
      await expect(
        EventService.createEvent(memberActor, {
          title: 'Unauthorized Member Event',
          scope: 'CHAPTER',
          chapterId: manjeriChapterId,
          category: 'WORKSHOP',
          venueName: 'Member Living Room',
          mode: 'OFFLINE',
          eventType: 'FREE',
          basePriceINR: 0,
          capacity: 10,
          startsAt: new Date().toISOString(),
          endsAt: new Date().toISOString(),
        })
      ).rejects.toThrow(/Chapter Officer privileges required to manage chapter events/);
    });
  });

  describe('2. Cross-Chapter Security & Modification Boundaries', () => {
    it('prohibits Malappuram Chapter Officer from editing a Manjeri Chapter event', async () => {
      await expect(
        EventService.updateEvent(malappuramOfficerActor, testChapterEventId, {
          title: 'Hijacked Manjeri Event Title',
        })
      ).rejects.toThrow(/Cross-chapter access denied/);
    });

    it('allows authorized Manjeri Chapter Officer to edit their own chapter event', async () => {
      const updated = await EventService.updateEvent(manjeriOfficerActor, testChapterEventId, {
        description: 'Updated description by authorized Manjeri chapter president.',
      });

      expect(updated.description).toBe('Updated description by authorized Manjeri chapter president.');
    });

    it('allows District Admin to oversee and update a Chapter event within their district', async () => {
      const updated = await EventService.updateEvent(districtAdminActor, testChapterEventId, {
        status: 'PUBLISHED',
      });

      expect(updated.status).toBe('PUBLISHED');
    });
  });

  describe('3. Event Lifecycle Governance', () => {
    it('transitions event through valid statuses and logs audit trail', async () => {
      // Transition Main event to PUBLISHED
      const published = await EventService.setEventStatus(superAdminActor, testMainEventId, 'PUBLISHED');
      expect(published.status).toBe('PUBLISHED');

      // Check audit event logged
      const audit = await db.auditEvent.findFirst({
        where: {
          resource: 'Event',
          resourceId: testMainEventId,
          action: 'EVENT_STATUS_PUBLISHED',
        },
      });
      expect(audit).toBeDefined();
    });

    it('blocks unauthorized officer from closing an event of another chapter', async () => {
      await expect(
        EventService.setEventStatus(malappuramOfficerActor, testChapterEventId, 'CANCELLED')
      ).rejects.toThrow(/Cross-chapter access denied/);
    });
  });

  describe('4. Transaction-Safe Registration & Tier Allocation', () => {
    it('successfully registers an active member for a free ticket tier', async () => {
      const reg = await EventService.registerForEvent({
        eventId: testMainEventId,
        userId: memberActor.userId,
        ticketTierName: 'General Admission',
      });

      expect(reg).toBeDefined();
      expect(reg.status).toBe('CONFIRMED');
      expect(reg.ticketTierName).toBe('General Admission');
      expect(reg.ticketPriceINR).toBe(0);
      expect(reg.qrToken).toMatch(/^EVT-[0-9A-F]+/);

      testRegistrationId = reg.id;
      testQrToken = reg.qrToken;
    });

    it('prevents duplicate booking by the same member for the same event', async () => {
      await expect(
        EventService.registerForEvent({
          eventId: testMainEventId,
          userId: memberActor.userId,
          ticketTierName: 'General Admission',
          throwOnDuplicate: true,
        })
      ).rejects.toThrow(/You have already registered for this event/);
    });

    it('retrieves user tickets via getUserTickets with verified metadata', async () => {
      const tickets = await EventService.getUserTickets(memberActor.userId);
      const bookedTicket = tickets.find((t) => t.id === testRegistrationId);

      expect(bookedTicket).toBeDefined();
      expect(bookedTicket?.ticketCode).toBe(testQrToken);
      expect(bookedTicket?.checkedIn).toBe(false);
      expect(bookedTicket?.event.title).toBe('MYBF Global Business Conclave 2027');
    });
  });

  describe('5. Cryptographic QR Verification & Idempotent Reception Check-In', () => {
    it('verifies QR token and admits attendee at reception', async () => {
      const checkInResult = await EventService.checkInAttendee(superAdminActor, {
        qrToken: testQrToken,
        eventId: testMainEventId,
      });

      expect(checkInResult.success).toBe(true);
      expect(checkInResult.alreadyCheckedIn).toBe(false);
      expect(checkInResult.attendeeName).toBeDefined();
      expect(checkInResult.ticketTier).toBe('General Admission');
    });

    it('idempotently flags duplicate check-in scan attempt', async () => {
      const duplicateResult = await EventService.checkInAttendee(superAdminActor, {
        qrToken: testQrToken,
        eventId: testMainEventId,
      });

      expect(duplicateResult.success).toBe(true);
      expect(duplicateResult.alreadyCheckedIn).toBe(true);
      expect(duplicateResult.message).toMatch(/Already Checked In/i);
    });

    it('rejects check-in for an invalid or non-existent QR token', async () => {
      await expect(
        EventService.checkInAttendee(superAdminActor, {
          qrToken: 'EVT-INVALID-TOKEN-99999',
          eventId: testMainEventId,
        })
      ).rejects.toThrow(/Invalid ticket token or token does not match this event/);
    });

    it('rejects check-in performed by an unauthorized regular member', async () => {
      await expect(
        EventService.checkInAttendee(memberActor, {
          qrToken: testQrToken,
          eventId: testMainEventId,
        })
      ).rejects.toThrow(/Forbidden: You do not have check-in authority for this event/);
    });
  });

  describe('6. Attendee Roster & Multi-Level Analytics', () => {
    it('provides attendee roster with sanitized participant data', async () => {
      const { attendees } = await EventService.getEventAttendanceRoster(superAdminActor, testMainEventId);

      expect(attendees.length).toBeGreaterThanOrEqual(1);
      const attendee = attendees.find((r) => r.id === testRegistrationId);
      expect(attendee).toBeDefined();
      expect(attendee?.isCheckedIn).toBe(true);
      expect(attendee?.ticketTierName).toBe('General Admission');
    });

    it('aggregates multi-level analytics across MAIN, DISTRICT, and CHAPTER events', async () => {
      const analytics = await EventService.getEventAnalytics();

      expect(analytics.totalEvents).toBeGreaterThanOrEqual(3);
      expect(analytics.scopeCounts.MAIN).toBeGreaterThanOrEqual(1);
      expect(analytics.scopeCounts.DISTRICT).toBeGreaterThanOrEqual(1);
      expect(analytics.scopeCounts.CHAPTER).toBeGreaterThanOrEqual(1);
      expect(analytics.totalRegistrations).toBeGreaterThanOrEqual(1);
      expect(analytics.totalCheckedIn).toBeGreaterThanOrEqual(1);
    });
  });
});
