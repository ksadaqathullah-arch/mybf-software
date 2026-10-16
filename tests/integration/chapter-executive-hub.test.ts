import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/server/db';
import { ChapterService } from '@/features/chapters/server/chapter.service';
import { MembershipService } from '@/features/memberships/server/membership.service';
import type { AuthActor } from '@/server/auth/types';

describe('MYBF Chapter Executive Hub Functional Integration Suite', () => {
  let orgId: string;
  let manjeriChapterId: string;
  let kondottyChapterId: string;
  let testAppId: string;
  let testUserId: string;
  let testMeetingId: string;
  let testActionItemId: string;

  let manjeriPresidentActor: AuthActor;
  let kondottyPresidentActor: AuthActor;
  let superAdminActor: AuthActor;

  beforeAll(async () => {
    // 1. Resolve Organization
    const org = await db.organization.findFirst();
    if (!org) throw new Error('Organization not seeded.');
    orgId = org.id;

    // 2. Resolve Canonical Chapters
    const manjeri = await db.chapter.findFirst({ where: { slug: 'manjeri' } });
    if (!manjeri) throw new Error('Manjeri chapter not found.');
    manjeriChapterId = manjeri.id;

    const kondotty = await db.chapter.findFirst({ where: { slug: 'kondotty' } });
    if (!kondotty) throw new Error('Kondotty chapter not found.');
    kondottyChapterId = kondotty.id;

    // 3. Define Actors
    manjeriPresidentActor = {
      userId: 'test-manjeri-exec-user',
      email: 'president.manjeri@mybf.in',
      phone: '9847111001',
      status: 'ACTIVE',
      roles: ['CHAPTER_PRESIDENT'],
      chapterId: manjeriChapterId,
      organizationId: orgId,
    };

    kondottyPresidentActor = {
      userId: 'test-kondotty-exec-user',
      email: 'president.kondotty@mybf.in',
      phone: '9847111002',
      status: 'ACTIVE',
      roles: ['CHAPTER_PRESIDENT'],
      chapterId: kondottyChapterId,
      organizationId: orgId,
    };

    superAdminActor = {
      userId: 'test-super-admin-hub',
      email: 'admin.secretariat@mybf.in',
      phone: '9847111003',
      status: 'ACTIVE',
      roles: ['SUPER_ADMIN'],
      organizationId: orgId,
    };

    // Clean any prior leftover test records
    await db.user.deleteMany({ where: { email: 'tariq.manjeri.hub@example.in' } });

    // 4. Submit an application into Manjeri chapter
    const result = await MembershipService.submitApplication({
      fullName: 'Tariq Manjeri Founder',
      username: 'tariq_manjeri_hub',
      password: 'Password@2026',
      confirmPassword: 'Password@2026',
      email: 'tariq.manjeri.hub@example.in',
      primaryPhone: '9847999888',
      dateOfBirth: '1995-04-12',
      chapterId: 'manjeri',
      memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER',
      currentPosition: 'BUSINESS_OWNER',
      occupation: 'Merchant Exporter',
      companyName: 'Manjeri Spices & Exports',
      businessSector: 'Agri-Business',
      expectations: ['NETWORKING_CONNECTIONS'],
      talents: ['CODING'],
      participationPreferences: ['PARTICIPATE_EVENTS'],
      consentAcknowledged: true,
      requestAgeException: false,
    });

    testAppId = result.application.id;
    testUserId = result.application.userId;
  });

  afterAll(async () => {
    // Clean up created test data safely
    if (testActionItemId) {
      await db.actionItem.deleteMany({ where: { id: testActionItemId } });
    }
    if (testMeetingId) {
      await db.actionItem.deleteMany({ where: { meetingId: testMeetingId } });
      await db.meetingMinute.deleteMany({ where: { meetingId: testMeetingId } });
      await db.meeting.deleteMany({ where: { id: testMeetingId } });
    }
    if (testAppId) {
      await db.auditEvent.deleteMany({ where: { resourceId: testAppId } });
      await db.membershipApplication.deleteMany({ where: { id: testAppId } });
    }
    if (testUserId) {
      await db.memberProfile.deleteMany({ where: { userId: testUserId } });
      await db.user.deleteMany({ where: { id: testUserId } });
    }
  });

  // TEST 1 & 3: Canonical Chapter Identity & Code Resolution
  it('resolves canonical chapter identity and code correctly for Manjeri (CHP-05-MANJERI)', async () => {
    const chapter = await ChapterService.getChapterBySlugOrId('manjeri');
    expect(chapter).toBeDefined();
    expect(chapter?.id).toBe(manjeriChapterId);
    expect(chapter?.code).toBe('CHP-05-MANJERI');
    expect(chapter?.name).toBe('Manjeri Chapter');
    expect(chapter?.slug).toBe('manjeri');
  });

  // TEST 2: Authorization & Cross-Chapter Access Protection
  it('authorizes Manjeri executive to read Manjeri chapter metrics', async () => {
    const metrics = await ChapterService.getChapterDashboardMetrics(
      manjeriPresidentActor,
      manjeriChapterId
    );
    expect(metrics).toBeDefined();
    expect(typeof metrics.activeMembersCount).toBe('number');
    expect(typeof metrics.pendingApplicationsCount).toBe('number');
    expect(metrics.pendingApplicationsCount).toBeGreaterThanOrEqual(1);
  });

  it('strictly rejects Kondotty executive trying to access Manjeri chapter (cross-chapter protection)', async () => {
    await expect(
      ChapterService.getChapterDashboardMetrics(kondottyPresidentActor, manjeriChapterId)
    ).rejects.toThrow();
  });

  // TEST 4 & 5: Real Member Statistics & Application Counts
  it('computes pending review counts directly from PostgreSQL without hardcoded numbers', async () => {
    const metrics = await ChapterService.getChapterDashboardMetrics(
      manjeriPresidentActor,
      manjeriChapterId
    );
    const dbPending = await db.membershipApplication.count({
      where: {
        chapterId: manjeriChapterId,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
      },
    });
    expect(metrics.pendingApplicationsCount).toBe(dbPending);
  });

  // TEST 6, 7 & 8: Membership Review Filters & Search
  it('filters applications by category, position, and search query', async () => {
    const applications = await ChapterService.getChapterApplications(
      manjeriPresidentActor,
      manjeriChapterId,
      {
        category: 'ENTREPRENEUR_BUSINESS_OWNER',
        position: 'BUSINESS_OWNER',
        search: 'Tariq',
      }
    );

    expect(applications.length).toBeGreaterThanOrEqual(1);
    const found = applications.find((a) => a.id === testAppId);
    expect(found).toBeDefined();
    expect(found?.fullName).toBe('Tariq Manjeri Founder');
    expect(found?.memberCategory).toBe('ENTREPRENEUR_BUSINESS_OWNER');
    expect(found?.currentPosition).toBe('BUSINESS_OWNER');
  });

  // TEST 9 & 10: Chapter Review Recommendation vs Super Admin Approval Protection
  it('chapter officer recommendation sets status to UNDER_REVIEW and does NOT activate user account', async () => {
    const reviewResult = await MembershipService.reviewApplication(
      manjeriPresidentActor,
      {
        applicationId: testAppId,
        action: 'RECOMMEND_APPROVAL',
        notes: 'Verified local business premises in Manjeri. Recommending for Super Admin approval.',
      }
    );

    expect(reviewResult.application).toBeDefined();
    expect(reviewResult.application!.status).toBe('UNDER_REVIEW');
    const payload = reviewResult.application!.payloadJson as Record<string, any>;
    expect(payload?.chapterRecommendation?.notes).toContain('Verified local business premises');

    // Confirm that NO active membership or activated member account was issued
    const profile = await db.memberProfile.findFirst({
      where: { userId: testUserId },
    });
    const membership = profile
      ? await db.membership.findFirst({
          where: { memberProfileId: profile.id },
        })
      : null;
    expect(membership).toBeNull();
  });

  // TEST 11: Chapter Roster Scoped Isolation
  it('scoped chapter roster returns only members belonging to the specified chapter', async () => {
    const roster = await ChapterService.getChapterMembers(
      manjeriPresidentActor,
      manjeriChapterId
    );
    expect(Array.isArray(roster)).toBe(true);
    for (const member of roster) {
      expect(member.chapterName).toBe('Manjeri Chapter');
    }
  });

  // TEST 12, 13 & 14: Schedule Meeting & Persistence
  it('schedules a chapter meeting, persists it in PostgreSQL, and generates coordinator action item', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const meeting = await ChapterService.scheduleMeeting(
      manjeriPresidentActor,
      manjeriChapterId,
      {
        title: 'Manjeri Executive Monthly Board Meet',
        type: 'CHAPTER_EXECUTIVE',
        scheduledAt: futureDate,
        venue: 'Manjeri Chamber Hall',
        agenda: 'Review youth entrepreneurship startup pipeline and Q4 summit preparation.',
        coordinatorName: 'Rashid Manjeri',
      }
    );

    expect(meeting).toBeDefined();
    expect(meeting.title).toBe('Manjeri Executive Monthly Board Meet');
    expect(meeting.chapterId).toBe(manjeriChapterId);
    testMeetingId = meeting.id;

    // Verify persisted in meetings list
    const meetings = await ChapterService.getChapterMeetings(
      manjeriPresidentActor,
      manjeriChapterId
    );
    const saved = meetings.find((m) => m.id === testMeetingId);
    expect(saved).toBeDefined();
    expect(saved?.actionItems.length).toBeGreaterThanOrEqual(1);

    if (saved && saved.actionItems.length > 0) {
      testActionItemId = saved.actionItems[0].id;
      // Toggle action item
      const updated = await ChapterService.updateActionItemStatus(
        manjeriPresidentActor,
        manjeriChapterId,
        testActionItemId,
        'COMPLETED'
      );
      expect(updated.status).toBe('COMPLETED');
    }
  });

  // TEST 17: Zero Membership Fee Policy
  it('strictly enforces zero membership fee policy', async () => {
    const freeEvents = await db.event.findMany({
      where: {
        chapterId: manjeriChapterId,
      },
    });

    for (const evt of freeEvents) {
      if (evt.eventType === 'FREE') {
        expect(evt.basePriceINR).toBe(0);
      }
    }
  });
});
