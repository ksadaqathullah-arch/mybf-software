import { z } from 'zod';

export const updateProfilePersonalSchema = z.object({
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  alternatePhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Alternate phone must be a valid 10-digit Indian mobile number.')
    .optional()
    .or(z.literal(''))
    .nullable(),
  bloodGroup: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional()
    .or(z.literal(''))
    .nullable(),
  photoUrl: z.string().url('Invalid photo URL').optional().or(z.literal('')).nullable(),
});

export const updateProfileProfessionalSchema = z.object({
  memberCategory: z.enum(['STUDENT', 'ASPIRING_ENTREPRENEUR', 'ENTREPRENEUR_BUSINESS_OWNER', 'OTHER']).optional(),
  currentPosition: z.enum(['STUDENT', 'EMPLOYEE', 'WORKER', 'BUSINESS_OWNER', 'ENTREPRENEUR', 'SELF_EMPLOYED', 'OTHER']).optional(),
  occupation: z.string().trim().max(100).optional().nullable(),
  companyName: z.string().trim().max(100).optional().nullable(),
  businessSector: z.string().trim().max(100).optional().nullable(),
  yearsInBusiness: z.number().int().min(0).max(80).optional().nullable(),
  isStudent: z.boolean().optional(),
  institutionName: z.string().trim().max(150).optional().nullable(),
  courseName: z.string().trim().max(100).optional().nullable(),
  futureGoal: z.string().trim().max(500).optional().nullable(),
  expectations: z.array(z.string()).optional(),
  talents: z.array(z.string()).optional(),
  participationPreferences: z.array(z.string()).optional(),
});

export const updateProfileLocationSchema = z.object({
  district: z.string().default('Malappuram'),
  taluk: z.string().min(1, 'Taluk is required'),
  addressLine: z.string().trim().max(250).optional().nullable(),
  ward: z.string().trim().max(100).optional().nullable(),
  pinCode: z.string().regex(/^[1-9][0-9]{5}$/, 'PIN Code must be a valid 6-digit Indian postal code'),
});

export const memberProfileUpdateSchema = z.object({
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  primaryPhone: z.string().trim().optional(),
  alternatePhone: z.string().trim().optional().or(z.literal('')).nullable(),
  bloodGroup: z.string().optional().or(z.literal('')).nullable(),
  photoUrl: z.string().optional().or(z.literal('')).nullable(),
  memberCategory: z.string().optional(),
  currentPosition: z.string().optional(),
  occupation: z.string().trim().max(100).optional().nullable(),
  companyName: z.string().trim().max(100).optional().nullable(),
  businessSector: z.string().trim().max(100).optional().nullable(),
  yearsInBusiness: z.number().int().min(0).max(80).optional().nullable(),
  isStudent: z.boolean().optional(),
  institutionName: z.string().trim().max(150).optional().nullable(),
  courseName: z.string().trim().max(100).optional().nullable(),
  futureGoal: z.string().trim().max(500).optional().nullable(),
  district: z.string().optional(),
  taluk: z.string().optional(),
  addressLine: z.string().trim().max(250).optional().nullable(),
  ward: z.string().trim().max(100).optional().nullable(),
  pinCode: z.string().regex(/^[1-9][0-9]{5}$/, 'PIN Code must be a valid 6-digit Indian postal code').optional(),
  expectations: z.array(z.string()).optional(),
  talents: z.array(z.string()).optional(),
  participationPreferences: z.array(z.string()).optional(),
});

export const phoneChangeRequestSchema = z.object({
  newPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'New mobile number must be a valid 10-digit Indian mobile number starting with 6-9.'),
});

export const phoneChangeVerifySchema = z.object({
  newPhone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Invalid mobile number format'),
  otp: z.string().trim().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

export const emailChangeRequestSchema = z.object({
  newEmail: z.string().trim().email('Invalid email address format'),
});

export const emailChangeVerifySchema = z.object({
  newEmail: z.string().trim().email('Invalid email address format'),
  token: z.string().trim().min(6, 'Verification token must be at least 6 characters'),
});

export const identityCorrectionRequestSchema = z.object({
  field: z.enum(['fullName', 'dateOfBirth', 'gender', 'other']),
  requestedValue: z.string().trim().min(2, 'Requested value must be at least 2 characters'),
  reason: z.string().trim().min(10, 'Please provide a detailed reason (minimum 10 characters)'),
  documentUrl: z.string().optional().nullable(),
});

export const chapterTransferRequestSchema = z.object({
  destinationChapterId: z.string().uuid('Valid destination chapter must be selected'),
  reason: z.string().trim().min(10, 'Please provide a detailed reason for chapter transfer (minimum 10 characters)'),
});

export const chapterTransferRecommendationSchema = z.object({
  transferId: z.string().uuid('Valid transfer ID required'),
  recommendation: z.enum(['RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION', 'REQUEST_CLARIFICATION']),
  remarks: z.string().trim().min(5, 'Review remarks are mandatory (minimum 5 characters)'),
});

export const districtTransferDecisionSchema = z.object({
  transferId: z.string().uuid('Valid transfer ID required'),
  decision: z.enum(['APPROVE', 'REJECT', 'REQUEST_CLARIFICATION']),
  remarks: z.string().trim().min(5, 'Decision remarks are mandatory (minimum 5 characters)'),
});

export const superAdminTransferOverrideSchema = z.object({
  transferId: z.string().uuid('Valid transfer ID required'),
  action: z.enum(['FORCE_APPROVE', 'FORCE_REJECT', 'RESET_TO_PENDING']),
  justification: z.string().trim().min(15, 'Executive justification is mandatory for super admin overrides (minimum 15 characters)'),
});

export const reviewCorrectionRequestSchema = z.object({
  requestId: z.string().uuid('Valid request ID required'),
  decision: z.enum(['APPROVE', 'REJECT', 'REQUEST_CLARIFICATION']),
  reviewNotes: z.string().trim().min(5, 'Review notes are required (minimum 5 characters)'),
});
