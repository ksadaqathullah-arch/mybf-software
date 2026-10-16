import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/server/db';
import { MembershipService } from '@/features/memberships/server/membership.service';
import { memberRegistrationSchema } from '@/features/memberships/schemas/membership.schema';
import { createSession, getSessionActor, destroySession } from '@/server/auth/session';
import type { AuthActor } from '@/server/auth/types';

describe('MYBF Membership Registration with Credentials, Super Admin Approval & Login Authorization', () => {
  let orgId: string;
  let manjeriChapterId: string;

  const superAdminActor: AuthActor = {
    userId: 'test-super-admin-id',
    email: 'superadmin@mybf.in',
    phone: null,
    status: 'ACTIVE',
    roles: ['SUPER_ADMIN'],
  };

  const chapterPresidentActor: AuthActor = {
    userId: 'test-manjeri-president-id',
    email: 'president.manjeri@mybf.in',
    phone: '9847000002',
    status: 'ACTIVE',
    roles: ['CHAPTER_PRESIDENT'],
    chapterId: '',
    organizationId: '',
  };

  const testApprovedApplicant = {
    fullName: 'Salman Faris SuperApproved',
    username: 'authtest_superapproved',
    email: 'authtest.superapproved@enterprise.in',
    phone: '9847119988',
    password: 'ValidSecurePass@2026',
    dateOfBirth: '1998-06-15', // 28 years old
  };

  const testRejectedApplicant = {
    fullName: 'Rasheed Rejected',
    username: 'authtest_rejected',
    email: 'authtest.rejected@enterprise.in',
    phone: '9847119989',
    password: 'ValidSecurePass@2026',
    dateOfBirth: '1999-01-20', // 27 years old
  };

  const testOver35Applicant = {
    fullName: 'Usman Over35',
    username: 'authtest_over35',
    email: 'authtest.over35@enterprise.in',
    phone: '9847119990',
    password: 'ValidSecurePass@2026',
    dateOfBirth: '1984-03-10', // 42 years old
  };

  let approvedAppId: string;
  let approvedUserId: string;
  let issuedMembershipNumber: string;

  let rejectedAppId: string;
  let rejectedUserId: string;

  let over35AppId: string;
  let over35UserId: string;

  async function cleanupUser(email: string, username?: string) {
    const users = await db.user.findMany({
      where: {
        OR: [
          { email },
          ...(username ? [{ username }] : []),
        ],
      },
    });

    for (const u of users) {
      await db.session.deleteMany({ where: { userId: u.id } });
      await db.auditEvent.deleteMany({ where: { actorEmail: u.email } });
      await db.notification.deleteMany({ where: { userId: u.id } });
      await db.userRoleAssignment.deleteMany({ where: { userId: u.id } });
      await db.membershipApprovalAction.deleteMany({ where: { application: { userId: u.id } } });
      await db.membershipApplication.deleteMany({ where: { userId: u.id } });
      const profile = await db.memberProfile.findFirst({ where: { userId: u.id } });
      if (profile) {
        await db.membershipIdCard.deleteMany({ where: { membership: { memberProfileId: profile.id } } });
        await db.membership.deleteMany({ where: { memberProfileId: profile.id } });
        await db.memberExpectation.deleteMany({ where: { memberProfileId: profile.id } });
        await db.memberTalent.deleteMany({ where: { memberProfileId: profile.id } });
        await db.memberParticipationPreference.deleteMany({ where: { memberProfileId: profile.id } });
        await db.memberProfile.delete({ where: { id: profile.id } });
      }
      await db.user.delete({ where: { id: u.id } });
    }
  }

  beforeAll(async () => {
    const org = await db.organization.findFirst();
    if (!org) throw new Error('Organization not seeded.');
    orgId = org.id;

    const chapter = await db.chapter.findFirst({ where: { slug: 'manjeri' } });
    if (!chapter) throw new Error('Manjeri chapter not found.');
    manjeriChapterId = chapter.id;

    chapterPresidentActor.chapterId = manjeriChapterId;
    chapterPresidentActor.organizationId = orgId;

    // Clean up any leftovers from previous test runs
    await cleanupUser(testApprovedApplicant.email, testApprovedApplicant.username);
    await cleanupUser(testRejectedApplicant.email, testRejectedApplicant.username);
    await cleanupUser(testOver35Applicant.email, testOver35Applicant.username);
  });

  afterAll(async () => {
    await cleanupUser(testApprovedApplicant.email, testApprovedApplicant.username);
    await cleanupUser(testRejectedApplicant.email, testRejectedApplicant.username);
    await cleanupUser(testOver35Applicant.email, testOver35Applicant.username);
  });

  // =========================================================================
  // REQUIREMENT 3 & 4: PASSWORD POLICY & CONFIRMATION VALIDATION
  // =========================================================================
  describe('Password Policy & Confirmation Validation', () => {
    const baseValid = {
      fullName: 'Valid Applicant',
      email: 'valid@example.in',
      primaryPhone: '9847111222',
      dateOfBirth: '2000-01-01',
      chapterId: 'manjeri',
      memberCategory: 'ASPIRING_ENTREPRENEUR' as const,
      currentPosition: 'STUDENT' as const,
      occupation: 'Student',
      expectations: ['NETWORKING_CONNECTIONS'],
      consentAcknowledged: true,
      username: 'valid_user',
    };

    it('rejects password shorter than 12 characters', () => {
      const result = memberRegistrationSchema.safeParse({
        ...baseValid,
        password: 'Short123!',
        confirmPassword: 'Short123!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes('password'));
        expect(issue?.message).toContain('at least 12 characters');
      }
    });

    it('rejects password confirmation mismatch', () => {
      const result = memberRegistrationSchema.safeParse({
        ...baseValid,
        password: 'ValidSuperPassword2026!',
        confirmPassword: 'DifferentPassword2026!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes('confirmPassword'));
        expect(issue?.message).toBe('Passwords do not match');
      }
    });
  });

  // =========================================================================
  // REQUIREMENT 1, 5, 6 & 7: REGISTRATION & PENDING ACCOUNT GUARD
  // =========================================================================
  describe('Registration and Pending Account Sign-in Guard', () => {
    it('registers with valid username and password into PENDING_VERIFICATION', async () => {
      const reg = await MembershipService.submitApplication({
        fullName: testApprovedApplicant.fullName,
        username: testApprovedApplicant.username,
        password: testApprovedApplicant.password,
        confirmPassword: testApprovedApplicant.password,
        email: testApprovedApplicant.email,
        primaryPhone: testApprovedApplicant.phone,
        dateOfBirth: testApprovedApplicant.dateOfBirth,
        chapterId: 'manjeri',
        memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER',
        currentPosition: 'BUSINESS_OWNER',
        occupation: 'Software Solutions',
        companyName: 'Faris Dynamics',
        businessSector: 'IT Services',
        expectations: ['NETWORKING_CONNECTIONS', 'STARTUP_GUIDANCE'],
        talents: ['CODING'],
        participationPreferences: ['PARTICIPATE_EVENTS'],
        consentAcknowledged: true,
        requestAgeException: false,
      });

      expect(reg.application.status).toBe('SUBMITTED');
      expect(reg.username).toBe(testApprovedApplicant.username);
      approvedAppId = reg.application.id;
      approvedUserId = reg.application.userId;

      // Verify user in database
      const user = await db.user.findUnique({ where: { id: approvedUserId } });
      expect(user).toBeDefined();
      expect(user?.status).toBe('PENDING_VERIFICATION');
      expect(user?.username).toBe(testApprovedApplicant.username);
      expect(user?.passwordHash).not.toBeNull();
      expect(user?.passwordHash?.startsWith('scrypt$')).toBe(true);

      // Verify plaintext password is NEVER stored
      expect(user?.passwordHash).not.toBe(testApprovedApplicant.password);
    });

    it('rejects duplicate username registration (case-insensitive)', async () => {
      await expect(
        MembershipService.submitApplication({
          fullName: 'Duplicate User Test',
          username: testApprovedApplicant.username.toUpperCase(), // Case-insensitive test
          password: 'AnotherPassword2026!',
          confirmPassword: 'AnotherPassword2026!',
          email: 'duplicate@enterprise.in',
          primaryPhone: '9847999888',
          dateOfBirth: '2000-01-01',
          chapterId: 'manjeri',
          memberCategory: 'ASPIRING_ENTREPRENEUR',
          currentPosition: 'STUDENT',
          occupation: 'Student',
          expectations: ['NETWORKING_CONNECTIONS'],
          consentAcknowledged: true,
        })
      ).rejects.toThrow(/is already taken/i);
    });

    it('denies login for pending account even with valid credentials', async () => {
      await expect(
        MembershipService.authenticateMember(
          testApprovedApplicant.username,
          testApprovedApplicant.password
        )
      ).rejects.toThrow(/pending approval by the MYBF Super Administrator/i);
    });

    it('rejects invalid password with standard error without leaking account status', async () => {
      await expect(
        MembershipService.authenticateMember(
          testApprovedApplicant.username,
          'WrongPassword123!'
        )
      ).rejects.toThrow('Invalid username/email or password.');
    });
  });

  // =========================================================================
  // REQUIREMENT 8, 9, 13 & 14: SUPER ADMIN APPROVAL & IDEMPOTENCY
  // =========================================================================
  describe('Super Admin Approval & Member ID Issuance', () => {
    it('blocks non-Super Admin from approving applications', async () => {
      await expect(
        MembershipService.reviewApplicationBySuperAdmin(chapterPresidentActor, {
          applicationId: approvedAppId,
          action: 'APPROVE',
          reason: 'Chapter officer attempted approval',
        })
      ).rejects.toThrow(/Only Super Administrator can approve or reject/i);
    });

    it('approves application by Super Admin, activates user and issues permanent ID', async () => {
      const reviewResult = await MembershipService.reviewApplicationBySuperAdmin(superAdminActor, {
        applicationId: approvedAppId,
        action: 'APPROVE',
        reason: 'Verified enterprise credentials and registration documents.',
      });

      expect(reviewResult.status).toBe('APPROVED');
      expect(reviewResult.membershipNumber).toMatch(/^MYBF-\d{10}$/);
      issuedMembershipNumber = reviewResult.membershipNumber!;

      // Verify User is activated
      const user = await db.user.findUnique({ where: { id: approvedUserId } });
      expect(user?.status).toBe('ACTIVE');

      // Verify Role is MEMBER
      const memberRole = await db.role.findUnique({ where: { code: 'MEMBER' } });
      const assignment = await db.userRoleAssignment.findFirst({
        where: { userId: approvedUserId, roleId: memberRole?.id },
      });
      expect(assignment).toBeDefined();

      // Verify ID card is ACTIVE
      const idCard = await db.membershipIdCard.findFirst({
        where: { membership: { membershipNumber: issuedMembershipNumber } },
      });
      expect(idCard?.status).toBe('ACTIVE');
    });

    it('ensures approval is idempotent and does not create duplicate IDs', async () => {
      const repeatedResult = await MembershipService.reviewApplicationBySuperAdmin(superAdminActor, {
        applicationId: approvedAppId,
        action: 'APPROVE',
        reason: 'Repeated approval attempt',
      });

      expect(repeatedResult.status).toBe('APPROVED');
      expect(repeatedResult.membershipNumber).toBe(issuedMembershipNumber);

      // Verify database has exactly 1 membership record for this profile
      const profile = await db.memberProfile.findFirst({ where: { userId: approvedUserId } });
      const count = await db.membership.count({ where: { memberProfileId: profile?.id } });
      expect(count).toBe(1);
    });
  });

  // =========================================================================
  // REQUIREMENT 11 & 18: APPROVED MEMBER SIGN-IN & DASHBOARD ACCESS
  // =========================================================================
  describe('Approved Member Sign-In & Dashboard Profile Resolution', () => {
    it('authenticates approved member using username', async () => {
      const auth = await MembershipService.authenticateMember(
        testApprovedApplicant.username,
        testApprovedApplicant.password
      );
      expect(auth.user.id).toBe(approvedUserId);
      expect(auth.user.status).toBe('ACTIVE');
      expect(auth.membership?.membershipNumber).toBe(issuedMembershipNumber);
      expect(auth.idCard?.status).toBe('ACTIVE');
      expect(auth.user.roles).toContain('MEMBER');
    });

    it('authenticates approved member using email', async () => {
      const auth = await MembershipService.authenticateMember(
        testApprovedApplicant.email,
        testApprovedApplicant.password
      );
      expect(auth.user.id).toBe(approvedUserId);
      expect(auth.membership?.membershipNumber).toBe(issuedMembershipNumber);
    });

    it('authenticates approved member using raw 10-digit mobile number', async () => {
      const auth = await MembershipService.authenticateMember(
        testApprovedApplicant.phone,
        testApprovedApplicant.password
      );
      expect(auth.user.id).toBe(approvedUserId);
    });

    it('authenticates approved member using +91 mobile number format', async () => {
      const auth = await MembershipService.authenticateMember(
        `+91${testApprovedApplicant.phone}`,
        testApprovedApplicant.password
      );
      expect(auth.user.id).toBe(approvedUserId);
    });

    it('rejects approved member with incorrect password', async () => {
      await expect(
        MembershipService.authenticateMember(
          testApprovedApplicant.username,
          'WrongPassword123!'
        )
      ).rejects.toThrow('Invalid username/email or password.');
    });

    it('resolves actual member dashboard profile and membership data', async () => {
      const profile = await db.memberProfile.findFirst({
        where: { userId: approvedUserId },
        include: {
          chapter: true,
          expectations: true,
          talents: true,
          memberships: {
            where: { status: 'ACTIVE' },
            include: { idCards: { where: { status: 'ACTIVE' } } },
          },
        },
      });

      expect(profile).toBeDefined();
      expect(profile?.fullName).toBe(testApprovedApplicant.fullName);
      expect(profile?.chapter.name).toBe('Manjeri Chapter');
      expect(profile?.memberships[0]?.membershipNumber).toBe(issuedMembershipNumber);
      expect(profile?.memberships[0]?.idCards[0]?.status).toBe('ACTIVE');
      expect(profile?.expectations.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // REQUIREMENT 10 & 12: SUPER ADMIN REJECTION & LOGIN PROHIBITION
  // =========================================================================
  describe('Super Admin Rejection & Login Guard', () => {
    it('registers an applicant for rejection test', async () => {
      const reg = await MembershipService.submitApplication({
        fullName: testRejectedApplicant.fullName,
        username: testRejectedApplicant.username,
        password: testRejectedApplicant.password,
        confirmPassword: testRejectedApplicant.password,
        email: testRejectedApplicant.email,
        primaryPhone: testRejectedApplicant.phone,
        dateOfBirth: testRejectedApplicant.dateOfBirth,
        chapterId: 'manjeri',
        memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER',
        currentPosition: 'BUSINESS_OWNER',
        occupation: 'General Trading',
        expectations: ['NETWORKING_CONNECTIONS'],
        consentAcknowledged: true,
      });

      rejectedAppId = reg.application.id;
      rejectedUserId = reg.application.userId;
    });

    it('rejects the application by Super Admin with audited reason', async () => {
      const review = await MembershipService.reviewApplicationBySuperAdmin(superAdminActor, {
        applicationId: rejectedAppId,
        action: 'REJECT',
        reason: 'Application does not meet current youth entrepreneurship criteria.',
      });

      expect(review.status).toBe('REJECTED');

      const app = await db.membershipApplication.findUnique({ where: { id: rejectedAppId } });
      expect(app?.status).toBe('REJECTED');
      expect(app?.rejectionReason).toContain('youth entrepreneurship criteria');
    });

    it('rejects login for rejected applicant with informative message', async () => {
      await expect(
        MembershipService.authenticateMember(
          testRejectedApplicant.username,
          testRejectedApplicant.password
        )
      ).rejects.toThrow(/membership application was not approved/i);
    });
  });

  // =========================================================================
  // REQUIREMENT 15: OVER-35 AGE EXCEPTION APPROVAL
  // =========================================================================
  describe('Over-35 Youth Age Exception Approval', () => {
    it('registers an applicant exceeding 35 years under age exception review', async () => {
      const reg = await MembershipService.submitApplication({
        fullName: testOver35Applicant.fullName,
        username: testOver35Applicant.username,
        password: testOver35Applicant.password,
        confirmPassword: testOver35Applicant.password,
        email: testOver35Applicant.email,
        primaryPhone: testOver35Applicant.phone,
        dateOfBirth: testOver35Applicant.dateOfBirth,
        chapterId: 'manjeri',
        memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER',
        currentPosition: 'BUSINESS_OWNER',
        occupation: 'Industrial Manufacturer',
        companyName: 'Usman Toolings',
        businessSector: 'Precision Manufacturing',
        expectations: ['MENTORSHIP', 'SHARE_EXPERTISE'],
        talents: ['PUBLIC_SPEAKING'],
        participationPreferences: ['SHARE_EXPERTISE'],
        consentAcknowledged: true,
        requestAgeException: true,
        ageExceptionReason: 'Senior industrialist with 20+ years tooling experience mentoring youth founders.',
      });

      expect(reg.isAgeException).toBe(true);
      expect(reg.application.status).toBe('UNDER_REVIEW');
      over35AppId = reg.application.id;
      over35UserId = reg.application.userId;
    });

    it('approves over-35 age exception application via Super Admin review', async () => {
      const review = await MembershipService.reviewApplicationBySuperAdmin(superAdminActor, {
        applicationId: over35AppId,
        action: 'APPROVE',
        reason: 'Super Admin exception approved: Valuable industrial tooling mentorship for youth startups.',
      });

      expect(review.status).toBe('APPROVED');
      expect(review.membershipNumber).toMatch(/^MYBF-\d{10}$/);

      // Verify over-35 applicant is now activated and can sign in
      const auth = await MembershipService.authenticateMember(
        testOver35Applicant.username,
        testOver35Applicant.password
      );
      expect(auth.user.id).toBe(over35UserId);
      expect(auth.user.status).toBe('ACTIVE');
    });
  });

  // =========================================================================
  // REQUIREMENT 16: EXISTING MEMBER COMPATIBILITY
  // =========================================================================
  describe('Existing Member Compatibility', () => {
    it('authenticates pre-existing member account without disruption', async () => {
      // User ksadaqathullah@gmail.com was pre-existing in the system
      const auth = await MembershipService.authenticateMember(
        'ksadaqathullah',
        '1234567890'
      );
      expect(auth.user.email).toBe('ksadaqathullah@gmail.com');
      expect(auth.user.status).toBe('ACTIVE');
    });
  });

  // =========================================================================
  // REQUIREMENT 17: SESSION AUTHORIZATION
  // =========================================================================
  describe('Session Authorization & Route Guards', () => {
    let sessionToken: string;

    it('creates persistent database session for the authenticated member', async () => {
      sessionToken = await createSession(approvedUserId, '127.0.0.1', 'Mozilla/5.0 Vitest');
      expect(sessionToken).toHaveLength(64);

      const session = await db.session.findUnique({ where: { sessionToken } });
      expect(session).toBeDefined();
      expect(session?.userId).toBe(approvedUserId);
    });

    it('resolves active AuthActor from session token', async () => {
      const actor = await getSessionActor(sessionToken);
      expect(actor).not.toBeNull();
      expect(actor?.userId).toBe(approvedUserId);
      expect(actor?.status).toBe('ACTIVE');
      expect(actor?.roles).toContain('MEMBER');
      expect(actor?.chapterId).toBe(manjeriChapterId);
    });

    it('destroys session on sign-out', async () => {
      await destroySession(sessionToken);
      const actorAfter = await getSessionActor(sessionToken);
      expect(actorAfter).toBeNull();
    });
  });
});
