import { z } from 'zod';

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
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
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
  
  // Compliance
  consentAcknowledged: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the terms and organizational charter.',
  }),
});

export type MemberRegistrationInput = z.infer<typeof memberRegistrationSchema>;

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

