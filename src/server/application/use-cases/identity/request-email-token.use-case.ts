import { IUseCase } from '../../common/use-case.interface';
import { IChallengeRepository } from '../../ports/challenge.repository.port';
import { IMemberRepository } from '../../ports/member.repository.port';
import { ICryptoGateway } from '../../ports/crypto.gateway.port';
import { INotificationRepository } from '../../ports/notification.repository.port';
import { IAuditRepository } from '../../ports/audit.repository.port';
import { VerificationChallengeEntity } from '@/server/domain/identity/entities/verification-challenge.entity';
import { NotificationEntity } from '@/server/domain/notifications/entities/notification.entity';
import { AuthActor } from '@/server/auth/types';
import { assertAuthorized } from '@/server/auth/policy';
import {
  UnauthorizedError,
  ConflictError,
  RateLimitExceededError,
  DomainRuleViolationError,
} from '@/server/domain/common/domain-error';
import crypto from 'crypto';

export interface RequestEmailTokenInput {
  newEmail: string;
}

export class RequestEmailTokenUseCase implements IUseCase<RequestEmailTokenInput, { success: boolean; maskedTarget: string; cooldownSeconds: number }> {
  constructor(
    private readonly challengeRepo: IChallengeRepository,
    private readonly memberRepo: IMemberRepository,
    private readonly cryptoGateway: ICryptoGateway,
    private readonly notificationRepo: INotificationRepository,
    private readonly auditRepo: IAuditRepository
  ) {}

  public async execute(
    input: RequestEmailTokenInput,
    actor?: AuthActor
  ): Promise<{ success: boolean; maskedTarget: string; cooldownSeconds: number }> {
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
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new DomainRuleViolationError('Invalid email address format.');
    }

    // Check duplicate
    const existing = await this.memberRepo.findByPhoneOrEmail('', cleanEmail);
    if (existing && existing.props.userId !== actor.userId) {
      throw new ConflictError('This email address is already registered to another member.');
    }

    // Rate limiting
    const recentCount = await this.challengeRepo.countRecent(actor.userId, 'EMAIL_TOKEN', 15);
    if (recentCount >= 5) {
      throw new RateLimitExceededError('Too many email verification attempts. Please wait 15 minutes.');
    }

    const rawOtp = this.cryptoGateway.generateOtp(6);
    const tokenHash = this.cryptoGateway.hashToken(rawOtp);

    const challenge = VerificationChallengeEntity.create(
      crypto.randomUUID(),
      actor.userId,
      'EMAIL_TOKEN',
      cleanEmail,
      tokenHash,
      15 // 15 mins
    );

    await this.challengeRepo.save(challenge);

    const notification = NotificationEntity.create(crypto.randomUUID(), {
      userId: actor.userId,
      type: 'EMAIL_VERIFICATION_OTP',
      title: 'Email Change Verification Code',
      message: `Your MYBF email verification code is ${rawOtp}. Valid for 15 minutes.`,
      metadata: { targetEmail: cleanEmail },
    });
    await this.notificationRepo.create(notification);

    await this.auditRepo.log({
      action: 'EMAIL_CHANGE_VERIFICATION_REQUESTED',
      entityType: 'User',
      entityId: actor.userId,
      actorId: actor.userId,
      payload: { targetEmail: cleanEmail },
    });

    const [user, domain] = cleanEmail.split('@');
    const masked = user.length <= 2 ? `${user[0]}*@${domain}` : `${user.slice(0, 2)}****${user.slice(-1)}@${domain}`;

    return {
      success: true,
      maskedTarget: masked,
      cooldownSeconds: 60,
    };
  }
}
