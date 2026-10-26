import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/server/db';
import { ChapterService } from '@/features/chapters/server/chapter.service';
import { getSessionActor, createSession } from '@/server/auth/session';
import { authorize } from '@/server/auth/policy';
import type { AuthActor } from '@/server/auth/types';

describe('Central Chapter Officer Management Across 16 Constituencies', () => {
  let orgId: string;
  let manjeriChapterId: string;
  let kondottyChapterId: string;

  let testUser1Id: string;
  let testUser2Id: string;
  let testUser1Token: string;
  let testUser2Token: string;

  let firstAppointmentId: string;
  let secondAppointmentId: string;

  const superAdminActor: AuthActor = {
    userId: 'test-super-admin-central-officers',
    email: 'admin.central@mybf.in',
    phone: '9847000111',
    status: 'ACTIVE',
    roles: ['SUPER_ADMIN'],
  };

  beforeAll(async () => {
    const org = await db.organization.findFirst();
    if (!org) throw new Error('Org not found');
    orgId = org.id;

    const manjeri = await db.chapter.findFirst({ where: { slug: 'manjeri' } });
    if (!manjeri) throw new Error('Manjeri chapter not found');
    manjeriChapterId = manjeri.id;

    const kondotty = await db.chapter.findFirst({ where: { slug: 'kondotty' } });
    if (!kondotty) throw new Error('Kondotty chapter not found');
    kondottyChapterId = kondotty.id;

    const memberRole = await db.role.findUnique({ where: { code: 'MEMBER' } });
    if (!memberRole) throw new Error('MEMBER role not found');

    // Clean up previous test users if any
    await db.user.deleteMany({
      where: {
        email: { in: ['test.manjeri.pres1@mybf.test', 'test.manjeri.pres2@mybf.test'] },
      },
    });

    // Create Test User 1
    const user1 = await db.user.create({
      data: {
        username: 'test_pres_1',
        email: 'test.manjeri.pres1@mybf.test',
        phone: '9847111222',
        status: 'ACTIVE',
        profile: {
          create: {
            organizationId: orgId,
            chapterId: manjeriChapterId,
            fullName: 'First Manjeri President',
            email: 'test.manjeri.pres1@mybf.test',
            dateOfBirth: new Date('1992-04-10'),
            primaryPhone: '9847111222',
            memberCategory: 'ASPIRING_ENTREPRENEUR',
            currentPosition: 'SELF_EMPLOYED',
          },
        },
        roleAssignments: {
          create: {
            roleId: memberRole.id,
            organizationId: orgId,
            chapterId: manjeriChapterId,
          },
        },
      },
    });
    testUser1Id = user1.id;
    testUser1Token = await createSession(testUser1Id);

    // Create Test User 2
    const user2 = await db.user.create({
      data: {
        username: 'test_pres_2',
        email: 'test.manjeri.pres2@mybf.test',
        phone: '9847333444',
        status: 'ACTIVE',
        profile: {
          create: {
            organizationId: orgId,
            chapterId: manjeriChapterId,
            fullName: 'Second Manjeri President',
            email: 'test.manjeri.pres2@mybf.test',
            dateOfBirth: new Date('1994-08-15'),
            primaryPhone: '9847333444',
            memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER',
            currentPosition: 'BUSINESS_OWNER',
          },
        },
        roleAssignments: {
          create: {
            roleId: memberRole.id,
            organizationId: orgId,
            chapterId: manjeriChapterId,
          },
        },
      },
    });
    testUser2Id = user2.id;
    testUser2Token = await createSession(testUser2Id);
  }, 60000);

  afterAll(async () => {
    const ids = [testUser1Id, testUser2Id].filter(Boolean);
    if (ids.length > 0) {
      await db.session.deleteMany({ where: { userId: { in: ids } } });
      await db.chapterLeadership.deleteMany({ where: { userId: { in: ids } } });
      await db.userRoleAssignment.deleteMany({ where: { userId: { in: ids } } });
      await db.memberProfile.deleteMany({ where: { userId: { in: ids } } });
      await db.user.deleteMany({ where: { id: { in: ids } } });
    }
  }, 60000);

  it('1. Super Admin appoints Manjeri Chapter President with audit logging and RBAC sync', async () => {
    const appointment = await ChapterService.appointLeader(
      superAdminActor,
      manjeriChapterId,
      testUser1Id,
      'PRESIDENT',
      'President of Manjeri Chapter',
      new Date('2026-01-01'),
      null
    );

    expect(appointment).toBeDefined();
    expect(appointment.role).toBe('PRESIDENT');
    expect(appointment.chapterId).toBe(manjeriChapterId);
    expect(appointment.userId).toBe(testUser1Id);
    expect(appointment.isActive).toBe(true);
    firstAppointmentId = appointment.id;

    // Check userRoleAssignment synchronization
    const roleAssignment = await db.userRoleAssignment.findFirst({
      where: {
        userId: testUser1Id,
        chapterId: manjeriChapterId,
        role: { code: 'CHAPTER_PRESIDENT' },
      },
    });
    expect(roleAssignment).toBeDefined();

    // Check Audit Log entry
    const audit = await db.auditEvent.findFirst({
      where: {
        resourceId: appointment.id,
        action: 'LEADERSHIP_APPOINTED',
      },
    });
    expect(audit).toBeDefined();
    expect(audit?.chapterId).toBe(manjeriChapterId);
  });

  it('2. Manjeri public page queries live DB and displays the real appointed President', async () => {
    const publicChapter = await db.chapter.findFirst({
      where: { slug: 'manjeri' },
      include: {
        leadership: {
          where: { isActive: true },
          include: {
            user: {
              include: { profile: true },
            },
          },
          orderBy: { startDate: 'desc' },
        },
      },
    });

    expect(publicChapter).toBeDefined();
    const activePres = publicChapter?.leadership.find((l) => l.role === 'PRESIDENT');
    expect(activePres).toBeDefined();
    expect(activePres?.user.id).toBe(testUser1Id);
    expect(activePres?.user.profile?.fullName).toBe('First Manjeri President');
    expect(activePres?.title).toBe('President of Manjeri Chapter');
  });

  it('3. Manjeri Executive Dashboard displays the same appointment from database', async () => {
    const actor = await getSessionActor(testUser1Token);
    expect(actor).toBeDefined();
    expect(actor?.roles).toContain('CHAPTER_PRESIDENT');
    expect(actor?.chapterId).toBe(manjeriChapterId);

    const metrics = await ChapterService.getChapterDashboardMetrics(actor!, manjeriChapterId);
    expect(metrics).toBeDefined();
    const leaderInMetrics = metrics.leadershipRecords.find((l) => l.id === firstAppointmentId);
    expect(leaderInMetrics).toBeDefined();
    expect(leaderInMetrics?.user.profile?.fullName).toBe('First Manjeri President');
    expect(leaderInMetrics?.role).toBe('PRESIDENT');
  });

  it('4. Appointed officer can access only the permitted Manjeri functions and NOT cross-chapter Kondotty', async () => {
    const actor = await getSessionActor(testUser1Token);
    expect(actor).toBeDefined();

    // Authorized on own chapter (Manjeri)
    const manjeriAccess = authorize({
      actor: actor!,
      action: 'chapter.read',
      resource: 'chapter',
      chapterId: manjeriChapterId,
    });
    expect(manjeriAccess.allowed).toBe(true);
    expect(manjeriAccess.evaluatedScope).toBe('CHAPTER');

    // Forbidden on cross-chapter (Kondotty)
    const kondottyAccess = authorize({
      actor: actor!,
      action: 'chapter.read',
      resource: 'chapter',
      chapterId: kondottyChapterId,
    });
    expect(kondottyAccess.allowed).toBe(false);
    expect(kondottyAccess.reason).toContain('Cross-chapter access violation');

    // Attempting to read Kondotty applications throws Forbidden
    await expect(
      ChapterService.getChapterApplications(actor!, kondottyChapterId)
    ).rejects.toThrow(/Forbidden|Access Denied/i);
  });

  it('5. Kondotty Chapter does not inherit Manjeri appointments', async () => {
    const kondotty = await db.chapter.findFirst({
      where: { slug: 'kondotty' },
      include: {
        leadership: {
          where: { isActive: true },
        },
      },
    });

    const kondottyOfficers = kondotty?.leadership || [];
    const hasManjeriOfficer = kondottyOfficers.some(
      (l) => l.userId === testUser1Id || l.userId === testUser2Id
    );
    expect(hasManjeriOfficer).toBe(false);
  });

  it('6. Unauthorized users (including Chapter Executives) cannot appoint officers', async () => {
    const officerActor = await getSessionActor(testUser1Token);
    expect(officerActor).toBeDefined();

    // Policy check: Chapter executive attempting chapter.manage_leadership is explicitly denied
    const policyResult = authorize({
      actor: officerActor!,
      action: 'chapter.manage_leadership',
      resource: 'chapter',
      chapterId: manjeriChapterId,
    });
    expect(policyResult.allowed).toBe(false);
    expect(policyResult.reason).toContain('reserved to the Super Administrator');

    // Service check: Attempting to call appointLeader throws Forbidden
    await expect(
      ChapterService.appointLeader(
        officerActor!,
        manjeriChapterId,
        testUser2Id,
        'SECRETARY'
      )
    ).rejects.toThrow(/Forbidden/);
  });

  it('7. Chapter Officers must NOT automatically receive Super Admin privileges', async () => {
    const officerActor = await getSessionActor(testUser1Token);
    expect(officerActor).toBeDefined();
    expect(officerActor?.roles).not.toContain('SUPER_ADMIN');
    expect(officerActor?.roles).not.toContain('DISTRICT_ADMIN');
  });

  it('8. Single-holder replacement: Appointing a new President deactivates prior President and revokes role assignment', async () => {
    const appointment2 = await ChapterService.appointLeader(
      superAdminActor,
      manjeriChapterId,
      testUser2Id,
      'PRESIDENT',
      'New Chapter President of Manjeri'
    );
    expect(appointment2.isActive).toBe(true);
    expect(appointment2.userId).toBe(testUser2Id);
    secondAppointmentId = appointment2.id;

    // Prior appointment is marked inactive with endDate recorded
    const oldAppointment = await db.chapterLeadership.findUnique({
      where: { id: firstAppointmentId },
    });
    expect(oldAppointment?.isActive).toBe(false);
    expect(oldAppointment?.endDate).toBeDefined();

    // Prior leader loses CHAPTER_PRESIDENT roleAssignment
    const oldRoleAssignment = await db.userRoleAssignment.findFirst({
      where: {
        userId: testUser1Id,
        chapterId: manjeriChapterId,
        role: { code: 'CHAPTER_PRESIDENT' },
      },
    });
    expect(oldRoleAssignment).toBeNull();

    // Old leader's session no longer reflects CHAPTER_PRESIDENT
    const oldActor = await getSessionActor(testUser1Token);
    expect(oldActor?.roles).not.toContain('CHAPTER_PRESIDENT');

    // New leader has CHAPTER_PRESIDENT
    const newActor = await getSessionActor(testUser2Token);
    expect(newActor?.roles).toContain('CHAPTER_PRESIDENT');
    expect(newActor?.chapterId).toBe(manjeriChapterId);

    // Audit event recorded for replacement
    const replacementAudit = await db.auditEvent.findFirst({
      where: {
        resourceId: appointment2.id,
        action: 'LEADERSHIP_APPOINTED',
      },
    });
    expect(replacementAudit).toBeDefined();
  });

  it('9. Revocation requires mandatory reason, records audit log, and immediately revokes access', async () => {
    const mandatoryReason = 'Constitutional rotation / executive reorganization';

    const revoked = await ChapterService.revokeLeader(
      superAdminActor,
      manjeriChapterId,
      secondAppointmentId,
      mandatoryReason
    );

    expect(revoked.isActive).toBe(false);
    expect(revoked.endDate).toBeDefined();

    // Verify Audit Event logged with reason
    const revokeAudit = await db.auditEvent.findFirst({
      where: {
        resourceId: secondAppointmentId,
        action: 'LEADERSHIP_ROLE_REVOKED',
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(revokeAudit).toBeDefined();
    expect((revokeAudit?.diffJson as any)?.reason).toBe(mandatoryReason);

    // User 2 loses roleAssignment
    const user2RoleAssignment = await db.userRoleAssignment.findFirst({
      where: {
        userId: testUser2Id,
        chapterId: manjeriChapterId,
        role: { code: 'CHAPTER_PRESIDENT' },
      },
    });
    expect(user2RoleAssignment).toBeNull();

    // Session claims updated immediately
    const revokedActor = await getSessionActor(testUser2Token);
    expect(revokedActor?.roles).not.toContain('CHAPTER_PRESIDENT');

    // Access to Manjeri Executive applications rejected
    await expect(
      ChapterService.getChapterApplications(revokedActor!, manjeriChapterId)
    ).rejects.toThrow(/Forbidden/);

    // Historical records preserved in DB
    const historicalAppointments = await db.chapterLeadership.findMany({
      where: {
        id: { in: [firstAppointmentId, secondAppointmentId] },
      },
    });
    expect(historicalAppointments.length).toBe(2);
    expect(historicalAppointments.every((a) => !a.isActive)).toBe(true);
  });
});
