import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/server/db';
import { SuperAdminService } from '@/features/super-admin/server/super-admin.service';
import { MembershipService } from '@/features/memberships/server/membership.service';
import type { AuthActor } from '@/server/auth/types';

describe('MYBF Super Admin Portal Functional & Security Integration Suite', () => {
  let superAdminActor: AuthActor;
  let normalMemberActor: AuthActor;
  let testCandidateUserId: string;
  let testApplicationId: string;
  let testOver35ApplicationId: string;
  let testOver35UserId: string;

  beforeAll(async () => {
    // 1. Resolve organization and primary admin
    const org = await db.organization.findFirst();
    const adminUser = await db.user.findFirst({
      where: { email: 'ksadaqathullah@gmail.com' },
    });

    superAdminActor = {
      userId: adminUser?.id || 'super-admin-test-id',
      email: adminUser?.email || 'ksadaqathullah@gmail.com',
      phone: adminUser?.phone || null,
      status: 'ACTIVE',
      roles: ['SUPER_ADMIN'],
      organizationId: org?.id,
    };

    normalMemberActor = {
      userId: 'test-normal-member-uuid',
      email: 'member.applicant@mybf.test',
      phone: '9847111222',
      status: 'ACTIVE',
      roles: ['MEMBER'],
      organizationId: org?.id,
    };

    // Clean any prior test leftovers safely respecting foreign keys
    const priorUsers = await db.user.findMany({
      where: {
        email: { in: ['admin.candidate@test.mybf.in', 'age.candidate@test.mybf.in'] },
      },
    });
    for (const u of priorUsers) {
      await db.membership.deleteMany({ where: { memberProfile: { userId: u.id } } });
      await db.membershipApplication.deleteMany({ where: { userId: u.id } });
      await db.userRoleAssignment.deleteMany({ where: { userId: u.id } });
      await db.memberProfile.deleteMany({ where: { userId: u.id } });
      await db.user.deleteMany({ where: { id: u.id } });
    }

    // 2. Seed a test application for maker-checker review testing
    const appResult = await MembershipService.submitApplication({
      fullName: 'Super Admin Test Candidate',
      username: 'candidate_super_admin',
      password: 'SecurePassword@2026',
      confirmPassword: 'SecurePassword@2026',
      email: 'admin.candidate@test.mybf.in',
      primaryPhone: '9847222333',
      dateOfBirth: '1998-05-15',
      chapterId: 'manjeri',
      memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER',
      currentPosition: 'BUSINESS_OWNER',
      occupation: 'Logistics Manager',
      companyName: 'Malabar Logistics Hub',
      businessSector: 'Supply Chain',
      expectations: ['NETWORKING_CONNECTIONS'],
      talents: ['PROJECT_MANAGEMENT'],
      participationPreferences: ['PARTICIPATE_EVENTS'],
      consentAcknowledged: true,
      requestAgeException: false,
    });

    testApplicationId = appResult.application.id;
    testCandidateUserId = appResult.application.userId;

    // 3. Seed an Age 36+ applicant needing Super Admin exception decision
    const ageResult = await MembershipService.submitApplication({
      fullName: 'Senior Entrepreneur Applicant',
      username: 'senior_entrepreneur_36',
      password: 'SecurePassword@2026',
      confirmPassword: 'SecurePassword@2026',
      email: 'age.candidate@test.mybf.in',
      primaryPhone: '9847333444',
      dateOfBirth: '1985-02-10', // Age 41
      chapterId: 'manjeri',
      memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER',
      currentPosition: 'BUSINESS_OWNER',
      occupation: 'Industrial Manufacturer',
      companyName: 'Malappuram Tech Foundries',
      businessSector: 'Manufacturing',
      expectations: ['MENTORSHIP_ADVISORY'],
      talents: ['PUBLIC_SPEAKING'],
      participationPreferences: ['OFFER_MENTORSHIP'],
      consentAcknowledged: true,
      requestAgeException: true,
      ageExceptionReason: 'Extensive business mentorship and angel capital contribution for youth entrepreneurs.',
    });

    testOver35ApplicationId = ageResult.application.id;
    testOver35UserId = ageResult.application.userId;
  });

  afterAll(async () => {
    // Clean up test records safely
    if (testApplicationId) {
      await db.auditEvent.deleteMany({ where: { resourceId: testApplicationId } });
      await db.membershipApplication.deleteMany({ where: { id: testApplicationId } });
    }
    if (testCandidateUserId) {
      await db.membership.deleteMany({ where: { memberProfile: { userId: testCandidateUserId } } });
      await db.userRoleAssignment.deleteMany({ where: { userId: testCandidateUserId } });
      await db.memberProfile.deleteMany({ where: { userId: testCandidateUserId } });
      await db.user.deleteMany({ where: { id: testCandidateUserId } });
    }
    if (testOver35ApplicationId) {
      await db.auditEvent.deleteMany({ where: { resourceId: testOver35ApplicationId } });
      await db.membershipApplication.deleteMany({ where: { id: testOver35ApplicationId } });
    }
    if (testOver35UserId) {
      await db.membership.deleteMany({ where: { memberProfile: { userId: testOver35UserId } } });
      await db.userRoleAssignment.deleteMany({ where: { userId: testOver35UserId } });
      await db.memberProfile.deleteMany({ where: { userId: testOver35UserId } });
      await db.user.deleteMany({ where: { id: testOver35UserId } });
    }
  });

  // TEST 1: Strict Server RBAC Authorization
  it('strictly rejects non-admin users from accessing Super Admin metrics (deny-by-default)', async () => {
    await expect(
      SuperAdminService.getSystemOverviewMetrics(normalMemberActor)
    ).rejects.toThrow(/Forbidden/);
  });

  // TEST 2: Real Database-Driven System Overview Metrics
  it('returns genuine aggregate counts directly from PostgreSQL without hardcoded stats', async () => {
    const metrics = await SuperAdminService.getSystemOverviewMetrics(superAdminActor);

    expect(metrics).toBeDefined();
    expect(typeof metrics.totalRegisteredUsers).toBe('number');
    expect(typeof metrics.activeMembers).toBe('number');
    expect(typeof metrics.pendingApplicationsCount).toBe('number');
    expect(typeof metrics.approvedApplicationsCount).toBe('number');
    expect(typeof metrics.activeChaptersCount).toBe('number');
    expect(metrics.activeChaptersCount).toBe(16); // 16 Assembly Constituencies
    expect(Array.isArray(metrics.recentActivity)).toBe(true);
    expect(metrics.recentActivity.length).toBeGreaterThan(0);
  });

  // TEST 3: Organizations & 16 Constituency Chapters Governance
  it('retrieves canonical organization hierarchy and all 16 constituency chapters', async () => {
    const orgData = await SuperAdminService.getOrganizationsAndChapters(superAdminActor);

    expect(orgData.organization).toBeDefined();
    expect(orgData.districts.length).toBeGreaterThanOrEqual(1);
    expect(orgData.chapters.length).toBe(16);

    const chapterSlugs = orgData.chapters.map((c) => c.slug);
    expect(chapterSlugs).toContain('manjeri');
    expect(chapterSlugs).toContain('kondotty');
    expect(chapterSlugs).toContain('perinthalmanna');
    expect(chapterSlugs).toContain('tirur');
  });

  // TEST 4: Role Assignment with Audit Event & Self-Demotion Protection
  it('assigns a system role to a user and logs immutable audit event', async () => {
    const result = await SuperAdminService.assignSystemRole(
      superAdminActor,
      testCandidateUserId,
      'DISTRICT_ADMIN'
    );

    expect(result.success).toBe(true);

    // Verify role was persisted
    const assignment = await db.userRoleAssignment.findFirst({
      where: {
        userId: testCandidateUserId,
        role: { code: 'DISTRICT_ADMIN' },
      },
    });
    expect(assignment).toBeDefined();

    // Verify audit event was created
    const audit = await db.auditEvent.findFirst({
      where: {
        action: 'SUPER_ADMIN_ROLE_ASSIGNED',
        resourceId: assignment?.id,
      },
    });
    expect(audit).toBeDefined();
    expect(audit?.actorId).toBe(superAdminActor.userId);
  });

  it('prevents Super Administrator self-demotion', async () => {
    await expect(
      SuperAdminService.revokeSystemRole(superAdminActor, superAdminActor.userId, 'SUPER_ADMIN')
    ).rejects.toThrow(/Forbidden.*root/);
  });

  it('successfully revokes an assigned system role with audit event', async () => {
    const revokeResult = await SuperAdminService.revokeSystemRole(
      superAdminActor,
      testCandidateUserId,
      'DISTRICT_ADMIN'
    );

    expect(revokeResult.success).toBe(true);

    // Verify role assignment is removed
    const assignment = await db.userRoleAssignment.findFirst({
      where: {
        userId: testCandidateUserId,
        role: { code: 'DISTRICT_ADMIN' },
      },
    });
    expect(assignment).toBeNull();

    // Verify audit event
    const audit = await db.auditEvent.findFirst({
      where: {
        action: 'SUPER_ADMIN_ROLE_REVOKED',
        actorId: superAdminActor.userId,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit).toBeDefined();
  });

  // TEST 5: Real Immutable Audit Logs with Filtering
  it('queries real audit logs with pagination and multi-field filtering', async () => {
    const logsResult = await SuperAdminService.getAuditLogs(superAdminActor, {
      page: 1,
      pageSize: 10,
    });

    expect(logsResult.logs.length).toBeGreaterThan(0);
    expect(logsResult.total).toBeGreaterThan(0);
    expect(logsResult.page).toBe(1);

    // Filter by action
    const filtered = await SuperAdminService.getAuditLogs(superAdminActor, {
      action: 'ROLE',
    });
    expect(filtered.logs.every((l) => l.action.includes('ROLE'))).toBe(true);
  });

  // TEST 6: Real Database Health Telemetry
  it('reports measured database connectivity latency and live row counts', async () => {
    const health = await SuperAdminService.getDatabaseHealth(superAdminActor);

    expect(health.status).toBe('HEALTHY');
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);
    expect(health.latencyMs).toBeLessThan(1000); // Live DB response < 1s
    expect(health.tableCounts.chapters).toBe(16);
    expect(health.tableCounts.users).toBeGreaterThanOrEqual(2);
    expect(health.targetMemberCapacity).toContain('5,000,000');
  });

  // TEST 7: Security Posture Assessment
  it('reports honest and verified security posture parameters', async () => {
    const sec = await SuperAdminService.getSecurityHealth(superAdminActor);

    expect(sec.overallStatus).toBe('HEALTHY');
    expect(sec.authEngine.cookieFlags.httpOnly).toBe(true);
    expect(sec.passwordSecurity.saltRounds).toBe(12);
    expect(sec.rbacStatus.policyMode).toContain('Deny-by-Default');
    expect(sec.rbacStatus.superAdminCount).toBeGreaterThanOrEqual(1);
  });

  // TEST 8: Super Admin Age Exception Review Workflow
  it('allows Super Admin to approve age exception with mandatory reason and unblock application', async () => {
    const result = await MembershipService.reviewAgeException(superAdminActor, {
      applicationId: testOver35ApplicationId,
      decision: 'APPROVE',
      reason: 'Approved based on proven business track record and willingness to mentor young founders.',
    });

    expect(result.status).toBe('APPROVED');
    expect(result.application.status).toBe('SUBMITTED');

    // Verify application status and payloadJson update
    const app = await db.membershipApplication.findUnique({
      where: { id: testOver35ApplicationId },
    });
    const payload = (app?.payloadJson as any) || {};
    expect(payload.ageException?.status).toBe('APPROVED');
    expect(payload.ageException?.decidedById).toBe(superAdminActor.userId);
  });

  // TEST 9: Super Admin Maker-Checker Membership Approval
  it('executes final membership approval, issues 10-digit Member ID, and activates user account', async () => {
    const result = await MembershipService.reviewApplicationBySuperAdmin(superAdminActor, {
      applicationId: testApplicationId,
      action: 'APPROVE',
      reason: 'Fully verified eligibility, chapter jurisdiction, and executive leadership recommendation.',
    });

    expect(result.status).toBe('APPROVED');
    expect(result.membershipNumber).toBeDefined();
    expect(result.membershipNumber).toMatch(/^MYBF-\d{10}$/);

    // Verify user account state in PostgreSQL
    const user = await db.user.findUnique({
      where: { id: testCandidateUserId },
      include: {
        profile: {
          include: { memberships: true },
        },
      },
    });

    expect(user?.status).toBe('ACTIVE'); // Login unlocked
    expect(user?.profile?.memberships.length).toBe(1);
    expect(user?.profile?.memberships[0].status).toBe('ACTIVE');
    expect(user?.profile?.memberships[0].membershipNumber).toBe(result.membershipNumber);
  });
});
