import { EventEntity } from '../../domain/events/entities/event.entity';

export interface IEventRepository {
  findById(id: string): Promise<EventEntity | null>;
  findBySlug(slug: string): Promise<EventEntity | null>;
  listPublished(chapterId?: string): Promise<EventEntity[]>;
  save(event: EventEntity): Promise<void>;
  createTicket(eventId: string, userId: string): Promise<any>;
  findUserTickets(userId: string): Promise<any[]>;
  checkInTicket(ticketId: string, scannedByActorId: string): Promise<any>;
}
