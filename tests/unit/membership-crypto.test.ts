import { describe, it, expect } from 'vitest';
import { generateVerificationToken, verifyTokenSignature } from '@/features/membership-id-cards/server/card-crypto';

describe('Digital ID Card Cryptographic Token Verification', () => {
  it('generates high-entropy token and verifies valid signatures', () => {
    const memberId = 'MYBF-0000000001';
    const version = 1;

    const token = generateVerificationToken(memberId, version);

    expect(token).toBeDefined();
    expect(token).toContain('.');

    const isValid = verifyTokenSignature(memberId, version, token);
    expect(isValid).toBe(true);
  });

  it('rejects tampered tokens or mismatched membership numbers', () => {
    const memberId = 'MYBF-0000000001';
    const version = 1;

    const token = generateVerificationToken(memberId, version);

    // Mismatched member ID check
    const mismatch = verifyTokenSignature('MYBF-0000000002', version, token);
    expect(mismatch).toBe(false);

    // Tampered token payload check
    const tampered = token.slice(0, -3) + 'abc';
    const isTamperedValid = verifyTokenSignature(memberId, version, tampered);
    expect(isTamperedValid).toBe(false);
  });
});
