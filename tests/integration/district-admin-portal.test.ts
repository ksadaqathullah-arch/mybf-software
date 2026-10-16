import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '@/server/db';
import { DistrictAdminService } from '@/features/district-admin/server/district-admin.service';
import { GeographyService } from '@/features/geography/server/geography.service';
import type { AuthActor } from '@/server/auth/types';

describe('MYBF District Admin Portal Functional & Security Integration Suite', () => {
  let districtAdminActor: AuthActor;
  let superAdminActor: AuthActor;
  let unauthorizedMemberActor: AuthActor;

  beforeAll(async () => {
    const org = await db.organization.findFirst();
    const adminUser = await db.user.findFirst({
      where: { email: 'ksadaqathullah@gmail.com' },
    });

    const district = await db.district.findFirst({
      where: { code: 'MLP' },
    });

    districtAdminActor = {
      userId: adminUser?.id || 'district-admin-test-id',
      email: adminUser?.email || 'ksadaqathullah@gmail.com',
      phone: adminUser?.phone || null,
      status: 'ACTIVE',
      roles: ['DISTRICT_ADMIN'],
      organizationId: org?.id,
      districtId: district?.id,
    };

    superAdminActor = {
      userId: adminUser?.id || 'super-admin-test-id',
      email: adminUser?.email || 'ksadaqathullah@gmail.com',
      phone: adminUser?.phone || null,
      status: 'ACTIVE',
      roles: ['SUPER_ADMIN'],
      organizationId: org?.id,
    };

    unauthorizedMemberActor = {
      userId: 'test-unauth-member-id',
      email: 'regular.member@mybf.test',
      phone: '9847000111',
      status: 'ACTIVE',
      roles: ['MEMBER'],
      organizationId: org?.id,
    };
  });

  describe('1. Security & RBAC Scoping Enforcement', () => {
    it('denies access to unauthorized member without DISTRICT_ADMIN role', () => {
      expect(() => {
        DistrictAdminService.assertDistrictAdmin(unauthorizedMemberActor);
      }).toThrow('Forbidden: District Administrator credentials required.');
    });

    it('denies access to inactive actors', () => {
      const inactiveActor: AuthActor = {
        ...districtAdminActor,
        status: 'SUSPENDED',
      };
      expect(() => {
        DistrictAdminService.assertDistrictAdmin(inactiveActor);
      }).toThrow('Unauthorized: Authentication required.');
    });

    it('permits authorized DISTRICT_ADMIN actor', () => {
      expect(() => {
        DistrictAdminService.assertDistrictAdmin(districtAdminActor);
      }).not.toThrow();
    });

    it('permits SUPER_ADMIN actor to oversee district administration', () => {
      expect(() => {
        DistrictAdminService.assertDistrictAdmin(superAdminActor);
      }).not.toThrow();
    });

    it('resolves canonical Malappuram district record with code MLP', async () => {
      const district = await DistrictAdminService.resolveDistrict();
      expect(district).toBeDefined();
      expect(district.code).toBe('MLP');
      expect(district.name).toContain('Malappuram');
    });
  });

  describe('2. 16 Chapters Module & Data Integrity', () => {
    it('loads all 16 Assembly Constituency chapters', async () => {
      const chapters = await DistrictAdminService.getDistrictChapters(districtAdminActor);
      expect(chapters).toHaveLength(16);

      const codes = chapters.map((c) => c.code);
      const expectedCodes = [
        'CHP-01-KONDOTTY', 'CHP-02-ERANAD', 'CHP-03-NILAMBUR', 'CHP-04-WANDOOR',
        'CHP-05-MANJERI', 'CHP-06-PERINTHALMANNA', 'CHP-07-MANKADA', 'CHP-08-MALAPPURAM',
        'CHP-09-VENGARA', 'CHP-10-VALLIKKUNNU', 'CHP-11-TIRURANGADI', 'CHP-12-TANUR',
        'CHP-13-TIRUR', 'CHP-14-KOTTAKKAL', 'CHP-15-THAVANUR', 'CHP-16-PONNANI',
      ];
      expectedCodes.forEach((code) => {
        expect(codes).toContain(code);
      });
    });

    it('distinguishes database ID, chapter code, and URL slug', async () => {
      const chapters = await DistrictAdminService.getDistrictChapters(districtAdminActor);
      const manjeri = chapters.find((c) => c.slug === 'manjeri');
      expect(manjeri).toBeDefined();
      expect(manjeri?.code).toBe('CHP-05-MANJERI');
      expect(manjeri?.name).toBe('Manjeri Chapter');
      expect(manjeri?.slug).toBe('manjeri');
      expect(manjeri?.taluk).toBe('Ernad');
      expect(typeof manjeri?.activeMembersCount).toBe('number');
      expect(typeof manjeri?.pendingApplicationsCount).toBe('number');
    });
  });

  describe('3. District Overview Metrics', () => {
    it('returns genuine PostgreSQL aggregates without mock numbers', async () => {
      const overview = await DistrictAdminService.getDistrictOverviewMetrics(districtAdminActor);

      expect(overview.districtCode).toBe('MLP');
      expect(overview.totalChaptersCount).toBe(16);
      expect(overview.activeChaptersCount).toBeGreaterThan(0);
      expect(overview.totalDistrictMembers).toBeGreaterThanOrEqual(0);
      expect(overview.pendingDistrictReviews).toBeGreaterThanOrEqual(0);
      expect(overview.taluks).toHaveLength(7);
      expect(overview.chapters).toHaveLength(16);
    });
  });

  describe('4. Members Directory & Multi-Dimensional Filtering', () => {
    it('supports paginated member query within district scope', async () => {
      const result = await DistrictAdminService.getDistrictMembers(districtAdminActor, {
        page: 1,
        pageSize: 10,
      });

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(Array.isArray(result.members)).toBe(true);
      expect(typeof result.total).toBe('number');
    });

    it('filters members by chapter slug accurately', async () => {
      const result = await DistrictAdminService.getDistrictMembers(districtAdminActor, {
        chapterSlug: 'manjeri',
      });

      result.members.forEach((m) => {
        expect(m.chapterSlug).toBe('manjeri');
      });
    });

    it('filters members by talent and expectation without cross-leakage', async () => {
      const result = await DistrictAdminService.getDistrictMembers(districtAdminActor, {
        talent: 'CODING',
      });

      result.members.forEach((m) => {
        expect(m.talents).toContain('CODING');
      });
    });
  });

  describe('5. Membership Applications Governance', () => {
    it('queries applications within district scope with applicant details', async () => {
      const result = await DistrictAdminService.getDistrictApplications(districtAdminActor, {
        page: 1,
        pageSize: 10,
      });

      expect(result.page).toBe(1);
      expect(Array.isArray(result.applications)).toBe(true);
      if (result.applications.length > 0) {
        const app = result.applications[0];
        expect(app.applicant.fullName).toBeDefined();
        expect(app.chapterName).toBeDefined();
      }
    });

    it('records district review notes and creates immutable audit log', async () => {
      const firstApp = await db.membershipApplication.findFirst({
        where: { chapter: { district: { code: 'MLP' } } },
      });

      if (firstApp) {
        const testNote = `District review verification completed on ${new Date().toISOString()}`;
        const updated = await DistrictAdminService.recordDistrictReviewNote(
          districtAdminActor,
          firstApp.id,
          testNote
        );

        expect(updated.reviewNotes).toBe(testNote);

        // Verify audit log
        const auditLog = await db.auditEvent.findFirst({
          where: {
            resourceId: firstApp.id,
            action: 'DISTRICT_ADMIN_APPLICATION_REVIEWED',
          },
          orderBy: { createdAt: 'desc' },
        });

        expect(auditLog).toBeDefined();
        expect(auditLog?.actorEmail).toBe(districtAdminActor.email);
      }
    });
  });

  describe('6. NGO Finance & Fee Policy Compliance', () => {
    it('confirms 100% Free Membership policy with zero fees', async () => {
      const finance = await DistrictAdminService.getDistrictFinance(districtAdminActor);

      expect(finance.membershipPolicy.isFree).toBe(true);
      expect(finance.membershipPolicy.collectedMembershipFees).toBe(0);
      expect(finance.membershipPolicy.policyStatement).toContain('100% Free Membership Policy');
    });
  });

  describe('7. Taluk Geography Reference Intelligence', () => {
    it('retrieves all 7 taluks of Malappuram', () => {
      const taluks = GeographyService.getTaluks();
      expect(taluks).toHaveLength(7);
      const talukNames = taluks.map((t) => t.name);
      expect(talukNames).toContain('Ernad');
      expect(talukNames).toContain('Perinthalmanna');
      expect(talukNames).toContain('Tirur');
      expect(talukNames).toContain('Ponnani');
      expect(talukNames).toContain('Nilambur');
      expect(talukNames).toContain('Tirurangadi');
      expect(talukNames).toContain('Kondotty');
    });

    it('safely verifies postal PIN without fabricating ward assignments', () => {
      const manjeriPin = GeographyService.lookupPinCode('676121');
      expect(manjeriPin.found).toBe(true);
      expect(manjeriPin.taluk).toBe('Ernad');
      expect(manjeriPin.locality).toBe('Manjeri H.O');

      const unindexedPin = GeographyService.lookupPinCode('999999');
      expect(unindexedPin.found).toBe(false);
      expect(unindexedPin.message).toContain('Requires manual verification');
    });

    it('aggregates geographic distribution across taluks from database', async () => {
      const distribution = await GeographyService.getGeographicDistribution();
      expect(Array.isArray(distribution)).toBe(true);
    });
  });

  describe('8. Growth Analytics Reporting', () => {
    it('returns aggregated growth analytics and timeline', async () => {
      const analytics = await DistrictAdminService.getDistrictAnalytics(districtAdminActor);

      expect(analytics.districtCode).toBe('MLP');
      expect(analytics.chapterComparisons).toHaveLength(16);
      expect(Array.isArray(analytics.categoryDistribution)).toBe(true);
      expect(Array.isArray(analytics.positionDistribution)).toBe(true);
      expect(Array.isArray(analytics.monthlyTimeline)).toBe(true);
    });
  });
});
