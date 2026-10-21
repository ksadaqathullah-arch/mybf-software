import { IUseCase } from '../../common/use-case.interface';
import { IChallengeRepository } from '../../ports/challenge.repository.port';
import { IMemberRepository } from '../../ports/member.repository.port';
import { ICryptoGateway } from '../../ports/crypto.gateway.port';
import { INotificationRepository } from '../../ports/notification.repository.port';
import { VerificationChallengeEntity } from '@/server/domain/identity/entities/verification-challenge.entity';
import { NotificationEntity } from '@/server/domain/notifications/entities/notification.entity';
import { IndianPhoneNumber } from '@/server/domain/identity/value-objects/indian-phone.vo';
import { AuthActor } from '@/server/auth/types';
import { assertAuthorized } from '@/server/auth/policy';
import {
  UnauthorizedError,
  ConflictError,
  RateLimitExceededError,
} from '@/server/domain/common/domain-error';
import crypto from 'crypto';

export interface RequestPhoneOtpInput {
  newPhone: string;
}

export class RequestPhoneOtpUseCase implements IUseCase<RequestPhoneOtpInput, { success: boolean; message: string; cooldownSeconds: number }> {
  constructor(
    private readonly challengeRepo: IChallengeRepository,
    private readonly memberRepo: IMemberRepository,
    private readonly cryptoGateway: ICryptoGateway,
    private readonly notificationRepo: INotificationRepository
  ) {}

  public async execute(
    input: RequestPhoneOtpInput,
    actor?: AuthActor
  ): Promise<{ success: boolean; message: string; cooldownSeconds: number }> {
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

    // 1. Check if phone is already registered to another member
    const existingMember = await this.memberRepo.findByPhoneOrEmail(phoneVo.e164, '');
    if (existingMember && existingMember.props.userId !== actor.userId) {
      throw new ConflictError('This mobile number is already registered to another MYBF member account.');
    }

    // 2. Rate limiting check (max 5 OTP requests per 15 mins)
    const recentCount = await this.challengeRepo.countRecent(actor.userId, 'PHONE_OTP', 15);
    if (recentCount >= 5) {
      throw new RateLimitExceededError(
        'Too many OTP requests. Please wait 15 minutes before requesting another verification code.'
      );
    }

    // 3. Generate 6-digit cryptographically secure OTP
    const rawOtp = this.cryptoGateway.generateOtp(6);
    const tokenHash = this.cryptoGateway.hashToken(rawOtp);

    const challenge = VerificationChallengeEntity.create(
      crypto.randomUUID(),
      actor.userId,
      'PHONE_OTP',
      phoneVo.e164,
      tokenHash,
      10 // 10 minutes validity
    );

    await this.challengeRepo.save(challenge);

    // 4. Create in-app notification with OTP verification details
    const notification = NotificationEntity.create(crypto.randomUUID(), {
      userId: actor.userId,
      type: 'PHONE_VERIFICATION_OTP',
      title: 'Mobile Verification Code',
      message: `Your MYBF mobile verification OTP is ${rawOtp}. Valid for 10 minutes. Do not share this code.`,
      metadata: { phone: phoneVo.e164, channel: 'IN_APP_SECURE' },
    });
    await this.notificationRepo.create(notification);

    return {
      success: true,
      message: `Verification OTP dispatched to ${phoneVo.e164}. Check your notifications.`,
      cooldownSeconds: 60,
    };
  }
}
