import { z } from 'zod';

import {
  validateYouthAgeEligibility,
  AGE_ELIGIBILITY_ERROR_MESSAGE,
} from '../constants/youth-discovery';

export const MEMBER_CATEGORY_VALUES = [
  'STUDENT',
  'ASPIRING_ENTREPRENEUR',
  'ENTREPRENEUR_BUSINESS_OWNER',
  'OTHER',
] as const;

export const CURRENT_POSITION_VALUES = [
  'STUDENT',
  'EMPLOYEE',
  'WORKER',
  'BUSINESS_OWNER',
  'ENTREPRENEUR',
  'SELF_EMPLOYED',
  'OTHER',
] as const;

export const memberRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  primaryPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  
  // Age Eligibility: Mandatory DOB with strict server-side <=35 age calculation
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .superRefine((val, ctx) => {
      const res = validateYouthAgeEligibility(val);
      if (!res.eligible) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: res.error || AGE_ELIGIBILITY_ERROR_MESSAGE,
        });
      }
    }),
  
  // Gender: Configurable single-choice dropdown (optional)
  gender: z.enum(['MALE', 'FEMALE']).optional().nullable(),
  
  chapterId: z.string().min(1, 'Please select an active chapter in Malappuram'),
  
  // Independent Member Classification (Replaces legacy tier/fee classification)
  memberCategory: z.enum(MEMBER_CATEGORY_VALUES, {
    message: 'Please select a valid Member Category / Interest',
  }),
  currentPosition: z.enum(CURRENT_POSITION_VALUES, {
    message: 'Please select your Current Position',
  }),
  // Optional backward-compatible reference (deprecated)
  categoryId: z.string().optional(),
  
  // Expectations from MYBF (At least 1 required)
  expectations: z
    .array(z.string())
    .min(1, 'Please select at least one expectation from MYBF'),
  otherExpectationText: z.string().max(300).optional(),
  
  // Future Goal for the next 3 years (Optional, max 500 chars)
  futureGoal: z.string().max(500, 'Goal cannot exceed 500 characters').optional(),
  
  // Extracurricular Talents & Skills (Categorized, optional)
  talents: z.array(z.string()).default([]),
  otherTalentDescription: z.string().max(300).optional(),
  
  // Participation Preferences (Multi-select, optional)
  participationPreferences: z.array(z.string()).default([]),
  
  // Professional & Business Details
  occupation: z.string().min(2, 'Please state your occupation or profession'),
  companyName: z.string().optional(),
  businessSector: z.string().optional(),
  yearsInBusiness: z.number().int().min(0).max(60).optional(),
  isStudent: z.boolean().default(false),
  institutionName: z.string().optional(),
  courseName: z.string().optional(),

  // Geographic Residence Details
  addressLine: z.string().optional(),
  taluk: z.string().optional(),
  ward: z.string().optional(),
  pinCode: z.string().regex(/^\d{6}$/, 'PIN Code must be 6 digits').optional(),
  
  // Compliance & Consent
  consentAcknowledged: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the terms and organizational charter.',
  }),
});

export type MemberRegistrationInput = z.infer<typeof memberRegistrationSchema>;

export const updateYouthProfileSchema = z.object({
  expectations: z.array(z.string()).min(1, 'Please select at least one expectation from MYBF'),
  otherExpectationText: z.string().max(300).optional(),
  futureGoal: z.string().max(500, 'Goal cannot exceed 500 characters').optional(),
  talents: z.array(z.string()).default([]),
  otherTalentDescription: z.string().max(300).optional(),
  participationPreferences: z.array(z.string()).default([]),
  gender: z.enum(['MALE', 'FEMALE']).optional().nullable(),
});

export type UpdateYouthProfileInput = z.infer<typeof updateYouthProfileSchema>;

export const applicationReviewSchema = z.object({
  applicationId: z.string().uuid(),
  action: z.enum(['APPROVE', 'REJECT', 'REQUEST_INFO']),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export type ApplicationReviewInput = z.infer<typeof applicationReviewSchema>;

export const chapterTransferSchema = z.object({
  memberProfileId: z.string().uuid(),
  destinationChapterId: z.string().uuid('Please select target chapter'),
  reason: z.string().min(10, 'Please state the reason for chapter transfer (relocation, business base, etc.)'),
});

export type ChapterTransferInput = z.infer<typeof chapterTransferSchema>;

export const updateMemberClassificationSchema = z.object({
  memberCategory: z.enum(MEMBER_CATEGORY_VALUES, {
    message: 'Please select a valid Member Category / Interest',
  }),
  currentPosition: z.enum(CURRENT_POSITION_VALUES, {
    message: 'Please select your Current Position',
  }),
});

export type UpdateMemberClassificationInput = z.infer<typeof updateMemberClassificationSchema>;

