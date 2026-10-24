import { z } from 'zod';

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

export const superAdminTransferOverrideSchema = z.object({
  transferId: z.string().uuid('Valid transfer ID required'),
  action: z.enum(['FORCE_APPROVE', 'FORCE_REJECT', 'RESET_TO_PENDING']),
  justification: z.string().trim().min(15, 'Executive justification is mandatory for super admin overrides (minimum 15 characters)'),
});

export type SuperAdminTransferOverrideInput = z.infer<typeof superAdminTransferOverrideSchema>;
