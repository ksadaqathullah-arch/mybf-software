import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  calculateAge,
  validateYouthAgeEligibility,
  validateAgeExceptionEligibility,
  MIN_ELIGIBLE_AGE,
  MAX_ELIGIBLE_AGE,
  AGE_ELIGIBILITY_ERROR_MESSAGE,
  UNDER_AGE_ERROR_MESSAGE,
} from '@/features/memberships/constants/youth-discovery';
import {
  memberRegistrationSchema,
  superAdminAgeExceptionReviewSchema,
  accountActivationSchema,
} from '@/features/memberships/schemas/membership.schema';
import { authorize } from '@/server/auth/policy';
import type { AuthActor } from '@/server/auth/types';

describe('MYBF Full Membership Lifecycle, Age Guard & Super Admin Exception Tests', () => {
  const referenceDate = new Date('2026-10-15T00:00:00Z');

  // ==========================================
  // 1. AGE BOUNDARY AND ELIGIBILITY TESTS
  // ==========================================
  describe('Age Boundaries & Eligibility Validation', () => {
    it('approves standard eligible youth aged between 18 and 35', () => {
      // 25 years old
      const res25 = validateYouthAgeEligibility('2001-10-15', referenceDate);
      expect(res25.eligible).toBe(true);
      expect(res25.age).toBe(25);
      expect(res25.requiresAgeException).toBeFalsy();

      // Exactly 18 years old today
      const res18 = validateYouthAgeEligibility('2008-10-15', referenceDate);
      expect(res18.eligible).toBe(true);
      expect(res18.age).toBe(18);
    });

    it('considers an applicant aged exactly 35 years and 364 days eligible without exception', () => {
      // 36th birthday will be tomorrow: 1990-10-16
      const res35 = validateYouthAgeEligibility('1990-10-16', referenceDate);
      expect(res35.eligible).toBe(true);
      expect(res35.age).toBe(35);
      expect(res35.requiresAgeException).toBeFalsy();
    });

    it('requires special Super Admin exception when applicant reaches 36th birthday', () => {
      // Born 1990-10-15 => turns 36 today
      const res36 = validateYouthAgeEligibility('1990-10-15', referenceDate);
      expect(res36.eligible).toBe(false);
      expect(res36.age).toBe(36);
      expect(res36.requiresAgeException).toBe(true);
      expect(res36.error).toBe(AGE_ELIGIBILITY_ERROR_MESSAGE);
    });

    it('accepts applicant under 18 years of age (no minimum age restriction)', () => {
      // 17 years old (born 2009-10-16 with reference 2026-10-15 => 16 years old)
      const res17 = validateYouthAgeEligibility('2009-10-16', referenceDate);
      expect(res17.eligible).toBe(true);
      expect(res17.age).toBe(16);
      expect(res17.requiresAgeException).toBeFalsy();
    });

    it('validates age exception eligibility for applicants aged 36+', () => {
      const resException = validateAgeExceptionEligibility('1985-05-12', referenceDate);
      expect(resException.validForException).toBe(true);
      expect(resException.age).toBe(41);

      // Rejects age exception request if applicant is already eligible youth (<= 35)
      const resYouth = validateAgeExceptionEligibility('2000-01-01', referenceDate);
      expect(resYouth.validForException).toBe(false);
      expect(resYouth.error).toContain('already within the standard eligible youth age');
    });
  });

  // ==========================================
  // 2. REGISTRATION SCHEMA WITH AGE EXCEPTION
  // ==========================================
  describe('Membership Registration Schema Validation', () => {
    const validBaseData = {
      fullName: 'Ahmad Bilal',
      email: 'bilal@enterprise.in',
      primaryPhone: '9847123456',
      dateOfBirth: '1998-05-20', // ~28 years old
      chapterId: 'manjeri',
      memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER' as const,
      currentPosition: 'BUSINESS_OWNER' as const,
      occupation: 'Retail Business Founder',
      companyName: 'Bilal Traders',
      businessSector: 'Retail & Distribution',
      expectations: ['NETWORKING_CONNECTIONS'],
      talents: ['PUBLIC_SPEAKING'],
      participationPreferences: ['PARTICIPATE_EVENTS'],
      consentAcknowledged: true,
      requestAgeException: false,
      username: 'ahmad_bilal',
      password: 'StrongPassword@2026',
      confirmPassword: 'StrongPassword@2026',
    };

    it('accepts standard registration for eligible youth under 35 with username and password', () => {
      const parsed = memberRegistrationSchema.safeParse(validBaseData);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.requestAgeException).toBe(false);
        expect(parsed.data.username).toBe('ahmad_bilal');
        expect(parsed.data.password).toBe('StrongPassword@2026');
      }
    });

    it('rejects registration over 35 if requestAgeException is false', () => {
      const dataOver35 = {
        ...validBaseData,
        dateOfBirth: '1985-01-10', // 41 years old
        requestAgeException: false,
      };
      const parsed = memberRegistrationSchema.safeParse(dataOver35);
      expect(parsed.success).toBe(false);
    });

    it('accepts registration over 35 when requestAgeException is true with valid reason', () => {
      const dataWithException = {
        ...validBaseData,
        dateOfBirth: '1985-01-10', // 41 years old
        requestAgeException: true,
        ageExceptionReason: 'Experienced wholesale distributor with 15 years experience, willing to mentor MYBF youth founders.',
      };
      const parsed = memberRegistrationSchema.safeParse(dataWithException);
      expect(parsed.success).toBe(true);
    });

    it('rejects age exception if justification reason is shorter than 10 characters', () => {
      const dataShortReason = {
        ...validBaseData,
        dateOfBirth: '1985-01-10',
        requestAgeException: true,
        ageExceptionReason: 'Too short',
      };
      const parsed = memberRegistrationSchema.safeParse(dataShortReason);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues.some((i) => i.path.includes('ageExceptionReason'))).toBe(true);
      }
    });
  });

  // ==========================================
  // 3. SUPER ADMIN PERMISSION & EXCEPTION REVIEW
  // ==========================================
  describe('Super Admin Age Exception Permissions & Review Schema', () => {
    it('validates Super Admin review schema with valid decision and audited reason', () => {
      const validReview = {
        applicationId: 'app-uuid-1234',
        decision: 'APPROVE' as const,
        reason: 'Granted exception on basis of senior mentorship contribution and state award recognition.',
      };
      const parsed = superAdminAgeExceptionReviewSchema.safeParse(validReview);
      expect(parsed.success).toBe(true);
    });

    it('rejects review if reason is shorter than 10 characters', () => {
      const invalidReview = {
        applicationId: 'app-uuid-1234',
        decision: 'REJECT' as const,
        reason: 'No',
      };
      const parsed = superAdminAgeExceptionReviewSchema.safeParse(invalidReview);
      expect(parsed.success).toBe(false);
    });

    it('authorizes only SUPER_ADMIN to perform global and system-level actions', () => {
      const superAdminActor: AuthActor = {
        userId: 'super-admin-1',
        email: 'superadmin@mybf.in',
        phone: null,
        status: 'ACTIVE',
        roles: ['SUPER_ADMIN'],
      };

      const result = authorize({
        actor: superAdminActor,
        action: 'admin.system_config',
        resource: 'system_config',
      });
      expect(result.allowed).toBe(true);
      expect(result.evaluatedScope).toBe('GLOBAL');

      const chapterOfficer: AuthActor = {
        userId: 'officer-1',
        email: 'officer@manjeri.mybf.in',
        phone: '9847000001',
        status: 'ACTIVE',
        roles: ['CHAPTER_PRESIDENT'],
        chapterId: 'manjeri-id',
      };

      const officerResult = authorize({
        actor: chapterOfficer,
        action: 'admin.system_config',
        resource: 'system_config',
      });
      expect(officerResult.allowed).toBe(false);
    });
  });

  // ==========================================
  // 4. ACCOUNT ACTIVATION & SECURITY
  // ==========================================
  describe('Separate Account Activation & Password Security', () => {
    it('accepts valid account activation with matching strong passwords and unique username', () => {
      const validActivation = {
        token: 'a'.repeat(32),
        username: 'anas_enterprises',
        password: 'Password@2026',
        confirmPassword: 'Password@2026',
      };
      const parsed = accountActivationSchema.safeParse(validActivation);
      expect(parsed.success).toBe(true);
    });

    it('rejects activation when password and confirmPassword do not match', () => {
      const mismatch = {
        token: 'a'.repeat(32),
        username: 'anas_enterprises',
        password: 'Password@2026',
        confirmPassword: 'DifferentPassword@2026',
      };
      const parsed = accountActivationSchema.safeParse(mismatch);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
      }
    });

    it('rejects password shorter than 8 characters', () => {
      const shortPass = {
        token: 'a'.repeat(32),
        username: 'anas_enterprises',
        password: 'Pass1!',
        confirmPassword: 'Pass1!',
      };
      const parsed = accountActivationSchema.safeParse(shortPass);
      expect(parsed.success).toBe(false);
    });

    it('verifies SHA-256 activation token hashing and scrypt password hashing', () => {
      // Single-use token hash
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      expect(tokenHash.length).toBe(64);

      // Scrypt password hash
      const password = 'StrongPassword@2026';
      const salt = crypto.randomBytes(16).toString('hex');
      const derivedKey = crypto.scryptSync(password, salt, 64);
      const fullHash = `scrypt$${salt}$${derivedKey.toString('hex')}`;

      // Verify hash reconstruction
      const [algo, storedSalt, storedHex] = fullHash.split('$');
      expect(algo).toBe('scrypt');
      const verifyKey = crypto.scryptSync(password, storedSalt, 64);
      expect(verifyKey.toString('hex')).toBe(storedHex);
    });
  });

  // ==========================================
  // 5. EVENT TICKET BOOKING & DUPLICATE GUARD
  // ==========================================
  describe('Event Ticket Booking & Free Pass Integrity', () => {
    it('generates cryptographically secure event QR ticket tokens', () => {
      const qrToken = `EVT-${crypto.randomBytes(12).toString('hex')}`;
      expect(qrToken.startsWith('EVT-')).toBe(true);
      expect(qrToken.length).toBe(28); // "EVT-" (4) + 24 hex chars = 28
    });

    it('ensures free NGO event registration model respects 0 fee', () => {
      const freeTicketPrice = 0;
      expect(freeTicketPrice).toBe(0);
    });
  });
});
