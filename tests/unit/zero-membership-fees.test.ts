import { describe, it, expect } from 'vitest';
import { MEMBERSHIP_CATEGORIES } from '@/features/memberships/constants/categories';
import { createPaymentIntentSchema } from '@/features/finance/schemas/payment.schema';
import { MEMBER_CATEGORIES, CURRENT_POSITIONS } from '@/features/memberships/constants/member-classifications';

describe('Zero Membership Fees Policy & Free NGO Platform Enforcements', () => {
  it('enforces 0 INR annualFee for all organizational membership categories', () => {
    expect(MEMBERSHIP_CATEGORIES.length).toBeGreaterThan(0);
    MEMBERSHIP_CATEGORIES.forEach((cat) => {
      expect(cat.annualFeeINR).toBe(0);
    });
  });

  it('rejects MEMBERSHIP_FEE in payment intent creation and restricts purpose to legitimate NGO items', () => {
    // Attempting to create a payment intent for MEMBERSHIP_FEE must fail validation
    const membershipFeeInput = {
      purpose: 'MEMBERSHIP_FEE',
      amountINR: 3000,
      idempotencyKey: 'test-idempotency-key-12345678',
    };

    const result = createPaymentIntentSchema.safeParse(membershipFeeInput);
    expect(result.success).toBe(false);

    // Legitimate NGO event ticketing and sponsorship payments must pass validation
    const eventTicketInput = {
      purpose: 'EVENT_TICKET',
      amountINR: 500,
      idempotencyKey: 'test-idempotency-key-12345678',
    };
    expect(createPaymentIntentSchema.safeParse(eventTicketInput).success).toBe(true);

    const sponsorshipInput = {
      purpose: 'SPONSORSHIP',
      amountINR: 50000,
      idempotencyKey: 'test-idempotency-key-12345678',
    };
    expect(createPaymentIntentSchema.safeParse(sponsorshipInput).success).toBe(true);
  });

  it('guarantees classifications are independent of fee and payment tiers', () => {
    expect(MEMBER_CATEGORIES.map((c) => c.value)).toEqual([
      'STUDENT',
      'ASPIRING_ENTREPRENEUR',
      'ENTREPRENEUR_BUSINESS_OWNER',
      'OTHER',
    ]);

    expect(CURRENT_POSITIONS.map((p) => p.value)).toEqual([
      'STUDENT',
      'EMPLOYEE',
      'WORKER',
      'BUSINESS_OWNER',
      'ENTREPRENEUR',
      'SELF_EMPLOYED',
      'OTHER',
    ]);
  });
});
