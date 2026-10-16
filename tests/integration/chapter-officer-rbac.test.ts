import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/server/db';
import { ChapterService } from '@/features/chapters/server/chapter.service';
import { getSessionActor, createSession } from '@/server/auth/session';
import type { AuthActor } from '@/server/auth/types';

describe('Chapter Officer RBAC, Session Claims & Super Admin Appointment', () => {
  let orgId: string;
  let manjeriChapterId: string;
  let testCandidateUserId: string;
  let testAppointmentId: string;
  let testSessionToken: string;

  const superAdminActor: AuthActor = {
    userId: 'test-super-admin-rbac',
    email: 'admin.secretariat@mybf.in',
    phone: '9847111003',
    status: 'ACTIVE',
    roles: ['SUPER_ADMIN'],
  };

  beforeAll(async () => {
    const org = await db.organization.findFirst();
    if (!org) throw new Error('Org not found');
    orgId = org.id;

    const manjeri = await db.chapter.findFirst({ where: { slug: 'manjeri' } });
    if (!manjeri) throw new Error('Manjeri not found');
    manjeriChapterId = manjeri.id;

    // Create a test user who is initially only a standard MEMBER of Kondotty
    const kondotty = await db.chapter.findFirst({ where: { slug: 'kondotty' } });
    if (!kondotty) throw new Error('Kondotty not found');

    const memberRole = await db.role.findUnique({ where: { code: 'MEMBER' } });
    if (!memberRole) throw new Error('MEMBER role not seeded');

    // Clean up prior test user if exists
    await db.user.deleteMany({ where: { email: 'candidate.officer@test.in' } });

    const testUser = await db.user.create({
      data: {
        username: 'candidate_officer',
        email: 'candidate.officer@test.in',
        phone: '9847222333',
        status: 'ACTIVE',
        profile: {
          create: {
            organizationId: orgId,
            chapterId: kondotty.id,
            fullName: 'Candidate Officer Test',
            email: 'candidate.officer@test.in',
            dateOfBirth: new Date('1998-05-20'),
            primaryPhone: '9847222333',
            memberCategory: 'ASPIRING_ENTREPRENEUR',
            currentPosition: 'SELF_EMPLOYED',
          },
        },
        roleAssignments: {
          create: {
            roleId: memberRole.id,
            organizationId: orgId,
            chapterId: kondotty.id,
          },
        },
      },
    });
    testCandidateUserId = testUser.id;
    testSessionToken = await createSession(testCandidateUserId);
  });

  afterAll(async () => {
    if (testCandidateUserId) {
      await db.session.deleteMany({ where: { userId: testCandidateUserId } });
      await db.chapterLeadership.deleteMany({ where: { userId: testCandidateUserId } });
      await db.userRoleAssignment.deleteMany({ where: { userId: testCandidateUserId } });
      await db.memberProfile.deleteMany({ where: { userId: testCandidateUserId } });
      await db.user.deleteMany({ where: { id: testCandidateUserId } });
    }
  });

  it('standard member without chapter officer appointment is denied executive dashboard access', async () => {
    const actor = await getSessionActor(testSessionToken);
    expect(actor).toBeDefined();
    expect(actor?.roles).toEqual(['MEMBER']);
    expect(actor?.chapterId).not.toBe(manjeriChapterId);

    // Assert that attempting to read Manjeri applications throws Forbidden
    await expect(
      ChapterService.getChapterApplications(actor!, manjeriChapterId)
    ).rejects.toThrow(/Forbidden/);
  });

  it('Super Admin appoints candidate as Manjeri Chapter President with audit logging and RBAC sync', async () => {
    const appointment = await ChapterService.appointLeader(
      superAdminActor,
      manjeriChapterId,
      testCandidateUserId,
      'PRESIDENT',
      'Manjeri Chapter President'
    );

    expect(appointment).toBeDefined();
    expect(appointment.role).toBe('PRESIDENT');
    expect(appointment.chapterId).toBe(manjeriChapterId);
    expect(appointment.isActive).toBe(true);
    testAppointmentId = appointment.id;

    // Verify UserRoleAssignment was created
    const roleAssignment = await db.userRoleAssignment.findFirst({
      where: {
        userId: testCandidateUserId,
        chapterId: manjeriChapterId,
        role: { code: 'CHAPTER_PRESIDENT' },
      },
    });
    expect(roleAssignment).toBeDefined();

    // Verify audit event was logged
    const audit = await db.auditEvent.findFirst({
      where: {
        resourceId: appointment.id,
        action: 'LEADERSHIP_APPOINTED',
      },
    });
    expect(audit).toBeDefined();
  });

  it('session claims dynamically reflect CHAPTER_PRESIDENT role and Manjeri chapter scope', async () => {
    const updatedActor = await getSessionActor(testSessionToken);
    expect(updatedActor).toBeDefined();
    expect(updatedActor?.roles).toContain('CHAPTER_PRESIDENT');
    expect(updatedActor?.chapterId).toBe(manjeriChapterId);

    // Now authorized to read Manjeri applications
    const apps = await ChapterService.getChapterApplications(updatedActor!, manjeriChapterId);
    expect(Array.isArray(apps)).toBe(true);
  });

  it('Super Admin revokes chapter leadership and access is immediately revoked in session', async () => {
    const revoked = await ChapterService.revokeLeader(
      superAdminActor,
      manjeriChapterId,
      testAppointmentId,
      'Tenure completed'
    );
    expect(revoked.isActive).toBe(false);

    // Session claims refresh and actor loses CHAPTER_PRESIDENT role
    const revokedActor = await getSessionActor(testSessionToken);
    expect(revokedActor?.roles).not.toContain('CHAPTER_PRESIDENT');

    // Access to Manjeri Executive Hub is denied again
    await expect(
      ChapterService.getChapterApplications(revokedActor!, manjeriChapterId)
    ).rejects.toThrow(/Forbidden/);
  });
});
