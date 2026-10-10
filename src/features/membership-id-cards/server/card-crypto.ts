import 'server-only';
import crypto from 'crypto';

const SIGNING_SECRET = process.env.ID_CARD_SIGNING_SECRET || 'mybf-id-card-qr-hmac-sha256-verification-secret-production';

/**
 * Generates an opaque, high-entropy cryptographic token for QR code resolution.
 * Format: [randomHex].[hmacSignature]
 * Does not expose any private member attributes in the raw URL/QR.
 */
export function generateVerificationToken(membershipNumber: string, cardVersion: number): string {
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${membershipNumber}:${cardVersion}:${nonce}`;
  const hmac = crypto.createHmac('sha256', SIGNING_SECRET).update(payload).digest('hex');
  return `${nonce}.${hmac}`;
}

/**
 * Validates cryptographic signature integrity
 */
export function verifyTokenSignature(membershipNumber: string, cardVersion: number, token: string): boolean {
  const [nonce, providedHmac] = token.split('.');
  if (!nonce || !providedHmac) return false;

  const payload = `${membershipNumber}:${cardVersion}:${nonce}`;
  const expectedHmac = crypto.createHmac('sha256', SIGNING_SECRET).update(payload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(providedHmac), Buffer.from(expectedHmac));
}
