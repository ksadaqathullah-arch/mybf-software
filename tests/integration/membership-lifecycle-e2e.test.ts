import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/server/db';
import { MembershipService } from '@/features/memberships/server/membership.service';
import { EventService } from '@/features/events/server/event.service';
import type { AuthActor } from '@/server/auth/types';

describe('MYBF End-to-End Membership Lifecycle & Super Admin Exception Integration', () => {
  let orgId: string;
  let manjeriChapterId: string;
  let testEventId: string;

  const superAdminActor: AuthActor = {
    userId: 'test-super-admin',
    email: 'admin@mybf.in',
    phone: null,
    status: 'ACTIVE',
    roles: ['SUPER_ADMIN'],
  };

  let chapterPresidentActor: AuthActor;

  beforeAll(async () => {
    // 1. Resolve Organization & Manjeri Chapter
    const org = await db.organization.findFirst();
    if (!org) throw new Error('Organization not seeded.');
    orgId = org.id;

    const chapter = await db.chapter.findFirst({ where: { slug: 'manjeri' } });
    if (!chapter) throw new Error('Manjeri chapter not found.');
    manjeriChapterId = chapter.id;

    chapterPresidentActor = {
      userId: 'test-manjeri-president',
      email: 'president.manjeri@mybf.in',
      phone: '9847000002',
      status: 'ACTIVE',
      roles: ['CHAPTER_PRESIDENT'],
      chapterId: manjeriChapterId,
      organizationId: orgId,
    };

    // 2. Ensure a test published free event exists
    let event = await db.event.findFirst({ where: { slug: 'integration-summit-2026' } });
    if (!event) {
      event = await db.event.create({
        data: {
          organizationId: orgId,
          chapterId: manjeriChapterId,
          title: 'MYBF Manjeri Youth Business Summit 2026',
          slug: 'integration-summit-2026',
          category: 'SUMMIT',
          description: 'Regional summit for Malappuram youth founders.',
          venueName: 'Manjeri Town Hall',
          venueAddress: 'Manjeri - 676121',
          eventType: 'FREE',
          basePriceINR: 0,
          capacity: 200,
          registeredCount: 0,
          startsAt: new Date(Date.now() + 86400000),
          endsAt: new Date(Date.now() + 100000000),
          status: 'PUBLISHED',
        },
      });
    }
    testEventId = event.id;
  });

  afterAll(async () => {
    // Clean up test data safely without dropping schema
    const testEmails = ['anas.test@enterprise.in', 'senior.test@enterprise.in'];
    for (const email of testEmails) {
      const u = await db.user.findFirst({ where: { email } });
      if (u) {
        await db.eventRegistration.deleteMany({ where: { userId: u.id } });
        await db.notification.deleteMany({ where: { userId: u.id } });
        await db.userRoleAssignment.deleteMany({ where: { userId: u.id } });
        await db.membershipApplication.deleteMany({ where: { userId: u.id } });
        const profile = await db.memberProfile.findFirst({ where: { userId: u.id } });
        if (profile) {
          await db.membership.deleteMany({ where: { memberProfileId: profile.id } });
          await db.memberExpectation.deleteMany({ where: { memberProfileId: profile.id } });
          await db.memberTalent.deleteMany({ where: { memberProfileId: profile.id } });
          await db.memberParticipationPreference.deleteMany({ where: { memberProfileId: profile.id } });
          await db.memberProfile.delete({ where: { id: profile.id } });
        }
        await db.user.delete({ where: { id: u.id } });
      }
    }
  });

  // ==========================================
  // SCENARIO 1: STANDARD YOUTH REGISTRATION & ACTIVATION
  // ==========================================
  describe('Standard Youth Applicant (Age 24) Lifecycle', () => {
    let standardAppId: string;
    let standardUserId: string;
    let activationToken: string;
    let permanentMemberNumber: string;

    it('submits standard application with credentials', async () => {
      const result = await MembershipService.submitApplication({
        fullName: 'Mohammed Anas Test',
        username: 'anas_test_user',
        password: 'Password@2026',
        confirmPassword: 'Password@2026',
        email: 'anas.test@enterprise.in',
        primaryPhone: '9847990001',
        dateOfBirth: '2002-04-15', // 24 years old
        chapterId: 'manjeri',
        memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER',
        currentPosition: 'BUSINESS_OWNER',
        occupation: 'Software Product Founder',
        companyName: 'Anas Tech Labs',
        businessSector: 'Information Technology',
        expectations: ['NETWORKING_CONNECTIONS', 'STARTUP_GUIDANCE'],
        talents: ['CODING', 'PRODUCT_DESIGN'],
        participationPreferences: ['PARTICIPATE_EVENTS'],
        consentAcknowledged: true,
        requestAgeException: false,
      });

      expect(result.isAgeException).toBe(false);
      expect(result.application.status).toBe('SUBMITTED');
      expect(result.profile.fullName).toBe('Mohammed Anas Test');

      standardAppId = result.application.id;
      standardUserId = result.application.userId;

      // Assert user was created in PENDING_VERIFICATION with scrypt passwordHash and username
      const createdUser = await db.user.findUnique({ where: { id: standardUserId } });
      expect(createdUser?.status).toBe('PENDING_VERIFICATION');
      expect(createdUser?.passwordHash).not.toBeNull();
      expect(createdUser?.username).toBe('anas_test_user');
    });

    it('approves standard application by chapter president and issues activation token', async () => {
      const reviewResult = await MembershipService.reviewApplication(chapterPresidentActor, {
        applicationId: standardAppId,
        action: 'APPROVE',
        notes: 'Verified trade credentials and IT startup registration.',
      });

      expect(reviewResult.status).toBe('APPROVED');
      expect(reviewResult.membershipNumber).toMatch(/^MYBF-\d{10}$/);
      expect(reviewResult.activationToken).toBeDefined();

      activationToken = reviewResult.activationToken!;
      permanentMemberNumber = reviewResult.membershipNumber!;

      // Assert digital ID card was created with active status
      const card = await db.membershipIdCard.findFirst({
        where: { membership: { membershipNumber: permanentMemberNumber } },
      });
      expect(card).toBeDefined();
      expect(card?.status).toBe('ACTIVE');
    });

    it('verifies the issued activation token successfully', async () => {
      const verified = await MembershipService.verifyActivationToken(activationToken);
      expect(verified.applicationId).toBe(standardAppId);
      expect(verified.fullName).toBe('Mohammed Anas Test');
      expect(verified.membershipNumber).toBe(permanentMemberNumber);
      expect(verified.chapterName).toBe('Manjeri Chapter');
    });

    it('completes account activation with unique username and strong scrypt password', async () => {
      const activationResult = await MembershipService.activateAccount({
        token: activationToken,
        username: 'anas_test_user',
        password: 'Password@2026',
        confirmPassword: 'Password@2026',
      });

      expect(activationResult.success).toBe(true);
      expect(activationResult.username).toBe('anas_test_user');

      // Assert User status is ACTIVE and passwordHash is set using scrypt
      const activatedUser = await db.user.findUnique({ where: { id: standardUserId } });
      expect(activatedUser?.status).toBe('ACTIVE');
      expect(activatedUser?.passwordHash?.startsWith('scrypt$')).toBe(true);

      // Assert role assignment has MEMBER
      const memberRole = await db.role.findUnique({ where: { code: 'MEMBER' } });
      const roleAssignment = await db.userRoleAssignment.findFirst({
        where: { userId: standardUserId, roleId: memberRole?.id },
      });
      expect(roleAssignment).toBeDefined();
    });

    it('prevents replay / reuse of the same activation token', async () => {
      await expect(
        MembershipService.activateAccount({
          token: activationToken,
          username: 'another_name',
          password: 'Password@2026',
          confirmPassword: 'Password@2026',
        })
      ).rejects.toThrow('already been used');
    });

    it('authenticates member successfully with username and password', async () => {
      const authResult = await MembershipService.authenticateMember('anas_test_user', 'Password@2026');
      expect(authResult.user.id).toBe(standardUserId);
      expect(authResult.profile?.fullName).toBe('Mohammed Anas Test');
      expect(authResult.membership?.membershipNumber).toBe(permanentMemberNumber);
    });

    it('authenticates member successfully with email and password', async () => {
      const authResult = await MembershipService.authenticateMember('anas.test@enterprise.in', 'Password@2026');
      expect(authResult.user.id).toBe(standardUserId);
    });

    it('books free event ticket and generates QR token', async () => {
      const reg = await EventService.registerForEvent({
        eventId: testEventId,
        userId: standardUserId,
      });

      expect(reg.status).toBe('CONFIRMED');
      expect(reg.qrToken.startsWith('EVT-')).toBe(true);

      // Assert duplicate booking is idempotent
      const duplicateReg = await EventService.registerForEvent({
        eventId: testEventId,
        userId: standardUserId,
      });
      expect(duplicateReg.id).toBe(reg.id);
    });
  });

  // ==========================================
  // SCENARIO 2: SUPER ADMIN AGE EXCEPTION WORKFLOW (AGE 42)
  // ==========================================
  describe('Super Admin Age Exception Workflow (Age 42)', () => {
    let exceptionAppId: string;
    let exceptionUserId: string;

    it('submits application exceeding 35 years under age exception review', async () => {
      const result = await MembershipService.submitApplication({
        fullName: 'Senior Innovator Test',
        username: 'senior_innovator',
        password: 'Password@2026',
        confirmPassword: 'Password@2026',
        email: 'senior.test@enterprise.in',
        primaryPhone: '9847990002',
        dateOfBirth: '1984-03-20', // 42 years old
        chapterId: 'manjeri',
        memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER',
        currentPosition: 'BUSINESS_OWNER',
        occupation: 'Industrial Manufacturer',
        companyName: 'Malabar Precision Works',
        businessSector: 'Manufacturing',
        expectations: ['MENTORSHIP', 'SHARE_EXPERTISE'],
        talents: ['PUBLIC_SPEAKING'],
        participationPreferences: ['SHARE_EXPERTISE'],
        consentAcknowledged: true,
        requestAgeException: true,
        ageExceptionReason: 'Established precision manufacturer with 20+ years of industrial experience, offering active mentorship to MYBF youth startups.',
      });

      expect(result.isAgeException).toBe(true);
      expect(result.applicantAge).toBeGreaterThan(35);
      expect(result.application.status).toBe('UNDER_REVIEW');

      exceptionAppId = result.application.id;
      exceptionUserId = result.application.userId;
    });

    it('blocks chapter president from approving application while age exception is pending', async () => {
      await expect(
        MembershipService.reviewApplication(chapterPresidentActor, {
          applicationId: exceptionAppId,
          action: 'APPROVE',
          notes: 'Attempting unauthorized approval by chapter officer',
        })
      ).rejects.toThrow('requires Super Admin age exception approval');
    });

    it('displays pending application in Super Admin age exception queue', async () => {
      const pendingExceptions = await MembershipService.getPendingAgeExceptions(superAdminActor);
      const matched = pendingExceptions.find((e) => e.id === exceptionAppId);
      expect(matched).toBeDefined();
      expect(matched?.fullName).toBe('Senior Innovator Test');
      expect(matched?.age).toBeGreaterThan(35);
      expect(matched?.justification).toContain('precision manufacturer');
    });

    it('approves age exception by Super Admin with audited rationale', async () => {
      const reviewResult = await MembershipService.reviewAgeException(superAdminActor, {
        applicationId: exceptionAppId,
        decision: 'APPROVE',
        reason: 'Super Admin approval granted: Senior industrial manufacturing expertise valuable for youth incubator.',
      });

      expect(reviewResult.status).toBe('APPROVED');
      expect(reviewResult.application.status).toBe('SUBMITTED'); // Unblocked for chapter review
    });

    it('allows chapter president to approve now that age exception has been granted by Super Admin', async () => {
      const chapterApproval = await MembershipService.reviewApplication(chapterPresidentActor, {
        applicationId: exceptionAppId,
        action: 'APPROVE',
        notes: 'Approved following Super Admin age exception clearance.',
      });

      expect(chapterApproval.status).toBe('APPROVED');
      expect(chapterApproval.membershipNumber).toMatch(/^MYBF-\d{10}$/);
      expect(chapterApproval.activationToken).toBeDefined();
    });
  });
});
