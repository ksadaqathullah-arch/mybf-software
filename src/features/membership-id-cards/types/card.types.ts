export type CardStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED';

export interface PublicCardVerificationResult {
  isValid: boolean;
  membershipNumber: string;
  fullName: string;
  categoryName: string;
  chapterName: string;
  status: CardStatus;
  validUntil: string;
  issuedAt: string;
  verificationTimestamp: string;
  message?: string;
}

export interface DigitalIdCardPayload {
  membershipNumber: string;
  fullName: string;
  categoryName: string;
  chapterName: string;
  photoUrl?: string | null;
  status: CardStatus;
  issuedAt: string;
  validUntil: string;
  verificationToken: string;
}
