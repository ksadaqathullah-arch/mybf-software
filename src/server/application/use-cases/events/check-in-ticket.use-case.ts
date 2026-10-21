import { IUseCase } from '../../common/use-case.interface';
import { IEventRepository } from '../../ports/event.repository.port';
import { IAuditRepository } from '../../ports/audit.repository.port';
import { AuthActor } from '@/server/auth/types';
import {
  UnauthorizedError,
  DomainRuleViolationError,
} from '@/server/domain/common/domain-error';

export interface CheckInTicketInput {
  ticketId: string;
}

export class CheckInTicketUseCase implements IUseCase<CheckInTicketInput, { success: boolean; alreadyCheckedIn: boolean; message: string; record: any }> {
  constructor(
    private readonly eventRepo: IEventRepository,
    private readonly auditRepo: IAuditRepository
  ) {}

  public async execute(
    input: CheckInTicketInput,
    actor?: AuthActor
  ): Promise<{ success: boolean; alreadyCheckedIn: boolean; message: string; record: any }> {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new UnauthorizedError('Active officer authentication required to scan check-ins.');
    }

    const isOfficerOrAdmin = actor.roles.some((r) =>
      ['SUPER_ADMIN', 'DISTRICT_ADMIN', 'CHAPTER_PRESIDENT', 'CHAPTER_SECRETARY', 'CHAPTER_OFFICER', 'COORDINATOR'].includes(r)
    );

    if (!isOfficerOrAdmin) {
      throw new DomainRuleViolationError('Forbidden: Only event officers or administrators can process event admissions.');
    }

    const result = await this.eventRepo.checkInTicket(input.ticketId, actor.userId);

    await this.auditRepo.log({
      action: result.alreadyCheckedIn ? 'EVENT_CHECKIN_DUPLICATE_SCANNED' : 'EVENT_CHECKIN_RECORDED',
      entityType: 'AttendanceRecord',
      entityId: result.attendance.id,
      actorId: actor.userId,
      payload: {
        ticketId: input.ticketId,
        alreadyCheckedIn: result.alreadyCheckedIn,
      },
    });

    return {
      success: true,
      alreadyCheckedIn: result.alreadyCheckedIn,
      message: result.alreadyCheckedIn
        ? 'Duplicate admission scan: Attendee was already checked in earlier.'
        : 'Attendee successfully checked in.',
      record: result,
    };
  }
}
