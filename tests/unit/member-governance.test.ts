import { describe, it, expect } from 'vitest';
import { authorize } from '@/server/auth/policy';
import { AuthActor } from '@/server/auth/types';
import {
  memberProfileUpdateSchema,
  phoneChangeRequestSchema,
  phoneChangeVerifySchema,
  emailChangeRequestSchema,
  emailChangeVerifySchema,
  identityCorrectionRequestSchema,
  chapterTransferRequestSchema,
  chapterTransferRecommendationSchema,
  districtTransferDecisionSchema,
  superAdminTransferOverrideSchema,
  reviewCorrectionRequestSchema,
} from '@/features/memberships/schemas/member-governance.schema';

describe('Member Identity & Governance Schema Validation', () => {
  describe('Profile Updates Schema', () => {
    it('accepts valid partial profile updates', () => {
      const validPayload = {
        primaryPhone: '+919846012345',
        occupation: 'Software Architect',
        companyName: 'Tech Innovations Kerala',
        district: 'Malappuram',
        taluk: 'Eranad',
        pinCode: '676121',
        bloodGroup: 'O+',
      };

      const parsed = memberProfileUpdateSchema.parse(validPayload);
      expect(parsed.primaryPhone).toBe('+919846012345');
      expect(parsed.taluk).toBe('Eranad');
      expect(parsed.bloodGroup).toBe('O+');
    });

    it('rejects invalid pin codes', () => {
      expect(() =>
        memberProfileUpdateSchema.parse({
          pinCode: '1234', // Must be 6 digits
        })
      ).toThrow();

      expect(() =>
        memberProfileUpdateSchema.parse({
          pinCode: '67612A', // Non-digits
        })
      ).toThrow();
    });
  });

  describe('Contact Change & OTP Validation', () => {
    it('validates mobile number format for verification challenge', () => {
      const valid = phoneChangeRequestSchema.parse({
        newPhone: '9847123456',
      });
      expect(valid.newPhone).toBe('9847123456');

      expect(() =>
        phoneChangeRequestSchema.parse({
          newPhone: '123', // Too short
        })
      ).toThrow();
    });

    it('validates 6-digit OTP code schema', () => {
      const valid = phoneChangeVerifySchema.parse({
        newPhone: '9847123456',
        otp: '123456',
      });
      expect(valid.otp).toBe('123456');

      expect(() =>
        phoneChangeVerifySchema.parse({
          newPhone: '9847123456',
          otp: '123', // Less than 6 digits
        })
      ).toThrow();
    });

    it('validates email change request and token verification', () => {
      const validReq = emailChangeRequestSchema.parse({
        newEmail: 'user.new@mybf.org',
      });
      expect(validReq.newEmail).toBe('user.new@mybf.org');

      expect(() =>
        emailChangeRequestSchema.parse({
          newEmail: 'invalid-email-address',
        })
      ).toThrow();

      const validVerify = emailChangeVerifySchema.parse({
        newEmail: 'user.new@mybf.org',
        token: 'verify-token-12345',
      });
      expect(validVerify.token).toBe('verify-token-12345');
    });
  });

  describe('Identity Corrections (Sensitive Attributes)', () => {
    it('accepts valid full name and date of birth correction requests', () => {
      const validName = identityCorrectionRequestSchema.parse({
        field: 'fullName',
        requestedValue: 'Mohammed Anas K',
        reason: 'Typographical correction matching official Aadhaar credential',
        documentUrl: 'https://docs.mybf.org/aadhaar-doc.pdf',
      });
      expect(validName.field).toBe('fullName');

      const validDob = identityCorrectionRequestSchema.parse({
        field: 'dateOfBirth',
        requestedValue: '1998-05-15',
        reason: 'Correcting birth record to match 10th standard certificate',
      });
      expect(validDob.field).toBe('dateOfBirth');
    });

    it('requires a reason of at least 10 characters', () => {
      expect(() =>
        identityCorrectionRequestSchema.parse({
          field: 'fullName',
          requestedValue: 'New Name',
          reason: 'Too short', // 9 characters
        })
      ).toThrow();
    });
  });

  describe('Chapter Transfers & Multi-Tier Approvals', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';

    it('validates member chapter transfer initiation request', () => {
      const valid = chapterTransferRequestSchema.parse({
        destinationChapterId: validUuid,
        reason: 'Permanent business relocation from Manjeri to Perinthalmanna',
      });
      expect(valid.destinationChapterId).toBe(validUuid);
    });

    it('validates chapter officer recommendation schema', () => {
      const validRec = chapterTransferRecommendationSchema.parse({
        transferId: validUuid,
        recommendation: 'RECOMMEND_APPROVAL',
        remarks: 'Confirmed member has relocated primary commercial operation to new constituency.',
      });
      expect(validRec.recommendation).toBe('RECOMMEND_APPROVAL');

      expect(() =>
        chapterTransferRecommendationSchema.parse({
          transferId: validUuid,
          recommendation: 'RECOMMEND_APPROVAL',
          remarks: 'Bad', // Less than 5 characters
        })
      ).toThrow();
    });

    it('validates district admin final transfer decision schema', () => {
      const validDecision = districtTransferDecisionSchema.parse({
        transferId: validUuid,
        decision: 'APPROVE',
        remarks: 'District Executive Committee endorsed transfer. Executing atomic assignment update.',
      });
      expect(validDecision.decision).toBe('APPROVE');
    });

    it('enforces rigorous 15-character justification for super admin override', () => {
      const validOverride = superAdminTransferOverrideSchema.parse({
        transferId: validUuid,
        action: 'FORCE_APPROVE',
        justification: 'Emergency secretariat directive due to cross-district relocation dispute.',
      });
      expect(validOverride.action).toBe('FORCE_APPROVE');

      expect(() =>
        superAdminTransferOverrideSchema.parse({
          transferId: validUuid,
          action: 'FORCE_APPROVE',
          justification: 'Short override', // Less than 15 characters
        })
      ).toThrow();
    });
  });
});

describe('18–40 Age Eligibility Policy Verification', () => {
  const isEligibleYouthAge = (dobString: string, refDate = new Date('2026-10-19')): boolean => {
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return false;

    let age = refDate.getFullYear() - dob.getFullYear();
    const m = refDate.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && refDate.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 18 && age <= 40;
  };

  it('approves candidates exactly 18 or 40 years of age', () => {
    // Exactly 18 on 2026-10-19 -> born 2008-10-19
    expect(isEligibleYouthAge('2008-10-19')).toBe(true);

    // Exactly 40 on 2026-10-19 -> born 1986-10-19
    expect(isEligibleYouthAge('1986-10-19')).toBe(true);

    // 25 years old -> born 2001-05-10
    expect(isEligibleYouthAge('2001-05-10')).toBe(true);
  });

  it('rejects candidates under 18 years of age', () => {
    // 17 years and 364 days old -> born 2008-10-20
    expect(isEligibleYouthAge('2008-10-20')).toBe(false);

    // 15 years old -> born 2011-01-01
    expect(isEligibleYouthAge('2011-01-01')).toBe(false);
  });

  it('rejects candidates over 40 years of age without special dispensation', () => {
    // 41 years old -> born 1985-10-18
    expect(isEligibleYouthAge('1985-10-18')).toBe(false);

    // 45 years old -> born 1981-01-01
    expect(isEligibleYouthAge('1981-01-01')).toBe(false);
  });
});

describe('Role-Based Access Control Policies for Governance Actions', () => {
  const memberActor: AuthActor = {
    userId: 'user-member-1',
    email: 'anas@mybf.org',
    phone: '+919846012345',
    status: 'ACTIVE',
    roles: ['MEMBER'],
    chapterId: 'chap-manjeri',
  };

  const districtAdminActor: AuthActor = {
    userId: 'user-dist-admin',
    email: 'admin.malappuram@mybf.org',
    phone: null,
    status: 'ACTIVE',
    roles: ['DISTRICT_ADMIN'],
  };

  const superAdminActor: AuthActor = {
    userId: 'user-super-admin',
    email: 'root@mybf.org',
    phone: null,
    status: 'ACTIVE',
    roles: ['SUPER_ADMIN'],
  };

  it('allows authenticated members to verify contact and request identity corrections on own profile', () => {
    const contactAuth = authorize({
      actor: memberActor,
      action: 'member.verify_contact',
      resource: 'membership',
      recordOwnerId: 'user-member-1',
    });
    expect(contactAuth.allowed).toBe(true);

    const correctionAuth = authorize({
      actor: memberActor,
      action: 'member.request_correction',
      resource: 'membership',
      recordOwnerId: 'user-member-1',
    });
    expect(correctionAuth.allowed).toBe(true);
  });

  it('strictly prevents a member from verifying contact or requesting correction for another member', () => {
    const crossMemberAuth = authorize({
      actor: memberActor,
      action: 'member.verify_contact',
      resource: 'membership',
      recordOwnerId: 'user-member-999', // Different user
    });
    expect(crossMemberAuth.allowed).toBe(false);
  });

  it('allows District Admin and Super Admin to review governance requests', () => {
    const distAuth = authorize({
      actor: districtAdminActor,
      action: 'member.verify_contact',
      resource: 'membership',
    });
    expect(distAuth.allowed).toBe(true);

    const superAuth = authorize({
      actor: superAdminActor,
      action: 'member.request_correction',
      resource: 'membership',
    });
    expect(superAuth.allowed).toBe(true);
  });
});
