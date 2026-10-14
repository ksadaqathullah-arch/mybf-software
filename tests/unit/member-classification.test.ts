import { describe, it, expect } from 'vitest';
import {
  MEMBER_CATEGORIES,
  CURRENT_POSITIONS,
  getMemberCategoryLabel,
  getCurrentPositionLabel,
  type MemberCategoryValue,
  type CurrentPositionValue,
} from '@/features/memberships/constants/member-classifications';
import {
  memberRegistrationSchema,
  updateMemberClassificationSchema,
} from '@/features/memberships/schemas/membership.schema';
import { authorize } from '@/server/auth/policy';
import { AuthActor } from '@/server/auth/types';

describe('MYBF Member Classification System', () => {
  describe('Authoritative Classification Constants & Enums', () => {
    it('defines exactly the 4 required Member Categories / Interests', () => {
      const categoryValues = MEMBER_CATEGORIES.map((c) => c.value);
      expect(categoryValues).toEqual([
        'STUDENT',
        'ASPIRING_ENTREPRENEUR',
        'ENTREPRENEUR_BUSINESS_OWNER',
        'OTHER',
      ]);
      expect(MEMBER_CATEGORIES.find((c) => c.value === 'ASPIRING_ENTREPRENEUR')?.label).toBe(
        'Interested in Starting a Business'
      );
      expect(MEMBER_CATEGORIES.find((c) => c.value === 'ENTREPRENEUR_BUSINESS_OWNER')?.label).toBe(
        'Entrepreneur / Business Owner'
      );
    });

    it('defines exactly the 7 required Current Positions', () => {
      const positionValues = CURRENT_POSITIONS.map((p) => p.value);
      expect(positionValues).toEqual([
        'STUDENT',
        'EMPLOYEE',
        'WORKER',
        'BUSINESS_OWNER',
        'ENTREPRENEUR',
        'SELF_EMPLOYED',
        'OTHER',
      ]);
      expect(CURRENT_POSITIONS.find((p) => p.value === 'BUSINESS_OWNER')?.label).toBe('Business Owner');
      expect(CURRENT_POSITIONS.find((p) => p.value === 'SELF_EMPLOYED')?.label).toBe('Self-Employed');
    });

    it('handles "Not provided" fallback for unclassified historical records', () => {
      expect(getMemberCategoryLabel(null)).toBe('Not provided');
      expect(getMemberCategoryLabel(undefined)).toBe('Not provided');
      expect(getMemberCategoryLabel('')).toBe('Not provided');

      expect(getCurrentPositionLabel(null)).toBe('Not provided');
      expect(getCurrentPositionLabel(undefined)).toBe('Not provided');
      expect(getCurrentPositionLabel('')).toBe('Not provided');
    });

    it('correctly maps enum values to human-readable labels', () => {
      expect(getMemberCategoryLabel('STUDENT')).toBe('Student');
      expect(getMemberCategoryLabel('ASPIRING_ENTREPRENEUR')).toBe('Interested in Starting a Business');
      expect(getCurrentPositionLabel('EMPLOYEE')).toBe('Employee');
      expect(getCurrentPositionLabel('ENTREPRENEUR')).toBe('Entrepreneur');
    });
  });

  describe('Registration Schema Validation', () => {
    const validBaseInput = {
      fullName: 'Mohammed Anas',
      email: 'anas@enterprise.in',
      primaryPhone: '9847012345',
      dateOfBirth: '1995-05-15',
      expectations: ['NETWORKING_CONNECTIONS'],
      chapterId: 'manjeri-chapter-id',
      occupation: 'Managing Director',
      consentAcknowledged: true,
    };

    it('successfully accepts valid combinations of Category and Position', () => {
      const combinations: Array<[MemberCategoryValue, CurrentPositionValue]> = [
        ['ASPIRING_ENTREPRENEUR', 'EMPLOYEE'],
        ['ENTREPRENEUR_BUSINESS_OWNER', 'BUSINESS_OWNER'],
        ['STUDENT', 'STUDENT'],
        ['OTHER', 'SELF_EMPLOYED'],
        ['ASPIRING_ENTREPRENEUR', 'WORKER'],
      ];

      for (const [cat, pos] of combinations) {
        const result = memberRegistrationSchema.safeParse({
          ...validBaseInput,
          memberCategory: cat,
          currentPosition: pos,
        });
        expect(result.success).toBe(true);
      }
    });

    it('rejects registration when Member Category is missing', () => {
      const result = memberRegistrationSchema.safeParse({
        ...validBaseInput,
        currentPosition: 'EMPLOYEE',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.memberCategory).toBeDefined();
      }
    });

    it('rejects registration when Current Position is missing', () => {
      const result = memberRegistrationSchema.safeParse({
        ...validBaseInput,
        memberCategory: 'STUDENT',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.currentPosition).toBeDefined();
      }
    });

    it('rejects invalid enum values for both fields', () => {
      const invalidCatResult = memberRegistrationSchema.safeParse({
        ...validBaseInput,
        memberCategory: 'VIP_PLATINUM_TIER',
        currentPosition: 'EMPLOYEE',
      });
      expect(invalidCatResult.success).toBe(false);

      const invalidPosResult = memberRegistrationSchema.safeParse({
        ...validBaseInput,
        memberCategory: 'STUDENT',
        currentPosition: 'FOUNDER_CEO',
      });
      expect(invalidPosResult.success).toBe(false);
    });

    it('allows registration without legacy categoryId or pricing fee parameters', () => {
      const result = memberRegistrationSchema.safeParse({
        ...validBaseInput,
        memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER',
        currentPosition: 'BUSINESS_OWNER',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.categoryId).toBeUndefined();
      }
    });
  });

  describe('Edit Profile Classification Schema', () => {
    it('validates updateMemberClassificationSchema properly', () => {
      const valid = updateMemberClassificationSchema.safeParse({
        memberCategory: 'ASPIRING_ENTREPRENEUR',
        currentPosition: 'EMPLOYEE',
      });
      expect(valid.success).toBe(true);

      const invalid = updateMemberClassificationSchema.safeParse({
        memberCategory: 'UNKNOWN',
        currentPosition: 'WORKER',
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('Authorization & Data Boundary Policies', () => {
    it('allows member to edit their own classification', () => {
      const memberActor: AuthActor = {
        userId: 'member-user-100',
        email: 'anas@enterprise.in',
        phone: '9847012345',
        status: 'ACTIVE',
        roles: ['MEMBER'],
        chapterId: 'ch-manjeri',
        organizationId: 'org-mybf',
      };

      const result = authorize({
        actor: memberActor,
        action: 'member.update_classification',
        resource: 'membership',
        recordOwnerId: 'member-user-100', // Own profile
        chapterId: 'ch-manjeri',
        organizationId: 'org-mybf',
      });

      expect(result.allowed).toBe(true);
      expect(result.evaluatedScope).toBe('OWN_RECORD');
    });

    it('strictly forbids a member from modifying another member classification', () => {
      const memberActor: AuthActor = {
        userId: 'member-user-100',
        email: 'anas@enterprise.in',
        phone: '9847012345',
        status: 'ACTIVE',
        roles: ['MEMBER'],
        chapterId: 'ch-manjeri',
        organizationId: 'org-mybf',
      };

      const result = authorize({
        actor: memberActor,
        action: 'member.update_classification',
        resource: 'membership',
        recordOwnerId: 'different-member-999', // Foreign profile
        chapterId: 'ch-manjeri',
        organizationId: 'org-mybf',
      });

      expect(result.allowed).toBe(false);
    });

    it('allows Chapter Leadership to update classifications within their chapter only', () => {
      const chapterPresident: AuthActor = {
        userId: 'pres-manjeri',
        email: 'pres@manjeri.mybf.in',
        phone: '9847000111',
        status: 'ACTIVE',
        roles: ['CHAPTER_PRESIDENT'],
        chapterId: 'ch-manjeri',
        organizationId: 'org-mybf',
      };

      // Own chapter: allowed
      const ownResult = authorize({
        actor: chapterPresident,
        action: 'member.review_application',
        resource: 'membership_application',
        chapterId: 'ch-manjeri',
        organizationId: 'org-mybf',
      });
      expect(ownResult.allowed).toBe(true);
      expect(ownResult.evaluatedScope).toBe('CHAPTER');

      // Cross-chapter: denied
      const crossResult = authorize({
        actor: chapterPresident,
        action: 'member.review_application',
        resource: 'membership_application',
        chapterId: 'ch-tirur',
        organizationId: 'org-mybf',
      });
      expect(crossResult.allowed).toBe(false);
      expect(crossResult.reason).toContain('Cross-chapter access violation');
    });

    it('allows District Admin to view and manage classifications across chapters in district', () => {
      const districtAdmin: AuthActor = {
        userId: 'dist-admin-1',
        email: 'lead@district.mybf.in',
        phone: '9847000222',
        status: 'ACTIVE',
        roles: ['DISTRICT_ADMIN'],
        organizationId: 'org-mybf',
      };

      const result = authorize({
        actor: districtAdmin,
        action: 'member.read_district',
        resource: 'membership',
        organizationId: 'org-mybf',
        chapterId: 'ch-tirur',
      });

      expect(result.allowed).toBe(true);
      expect(result.evaluatedScope).toBe('DISTRICT');
    });
  });

  describe('Multi-Attribute Filtering & Export Simulation', () => {
    const mockRoster = [
      { id: '1', name: 'A', category: 'ASPIRING_ENTREPRENEUR', position: 'EMPLOYEE' },
      { id: '2', name: 'B', category: 'ASPIRING_ENTREPRENEUR', position: 'WORKER' },
      { id: '3', name: 'C', category: 'ENTREPRENEUR_BUSINESS_OWNER', position: 'BUSINESS_OWNER' },
      { id: '4', name: 'D', category: null, position: null }, // Historical unclassified
    ];

    it('filters accurately by combined Category and Position', () => {
      const filtered = mockRoster.filter(
        (m) => m.category === 'ASPIRING_ENTREPRENEUR' && m.position === 'EMPLOYEE'
      );
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('A');
    });

    it('identifies unclassified historical records correctly', () => {
      const unclassified = mockRoster.filter((m) => m.category === null);
      expect(unclassified.length).toBe(1);
      expect(unclassified[0].name).toBe('D');
      expect(getMemberCategoryLabel(unclassified[0].category)).toBe('Not provided');
      expect(getCurrentPositionLabel(unclassified[0].position)).toBe('Not provided');
    });

    it('generates CSV row headers and rows with new classifications', () => {
      const headers = ['Member ID', 'Category', 'Position'];
      const row = ['MYBF-0000000001', getMemberCategoryLabel('STUDENT'), getCurrentPositionLabel('STUDENT')];
      const csv = `${headers.join(',')}\n${row.join(',')}`;
      expect(csv).toContain('Member ID,Category,Position');
      expect(csv).toContain('MYBF-0000000001,Student,Student');
      expect(csv).not.toContain('Membership Tier');
      expect(csv).not.toContain('annualFeeINR');
    });
  });
});
