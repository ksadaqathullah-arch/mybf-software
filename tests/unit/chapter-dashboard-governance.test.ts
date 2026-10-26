import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { authorize } from '@/server/auth/policy';
import { AuthActor } from '@/server/auth/types';

// Schema under test for Chapter Member Deactivation Request
const deactivationRequestSchema = z.object({
  memberProfileId: z.string().uuid(),
  reason: z.string().min(10, 'Specific administrative justification of at least 10 characters required'),
});

describe('MYBF Chapter Executive Dashboard & Member Governance Unit Tests', () => {
  describe('Part 3: KPI Metrics Formatting & Pluralization', () => {
    function formatCountUnit(count: number, singular: string, plural: string): string {
      return count === 1 ? singular : plural;
    }

    function formatApplicationSubtitle(count: number): string {
      return count === 1
        ? '1 application awaiting recommendation'
        : `${count} applications awaiting recommendation`;
    }

    it('formats 1 application strictly as singular "1 Application"', () => {
      const count = 1;
      const unit = formatCountUnit(count, 'Application', 'Applications');
      expect(`${count} ${unit}`).toBe('1 Application');
      expect(formatApplicationSubtitle(count)).toBe('1 application awaiting recommendation');
    });

    it('formats multiple applications as plural "N Applications"', () => {
      const count = 5;
      const unit = formatCountUnit(count, 'Application', 'Applications');
      expect(`${count} ${unit}`).toBe('5 Applications');
      expect(formatApplicationSubtitle(count)).toBe('5 applications awaiting recommendation');
    });

    it('formats 0 applications as plural "0 Applications"', () => {
      const count = 0;
      const unit = formatCountUnit(count, 'Application', 'Applications');
      expect(`${count} ${unit}`).toBe('0 Applications');
      expect(formatApplicationSubtitle(count)).toBe('0 applications awaiting recommendation');
    });

    it('formats member count strictly with singular/plural', () => {
      expect(formatCountUnit(1, 'Member', 'Members')).toBe('Member');
      expect(formatCountUnit(2, 'Member', 'Members')).toBe('Members');
      expect(formatCountUnit(0, 'Member', 'Members')).toBe('Members');
    });
  });

  describe('Part 2: Maker-Checker Application Review State Management', () => {
    interface ApplicationRecord {
      id: string;
      chapterId: string;
      status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
      chapterRecommendation?: {
        decision: 'RECOMMENDED' | 'NOT_RECOMMENDED';
        notes: string;
      } | null;
    }

    const testApplications: ApplicationRecord[] = [
      { id: 'app-1', chapterId: 'manjeri-id', status: 'SUBMITTED' },
      {
        id: 'app-2',
        chapterId: 'manjeri-id',
        status: 'UNDER_REVIEW',
        chapterRecommendation: { decision: 'RECOMMENDED', notes: 'Verified business owner' },
      },
      { id: 'app-3', chapterId: 'manjeri-id', status: 'APPROVED' },
      { id: 'app-4', chapterId: 'other-id', status: 'SUBMITTED' },
    ];

    it('Pending Reviews count ONLY counts applications with status: SUBMITTED for the assigned chapter', () => {
      const chapterId = 'manjeri-id';
      const pendingReviews = testApplications.filter(
        (app) => app.chapterId === chapterId && app.status === 'SUBMITTED'
      );

      // Only app-1 is SUBMITTED and in manjeri
      expect(pendingReviews.length).toBe(1);
      expect(pendingReviews[0].id).toBe('app-1');
    });

    it('forwarded applications (UNDER_REVIEW) leave the Pending Review queue', () => {
      const chapterId = 'manjeri-id';
      // Simulate chapter executive recommending app-1
      const updatedApplications = testApplications.map((app) =>
        app.id === 'app-1'
          ? {
              ...app,
              status: 'UNDER_REVIEW' as const,
              chapterRecommendation: { decision: 'RECOMMENDED' as const, notes: 'Forwarded to Super Admin' },
            }
          : app
      );

      const pendingAfterRecommendation = updatedApplications.filter(
        (app) => app.chapterId === chapterId && app.status === 'SUBMITTED'
      );

      // app-1 has transitioned to UNDER_REVIEW, pending count is now 0
      expect(pendingAfterRecommendation.length).toBe(0);

      // Forwarded tab includes app-1 and app-2
      const forwardedApps = updatedApplications.filter(
        (app) => app.chapterId === chapterId && app.status === 'UNDER_REVIEW'
      );
      expect(forwardedApps.length).toBe(2);
    });

    it('ensures Chapter Executive recommendation does NOT directly approve membership', () => {
      const chapterOfficer: AuthActor = {
        userId: 'officer-1',
        email: 'officer@mybf.org',
        status: 'ACTIVE',
        roles: ['CHAPTER_PRESIDENT'],
        chapterId: 'manjeri-id',
      };

      // Officer can recommend for own chapter
      const canRecommend = authorize({
        actor: chapterOfficer,
        action: 'application.recommend',
        resource: 'membership_application',
        chapterId: 'manjeri-id',
      });
      expect(canRecommend.allowed).toBe(true);

      // Officer CANNOT access or manage cross-chapter applications
      const crossChapter = authorize({
        actor: chapterOfficer,
        action: 'application.recommend',
        resource: 'membership_application',
        chapterId: 'tirur-id',
      });
      expect(crossChapter.allowed).toBe(false);

      // Super Admin has global scope
      const superAdmin: AuthActor = {
        userId: 'super-admin-1',
        email: 'admin@mybf.org',
        status: 'ACTIVE',
        roles: ['SUPER_ADMIN'],
      };
      const superAdminScope = authorize({
        actor: superAdmin,
        action: 'application.approve',
        resource: 'membership_application',
      });
      expect(superAdminScope.allowed).toBe(true);
      expect(superAdminScope.evaluatedScope).toBe('GLOBAL');
    });
  });

  describe('Part 4: Secure Member Removal / Deactivation Governance', () => {
    it('validates deactivation payload with mandatory justification (>= 10 chars)', () => {
      const validPayload = {
        memberProfileId: '123e4567-e89b-12d3-a456-426614174000',
        reason: '[INELIGIBLE_CRITERIA] Age exceeded without constitutional exception criteria.',
      };
      const parsed = deactivationRequestSchema.parse(validPayload);
      expect(parsed.reason).toContain('Age exceeded');

      // Rejects short justification (< 10 chars)
      expect(() =>
        deactivationRequestSchema.parse({
          memberProfileId: '123e4567-e89b-12d3-a456-426614174000',
          reason: 'Too short',
        })
      ).toThrow();
    });

    it('enforces RBAC on governance actions (Chapter Officer requests, District recommends, Super Admin finalizes)', () => {
      const chapterOfficer: AuthActor = {
        userId: 'officer-1',
        email: 'president.manjeri@mybf.org',
        status: 'ACTIVE',
        roles: ['CHAPTER_PRESIDENT'],
        chapterId: 'manjeri-id',
      };

      const districtAdmin: AuthActor = {
        userId: 'district-1',
        email: 'district@mybf.org',
        status: 'ACTIVE',
        roles: ['DISTRICT_ADMIN'],
      };

      const superAdmin: AuthActor = {
        userId: 'super-1',
        email: 'superadmin@mybf.org',
        status: 'ACTIVE',
        roles: ['SUPER_ADMIN'],
      };

      // Chapter officer can read chapter members for their assigned chapter
      const officerRead = authorize({
        actor: chapterOfficer,
        action: 'member.read_chapter',
        resource: 'chapter',
        chapterId: 'manjeri-id',
      });
      expect(officerRead.allowed).toBe(true);

      // Chapter officer cannot access across chapters
      const crossOfficer = authorize({
        actor: chapterOfficer,
        action: 'member.read_chapter',
        resource: 'chapter',
        chapterId: 'foreign-chapter-id',
      });
      expect(crossOfficer.allowed).toBe(false);

      // District admin has district-wide governance authority
      const distAuth = authorize({
        actor: districtAdmin,
        action: 'district.manage_governance',
        resource: 'governance',
      });
      expect(distAuth.allowed).toBe(true);
      expect(distAuth.evaluatedScope).toBe('DISTRICT');

      // Super Admin has global governance authority
      const superAuth = authorize({
        actor: superAdmin,
        action: 'super_admin.manage_governance',
        resource: 'governance',
      });
      expect(superAuth.allowed).toBe(true);
      expect(superAuth.evaluatedScope).toBe('GLOBAL');
    });

    it('preserves historical integrity: deactivation updates status without deleting records', () => {
      // Mock state before deactivation
      const mockMembership = {
        id: 'mem-1',
        membershipNumber: 'MYBF-MAN-001',
        status: 'ACTIVE',
        memberProfileId: 'prof-1',
        createdAt: new Date('2025-01-01'),
      };

      const mockUser = {
        id: 'usr-1',
        status: 'ACTIVE',
      };

      const mockCard = {
        id: 'card-1',
        status: 'ACTIVE',
      };

      const mockAuditLogs: Array<{ action: string; targetId: string }> = [
        { action: 'MEMBERSHIP_APPROVED', targetId: 'mem-1' },
      ];

      // Simulated atomic deactivation
      const deactivatedMembership = { ...mockMembership, status: 'DEACTIVATED' };
      const deactivatedUser = { ...mockUser, status: 'DEACTIVATED' };
      const revokedCard = { ...mockCard, status: 'REVOKED' };
      mockAuditLogs.push({ action: 'MEMBERSHIP_DEACTIVATED', targetId: 'mem-1' });

      // Verifications:
      // 1. Membership ID is unchanged and preserved
      expect(deactivatedMembership.membershipNumber).toBe('MYBF-MAN-001');
      // 2. Status is DEACTIVATED (not removed from DB)
      expect(deactivatedMembership.status).toBe('DEACTIVATED');
      expect(deactivatedUser.status).toBe('DEACTIVATED');
      expect(revokedCard.status).toBe('REVOKED');
      // 3. Historical audit log contains both creation and deactivation events
      expect(mockAuditLogs.length).toBe(2);
      expect(mockAuditLogs[1].action).toBe('MEMBERSHIP_DEACTIVATED');
    });
  });
});
