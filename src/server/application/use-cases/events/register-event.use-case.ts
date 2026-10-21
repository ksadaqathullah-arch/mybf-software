import { IUseCase } from '../../common/use-case.interface';
import { IEventRepository } from '../../ports/event.repository.port';
import { INotificationRepository } from '../../ports/notification.repository.port';
import { IAuditRepository } from '../../ports/audit.repository.port';
import { NotificationEntity } from '@/server/domain/notifications/entities/notification.entity';
import { AuthActor } from '@/server/auth/types';
import {
  UnauthorizedError,
  EntityNotFoundError,
} from '@/server/domain/common/domain-error';
import crypto from 'crypto';

export interface RegisterEventInput {
  eventId: string;
}

export class RegisterEventUseCase implements IUseCase<RegisterEventInput, { success: boolean; ticket: any; message: string }> {
  constructor(
    private readonly eventRepo: IEventRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly auditRepo: IAuditRepository
  ) {}

  public async execute(
    input: RegisterEventInput,
    actor?: AuthActor
  ): Promise<{ success: boolean; ticket: any; message: string }> {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new UnauthorizedError('Active membership session required to register for events.');
    }

    const event = await this.eventRepo.findById(input.eventId);
    if (!event) {
      throw new EntityNotFoundError('Event', input.eventId);
    }

    // Domain business rule validation (checks status, capacity)
    event.registerTicket();

    // Persist ticket and increment count
    const ticket = await this.eventRepo.createTicket(event.id, actor.userId);

    const notification = NotificationEntity.create(crypto.randomUUID(), {
      userId: actor.userId,
      type: 'EVENT_REGISTRATION_CONFIRMED',
      title: 'Summit Admission Confirmed',
      message: `You are registered for "${event.props.title}". Your digital ticket is ready.`,
      metadata: { eventId: event.id, qrToken: ticket.qrToken },
    });
    await this.notificationRepo.create(notification);

    await this.auditRepo.log({
      action: 'EVENT_TICKET_REGISTERED',
      entityType: 'EventRegistration',
      entityId: ticket.id,
      actorId: actor.userId,
      payload: { eventId: event.id, title: event.props.title },
    });

    return {
      success: true,
      ticket,
      message: `Registration confirmed for ${event.props.title}.`,
    };
  }
}
