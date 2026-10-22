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

export const memberRegistrationSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    primaryPhone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),

    // Age Eligibility: Mandatory DOB with server-side validation
    dateOfBirth: z.string().min(1, 'Date of birth is required'),

    // Special Age Exception Workflow (>35 years)
    requestAgeException: z.boolean().default(false),
    ageExceptionReason: z.string().max(1000).optional(),

    // Gender: Configurable single-choice dropdown (optional)
    gender: z.enum(['MALE', 'FEMALE']).optional().nullable(),

    chapterId: z.string().min(1, 'Please select an active chapter in Malappuram'),

    // Independent Member Classification
    memberCategory: z.enum(MEMBER_CATEGORY_VALUES, {
      message: 'Please select a valid Member Category / Interest',
    }),
    currentPosition: z.enum(CURRENT_POSITION_VALUES, {
      message: 'Please select your Current Position',
    }),
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
    district: z.string().default('Malappuram'),
    taluk: z.string().optional(),
    localBody: z.string().optional(),
    ward: z.string().optional(),
    postOffice: z.string().optional(),
    pinCode: z.string().regex(/^\d{6}$/, 'PIN Code must be 6 digits').optional(),

    // Login Credentials Section
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9_.]+$/, 'Username can only contain letters, numbers, underscores, and periods'),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),

    // Compliance & Consent
    consentAcknowledged: z.boolean().refine((val) => val === true, {
      message: 'You must acknowledge the terms and organizational charter.',
    }),
  })
  .superRefine((data, ctx) => {
    // Validate password match
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }

    if (!data.dateOfBirth) return;
    const res = validateYouthAgeEligibility(data.dateOfBirth);

    if (data.requestAgeException) {
      if (res.eligible) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['requestAgeException'],
          message: 'Applicant is aged 35 or below. Standard membership applies; age exception is not required.',
        });
        return;
      }
      if (!data.ageExceptionReason || data.ageExceptionReason.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ageExceptionReason'],
          message: 'Please provide a clear justification (minimum 10 characters) for requesting an age exception.',
        });
      }
    } else {
      if (!res.eligible) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dateOfBirth'],
          message: res.error || AGE_ELIGIBILITY_ERROR_MESSAGE,
        });
      }
    }
  });

export type MemberRegistrationInput = z.input<typeof memberRegistrationSchema>;

export const superAdminApplicationReviewSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  action: z.enum(['APPROVE', 'REJECT'], { message: 'Action must be APPROVE or REJECT' }),
  reason: z.string().min(5, 'A mandatory reason of at least 5 characters is required for auditing'),
});

export type SuperAdminApplicationReviewInput = z.infer<typeof superAdminApplicationReviewSchema>;

export const superAdminAgeExceptionReviewSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  decision: z.enum(['APPROVE', 'REJECT'], { message: 'Decision must be APPROVE or REJECT' }),
  reason: z.string().min(5, 'A mandatory reason of at least 5 characters is required for auditing'),
});

export type SuperAdminAgeExceptionReviewInput = z.infer<typeof superAdminAgeExceptionReviewSchema>;

export const accountActivationSchema = z
  .object({
    token: z.string().min(16, 'Invalid or missing activation token'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password cannot exceed 100 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type AccountActivationInput = z.infer<typeof accountActivationSchema>;

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
  action: z.enum(['APPROVE', 'REJECT', 'REQUEST_INFO', 'RECOMMEND_APPROVAL', 'REQUEST_CORRECTION']),
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

