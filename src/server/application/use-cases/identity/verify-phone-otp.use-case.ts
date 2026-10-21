import { IUseCase } from '../../common/use-case.interface';
import { IChallengeRepository } from '../../ports/challenge.repository.port';
import { IMemberRepository } from '../../ports/member.repository.port';
import { ICryptoGateway } from '../../ports/crypto.gateway.port';
import { IAuditRepository } from '../../ports/audit.repository.port';
import { IndianPhoneNumber } from '@/server/domain/identity/value-objects/indian-phone.vo';
import { AuthActor } from '@/server/auth/types';
import { assertAuthorized } from '@/server/auth/policy';
import {
  UnauthorizedError,
  DomainRuleViolationError,
  RateLimitExceededError,
  EntityNotFoundError,
} from '@/server/domain/common/domain-error';

export interface VerifyPhoneOtpInput {
  newPhone: string;
  otp: string;
}

export class VerifyPhoneOtpUseCase implements IUseCase<VerifyPhoneOtpInput, { success: boolean; message: string; verifiedPhone: string }> {
  constructor(
    private readonly challengeRepo: IChallengeRepository,
    private readonly memberRepo: IMemberRepository,
    private readonly cryptoGateway: ICryptoGateway,
    private readonly auditRepo: IAuditRepository
  ) {}

  public async execute(
    input: VerifyPhoneOtpInput,
    actor?: AuthActor
  ): Promise<{ success: boolean; message: string; verifiedPhone: string }> {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new UnauthorizedError();
    }

    assertAuthorized({
      actor,
      action: 'member.verify_contact',
      resource: 'membership',
      recordOwnerId: actor.userId,
    });

    const phoneVo = IndianPhoneNumber.create(input.newPhone);
    const challenge = await this.challengeRepo.findLatest(actor.userId, 'PHONE_OTP', phoneVo.e164);

    if (!challenge) {
      throw new EntityNotFoundError('VerificationChallenge', actor.userId);
    }

    if (challenge.isExpired) {
      throw new DomainRuleViolationError('The OTP has expired. Please request a new code.');
    }

    const inputHash = this.cryptoGateway.hashToken(input.otp);
    const isValid = challenge.verify(inputHash);

    await this.challengeRepo.save(challenge);

    if (!isValid) {
      const remaining = challenge.props.maxAttempts - challenge.props.attempts;
      throw new DomainRuleViolationError(`Incorrect verification code. ${remaining} attempts remaining.`);
    }

    // Update phone on member profile and user
    const member = await this.memberRepo.findByUserId(actor.userId);
    if (member) {
      member.updateVerifiedPhone(phoneVo.e164);
      await this.memberRepo.save(member);
    }

    await this.auditRepo.log({
      action: 'MEMBER_PHONE_VERIFIED',
      entityType: 'MemberProfile',
      entityId: actor.userId,
      actorId: actor.userId,
      payload: { newPhone: phoneVo.e164 },
    });

    return {
      success: true,
      message: 'Mobile number successfully verified and updated on your official member profile.',
      verifiedPhone: phoneVo.e164,
    };
  }
}
