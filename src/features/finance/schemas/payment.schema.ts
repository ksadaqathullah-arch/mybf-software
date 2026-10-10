import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  purpose: z.enum(['MEMBERSHIP_FEE', 'EVENT_TICKET', 'SPONSORSHIP']),
  amountINR: z.number().int().positive('Payment amount must be greater than zero'),
  chapterId: z.string().uuid().optional(),
  idempotencyKey: z.string().min(16, 'Idempotency key must be a unique secure string'),
  notes: z.string().optional(),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;

export const verifyWebhookSignatureSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export type VerifyWebhookSignatureInput = z.infer<typeof verifyWebhookSignatureSchema>;
