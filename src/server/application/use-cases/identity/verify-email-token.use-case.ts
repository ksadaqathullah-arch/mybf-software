import { IUseCase } from '../../common/use-case.interface';
import { IChallengeRepository } from '../../ports/challenge.repository.port';
import { IMemberRepository } from '../../ports/member.repository.port';
import { ICryptoGateway } from '../../ports/crypto.gateway.port';
import { IAuditRepository } from '../../ports/audit.repository.port';
import { AuthActor } from '@/server/auth/types';
import { assertAuthorized } from '@/server/auth/policy';
import {
  UnauthorizedError,
  DomainRuleViolationError,
  EntityNotFoundError,
} from '@/server/domain/common/domain-error';

export interface VerifyEmailTokenInput {
  newEmail: string;
  token: string;
}

export class VerifyEmailTokenUseCase implements IUseCase<VerifyEmailTokenInput, { success: boolean; message: string; updatedEmail: string }> {
  constructor(
    private readonly challengeRepo: IChallengeRepository,
    private readonly memberRepo: IMemberRepository,
    private readonly cryptoGateway: ICryptoGateway,
    private readonly auditRepo: IAuditRepository
  ) {}

  public async execute(
    input: VerifyEmailTokenInput,
    actor?: AuthActor
  ): Promise<{ success: boolean; message: string; updatedEmail: string }> {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new UnauthorizedError();
    }

    assertAuthorized({
      actor,
      action: 'member.verify_contact',
      resource: 'membership',
      recordOwnerId: actor.userId,
    });

    const cleanEmail = input.newEmail.trim().toLowerCase();
    const challenge = await this.challengeRepo.findLatest(actor.userId, 'EMAIL_TOKEN', cleanEmail);

    if (!challenge) {
      throw new EntityNotFoundError('VerificationChallenge', actor.userId);
    }

    if (challenge.isExpired) {
      throw new DomainRuleViolationError('The email verification code has expired. Please request a new code.');
    }

    const inputHash = this.cryptoGateway.hashToken(input.token);
    const isValid = challenge.verify(inputHash);

    await this.challengeRepo.save(challenge);

    if (!isValid) {
      const remaining = challenge.props.maxAttempts - challenge.props.attempts;
      throw new DomainRuleViolationError(`Incorrect verification code. ${remaining} attempts remaining.`);
    }

    const member = await this.memberRepo.findByUserId(actor.userId);
    if (member) {
      member.updateVerifiedEmail(cleanEmail);
      await this.memberRepo.save(member);
    }

    await this.auditRepo.log({
      action: 'MEMBER_EMAIL_VERIFIED',
      entityType: 'User',
      entityId: actor.userId,
      actorId: actor.userId,
      payload: { oldEmail: actor.email, newEmail: cleanEmail },
    });

    return {
      success: true,
      message: 'Email address successfully verified and updated on your account.',
      updatedEmail: cleanEmail,
    };
  }
}
