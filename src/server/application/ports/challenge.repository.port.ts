import {
  VerificationChallengeEntity,
  ChallengeType,
} from '../../domain/identity/entities/verification-challenge.entity';

export interface IChallengeRepository {
  findLatest(
    userId: string,
    type: ChallengeType,
    identifier: string
  ): Promise<VerificationChallengeEntity | null>;
  save(challenge: VerificationChallengeEntity): Promise<void>;
  countRecent(userId: string, type: ChallengeType, sinceMinutes: number): Promise<number>;
}
