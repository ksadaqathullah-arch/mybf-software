import { describe, it, expect } from 'vitest';
import {
  calculateAge,
  validateYouthAgeEligibility,
  MAX_ELIGIBLE_AGE,
  AGE_ELIGIBILITY_ERROR_MESSAGE,
  EXPECTATION_OPTIONS,
  TALENT_CATEGORIES,
  ALL_TALENT_OPTIONS,
  PARTICIPATION_PREFERENCES,
  getExpectationLabel,
  getTalentLabel,
  getTalentCategory,
  getParticipationPreferenceLabel,
} from '@/features/memberships/constants/youth-discovery';
import { memberRegistrationSchema } from '@/features/memberships/schemas/membership.schema';

describe('MYBF Youth Age Eligibility Policy (Max 35 Years)', () => {
  const referenceDate = new Date('2026-10-14T00:00:00Z');

  it('correctly calculates age in years for past dates', () => {
    // Born 2000-10-14 => exactly 26
    expect(calculateAge('2000-10-14', referenceDate)).toBe(26);

    // Born 2000-10-15 => 25 (birthday is tomorrow)
    expect(calculateAge('2000-10-15', referenceDate)).toBe(25);

    // Born 2000-10-13 => 26 (birthday was yesterday)
    expect(calculateAge('2000-10-13', referenceDate)).toBe(26);
  });

  it('considers an applicant who is 35 years and 364 days old eligible', () => {
    // 36th birthday will be tomorrow: 1990-10-15
    const dob = '1990-10-15';
    const result = validateYouthAgeEligibility(dob, referenceDate);
    expect(result.eligible).toBe(true);
    expect(result.age).toBe(35);
    expect(result.error).toBeUndefined();
  });

  it('rejects an applicant on their exact 36th birthday', () => {
    // Born 1990-10-14 => turns 36 today
    const dob = '1990-10-14';
    const result = validateYouthAgeEligibility(dob, referenceDate);
    expect(result.eligible).toBe(false);
    expect(result.age).toBe(36);
    expect(result.error).toBe(AGE_ELIGIBILITY_ERROR_MESSAGE);
  });

  it('rejects an applicant who is 37 or older', () => {
    const dob = '1988-05-20';
    const result = validateYouthAgeEligibility(dob, referenceDate);
    expect(result.eligible).toBe(false);
    expect(result.age).toBeGreaterThan(35);
    expect(result.error).toBe(AGE_ELIGIBILITY_ERROR_MESSAGE);
  });

  it('rejects future dates of birth', () => {
    const futureDob = '2027-01-01';
    const result = validateYouthAgeEligibility(futureDob, referenceDate);
    expect(result.eligible).toBe(false);
    expect(result.error).toBe('Date of birth cannot be in the future.');
  });

  it('handles leap years correctly', () => {
    // Born on leap day: 1992-02-29
    // On 2026-10-14, age is 34
    const leapDob = '1992-02-29';
    const result = validateYouthAgeEligibility(leapDob, referenceDate);
    expect(result.eligible).toBe(true);
    expect(result.age).toBe(34);
  });
});

describe('Youth Catalogs & Classification Preservations', () => {
  it('contains 13 expectation options including OTHER', () => {
    expect(EXPECTATION_OPTIONS.length).toBe(13);
    const otherOption = EXPECTATION_OPTIONS.find((o) => o.key === 'OTHER');
    expect(otherOption).toBeDefined();
    expect(getExpectationLabel('NETWORKING_CONNECTIONS')).toBe('Business Networking & Connections');
    expect(getExpectationLabel('STARTUP_GUIDANCE')).toBe('Startup Guidance & Business Launch Support');
  });

  it('contains 4 structured talent categories with valid options', () => {
    expect(TALENT_CATEGORIES.length).toBe(4);
    const categoryKeys = TALENT_CATEGORIES.map((c) => c.key);
    expect(categoryKeys).toEqual([
      'ARTS_CREATIVE',
      'SPORTS_WELLNESS',
      'LEADERSHIP_COMMUNICATION',
      'TECHNOLOGY_INNOVATION',
    ]);

    expect(getTalentLabel('SINGING')).toBe('Singing');
    expect(getTalentCategory('SINGING')).toBe('ARTS_CREATIVE');

    expect(getTalentLabel('FOOTBALL')).toBe('Football');
    expect(getTalentCategory('FOOTBALL')).toBe('SPORTS_WELLNESS');

    expect(getTalentLabel('PUBLIC_SPEAKING')).toBe('Public Speaking');
    expect(getTalentCategory('PUBLIC_SPEAKING')).toBe('LEADERSHIP_COMMUNICATION');

    expect(getTalentLabel('CODING')).toBe('Coding');
    expect(getTalentCategory('CODING')).toBe('TECHNOLOGY_INNOVATION');
  });

  it('contains 10 distinct participation preferences', () => {
    expect(PARTICIPATION_PREFERENCES.length).toBe(10);
    expect(getParticipationPreferenceLabel('PARTICIPATE_EVENTS')).toBe('Participate in MYBF events');
    expect(getParticipationPreferenceLabel('VOLUNTEER_ACTIVITIES')).toBe('Volunteer for MYBF activities');
  });
});

describe('memberRegistrationSchema Zod Validation', () => {
  const validBasePayload = {
    fullName: 'Salman Faris',
    email: 'salman@faris.in',
    primaryPhone: '9847123456',
    dateOfBirth: '1998-06-15', // 28 years old
    gender: 'MALE' as const,
    chapterId: 'manjeri',
    memberCategory: 'ASPIRING_ENTREPRENEUR' as const,
    currentPosition: 'STUDENT' as const,
    occupation: 'Software Intern',
    expectations: ['NETWORKING_CONNECTIONS', 'STARTUP_GUIDANCE'],
    talents: ['CODING', 'PRODUCT_DESIGN'],
    participationPreferences: ['PARTICIPATE_EVENTS', 'COLLABORATE_BUSINESS_PROJECTS'],
    futureGoal: 'Launch an AI agritech platform for Malappuram farmers.',
    consentAcknowledged: true,
  };

  it('validates a compliant youth registration payload', () => {
    const result = memberRegistrationSchema.safeParse(validBasePayload);
    expect(result.success).toBe(true);
  });

  it('allows optional gender to be omitted or null', () => {
    const payloadWithoutGender = { ...validBasePayload, gender: undefined };
    const result = memberRegistrationSchema.safeParse(payloadWithoutGender);
    expect(result.success).toBe(true);
  });

  it('rejects registration when date of birth is missing', () => {
    const payload = { ...validBasePayload, dateOfBirth: '' };
    const result = memberRegistrationSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('rejects registration when applicant age exceeds 35 years', () => {
    // 40 years old
    const payload = { ...validBasePayload, dateOfBirth: '1984-01-01' };
    const result = memberRegistrationSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const dobError = result.error.issues.find((e) => e.path.includes('dateOfBirth'));
      expect(dobError?.message).toBe(AGE_ELIGIBILITY_ERROR_MESSAGE);
    }
  });

  it('rejects registration when no expectations are selected', () => {
    const payload = { ...validBasePayload, expectations: [] };
    const result = memberRegistrationSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const expError = result.error.issues.find((e) => e.path.includes('expectations'));
      expect(expError?.message).toContain('Please select at least one expectation');
    }
  });

  it('accepts registration without talents (talents are optional)', () => {
    const payload = { ...validBasePayload, talents: [] };
    const result = memberRegistrationSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });
});
