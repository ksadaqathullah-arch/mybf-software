import { BaseEntity } from '../../common/entity.base';
import { DomainRuleViolationError, RateLimitExceededError } from '../../common/domain-error';

export type ChallengeType = 'PHONE_OTP' | 'EMAIL_TOKEN';

export interface VerificationChallengeProps {
  userId: string;
  type: ChallengeType;
  identifier: string; // Phone or Email
  tokenHash: string; // One-way SHA-256 hash
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  verifiedAt?: Date | null;
}

export class VerificationChallengeEntity extends BaseEntity<VerificationChallengeProps> {
  public static readonly DEFAULT_MAX_ATTEMPTS = 5;
  public static readonly OTP_VALIDITY_MINUTES = 10;
  public static readonly RATE_LIMIT_COOLDOWN_SECONDS = 60;

  public static create(
    id: string,
    userId: string,
    type: ChallengeType,
    identifier: string,
    tokenHash: string,
    validityMinutes = VerificationChallengeEntity.OTP_VALIDITY_MINUTES
  ): VerificationChallengeEntity {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + validityMinutes * 60 * 1000);

    return new VerificationChallengeEntity(
      id,
      {
        userId,
        type,
        identifier: identifier.trim(),
        tokenHash,
        attempts: 0,
        maxAttempts: VerificationChallengeEntity.DEFAULT_MAX_ATTEMPTS,
        expiresAt,
      },
      now,
      now
    );
  }

  public verify(incomingHash: string): boolean {
    if (this.isVerified) {
      throw new DomainRuleViolationError('Challenge has already been verified.');
    }
    if (this.isExpired) {
      throw new DomainRuleViolationError('Verification code has expired. Please request a new one.');
    }
    if (this._props.attempts >= this._props.maxAttempts) {
      throw new RateLimitExceededError(
        'Maximum verification attempts exceeded. For security, please request a new verification code.'
      );
    }

    this._props.attempts += 1;
    this._updatedAt = new Date();

    if (this._props.tokenHash === incomingHash) {
      this._props.verifiedAt = new Date();
      return true;
    }

    return false;
  }

  public get isExpired(): boolean {
    return new Date() > this._props.expiresAt;
  }

  public get isVerified(): boolean {
    return !!this._props.verifiedAt;
  }

  public get attempts(): number {
    return this._props.attempts;
  }

  public get maxAttempts(): number {
    return this._props.maxAttempts;
  }

  public get identifier(): string {
    return this._props.identifier;
  }

  public get type(): ChallengeType {
    return this._props.type;
  }
}
