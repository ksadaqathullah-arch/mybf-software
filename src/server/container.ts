import 'server-only';
// Repositories
import { PrismaMemberRepository } from './infrastructure/repositories/prisma-member.repository';
import { PrismaChapterRepository } from './infrastructure/repositories/prisma-chapter.repository';
import { PrismaEventRepository } from './infrastructure/repositories/prisma-event.repository';
import { PrismaNotificationRepository } from './infrastructure/repositories/prisma-notification.repository';
import { PrismaGeographyRepository } from './infrastructure/repositories/prisma-geography.repository';
import { PrismaAuditRepository } from './infrastructure/repositories/prisma-audit.repository';
import { PrismaChallengeRepository } from './infrastructure/repositories/prisma-challenge.repository';
import { PrismaTransferRepository } from './infrastructure/repositories/prisma-transfer.repository';
import { PrismaCorrectionRepository } from './infrastructure/repositories/prisma-correction.repository';

// Gateways
import { NodeCryptoGateway } from './infrastructure/gateways/node-crypto.gateway';

// Use Cases - Identity
import { GetMemberProfileUseCase } from './application/use-cases/identity/get-member-profile.use-case';
import { UpdateMemberProfileUseCase } from './application/use-cases/identity/update-member-profile.use-case';
import { RequestPhoneOtpUseCase } from './application/use-cases/identity/request-phone-otp.use-case';
import { VerifyPhoneOtpUseCase } from './application/use-cases/identity/verify-phone-otp.use-case';
import { RequestEmailTokenUseCase } from './application/use-cases/identity/request-email-token.use-case';
import { VerifyEmailTokenUseCase } from './application/use-cases/identity/verify-email-token.use-case';

// Use Cases - Chapters
import { RequestChapterTransferUseCase } from './application/use-cases/chapters/request-chapter-transfer.use-case';
import { ReviewChapterTransferUseCase } from './application/use-cases/chapters/review-chapter-transfer.use-case';

// Use Cases - Events
import { RegisterEventUseCase } from './application/use-cases/events/register-event.use-case';
import { CheckInTicketUseCase } from './application/use-cases/events/check-in-ticket.use-case';

// Use Cases - Geography
import { LookupPinCodeUseCase } from './application/use-cases/geography/lookup-pin-code.use-case';
import { ValidateLocationUseCase } from './application/use-cases/geography/validate-location.use-case';

// Use Cases - Notifications
import { ListNotificationsUseCase } from './application/use-cases/notifications/list-notifications.use-case';
import { MarkNotificationReadUseCase } from './application/use-cases/notifications/mark-notification-read.use-case';

/**
 * Dependency Injection Container for MYBF Clean Architecture
 * Provides thread-safe singleton access for high-concurrency (50+ users)
 */
class AppContainer {
  // Repositories
  public readonly memberRepo = new PrismaMemberRepository();
  public readonly chapterRepo = new PrismaChapterRepository();
  public readonly eventRepo = new PrismaEventRepository();
  public readonly notificationRepo = new PrismaNotificationRepository();
  public readonly geographyRepo = new PrismaGeographyRepository();
  public readonly auditRepo = new PrismaAuditRepository();
  public readonly challengeRepo = new PrismaChallengeRepository();
  public readonly transferRepo = new PrismaTransferRepository();
  public readonly correctionRepo = new PrismaCorrectionRepository();

  // Gateways
  public readonly cryptoGateway = new NodeCryptoGateway();

  // Use Cases - Identity
  public readonly getMemberProfile = new GetMemberProfileUseCase(this.memberRepo);
  public readonly updateMemberProfile = new UpdateMemberProfileUseCase(this.memberRepo, this.auditRepo);
  public readonly requestPhoneOtp = new RequestPhoneOtpUseCase(
    this.challengeRepo,
    this.memberRepo,
    this.cryptoGateway,
    this.notificationRepo
  );
  public readonly verifyPhoneOtp = new VerifyPhoneOtpUseCase(
    this.challengeRepo,
    this.memberRepo,
    this.cryptoGateway,
    this.auditRepo
  );
  public readonly requestEmailToken = new RequestEmailTokenUseCase(
    this.challengeRepo,
    this.memberRepo,
    this.cryptoGateway,
    this.notificationRepo,
    this.auditRepo
  );
  public readonly verifyEmailToken = new VerifyEmailTokenUseCase(
    this.challengeRepo,
    this.memberRepo,
    this.cryptoGateway,
    this.auditRepo
  );

  // Use Cases - Chapters
  public readonly requestChapterTransfer = new RequestChapterTransferUseCase(
    this.transferRepo,
    this.memberRepo,
    this.chapterRepo,
    this.notificationRepo,
    this.auditRepo
  );
  public readonly reviewChapterTransfer = new ReviewChapterTransferUseCase(
    this.transferRepo,
    this.memberRepo,
    this.notificationRepo,
    this.auditRepo
  );

  // Use Cases - Events
  public readonly registerEvent = new RegisterEventUseCase(
    this.eventRepo,
    this.notificationRepo,
    this.auditRepo
  );
  public readonly checkInTicket = new CheckInTicketUseCase(
    this.eventRepo,
    this.auditRepo
  );

  // Use Cases - Geography
  public readonly lookupPinCode = new LookupPinCodeUseCase(this.geographyRepo);
  public readonly validateLocation = new ValidateLocationUseCase(this.geographyRepo);

  // Use Cases - Notifications
  public readonly listNotifications = new ListNotificationsUseCase(this.notificationRepo);
  public readonly markNotificationRead = new MarkNotificationReadUseCase(this.notificationRepo);
}

// Global singleton container
export const container = new AppContainer();
