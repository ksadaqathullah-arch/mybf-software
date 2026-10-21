import { db } from '@/server/db';
import { IChallengeRepository } from '../../application/ports/challenge.repository.port';
import {
  VerificationChallengeEntity,
  ChallengeType,
} from '../../domain/identity/entities/verification-challenge.entity';

export class PrismaChallengeRepository implements IChallengeRepository {
  private mapTypeToContactType(type: ChallengeType): string {
    return type === 'PHONE_OTP' ? 'PHONE' : 'EMAIL';
  }

  private mapContactTypeToType(contactType: string): ChallengeType {
    return contactType === 'PHONE' ? 'PHONE_OTP' : 'EMAIL_TOKEN';
  }

  public async findLatest(
    userId: string,
    type: ChallengeType,
    identifier: string
  ): Promise<VerificationChallengeEntity | null> {
    const contactType = this.mapTypeToContactType(type);
    const record = await db.contactVerificationChallenge.findFirst({
      where: {
        userId,
        contactType,
        targetValue: identifier,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) return null;
    return this.toEntity(record);
  }

  public async save(challenge: VerificationChallengeEntity): Promise<void> {
    const props = challenge.props;
    const contactType = this.mapTypeToContactType(props.type);
    const isVerified = !!props.verifiedAt;
    const resendAfter = new Date(Date.now() + 60 * 1000);

    await db.contactVerificationChallenge.upsert({
      where: { id: challenge.id },
      create: {
        id: challenge.id,
        userId: props.userId,
        contactType,
        targetValue: props.identifier,
        tokenHash: props.tokenHash,
        attemptsCount: props.attempts,
        resendAfter,
        isVerified,
        expiresAt: props.expiresAt,
        verifiedAt: props.verifiedAt ?? null,
      },
      update: {
        attemptsCount: props.attempts,
        isVerified,
        verifiedAt: props.verifiedAt ?? null,
      },
    });
  }

  public async countRecent(userId: string, type: ChallengeType, sinceMinutes: number): Promise<number> {
    const contactType = this.mapTypeToContactType(type);
    const since = new Date(Date.now() - sinceMinutes * 60 * 1000);
    return db.contactVerificationChallenge.count({
      where: {
        userId,
        contactType,
        createdAt: { gte: since },
      },
    });
  }

  private toEntity(record: any): VerificationChallengeEntity {
    return new VerificationChallengeEntity(
      record.id,
      {
        userId: record.userId,
        type: this.mapContactTypeToType(record.contactType),
        identifier: record.targetValue,
        tokenHash: record.tokenHash,
        attempts: record.attemptsCount,
        maxAttempts: 5,
        expiresAt: record.expiresAt,
        verifiedAt: record.verifiedAt,
      },
      record.createdAt,
      record.createdAt
    );
  }
}
