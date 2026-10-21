import { db } from '@/server/db';
import { IEventRepository } from '../../application/ports/event.repository.port';
import { EventEntity } from '../../domain/events/entities/event.entity';
import crypto from 'crypto';

export class PrismaEventRepository implements IEventRepository {
  public async findById(id: string): Promise<EventEntity | null> {
    const record = await db.event.findUnique({
      where: { id },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  public async findBySlug(slug: string): Promise<EventEntity | null> {
    const record = await db.event.findUnique({
      where: { slug },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  public async listPublished(chapterId?: string): Promise<EventEntity[]> {
    const where: any = { status: 'PUBLISHED' };
    if (chapterId) {
      where.OR = [{ chapterId }, { chapterId: null }];
    }
    const records = await db.event.findMany({
      where,
      orderBy: { startsAt: 'asc' },
    });
    return records.map((r) => this.toEntity(r));
  }

  public async save(event: EventEntity): Promise<void> {
    const props = event.props;
    const org = await db.organization.findFirst({ select: { id: true } });
    const organizationId = org?.id || 'org-malappuram-district';

    await db.event.upsert({
      where: { id: event.id },
      create: {
        id: event.id,
        organizationId,
        chapterId: props.chapterId ?? null,
        title: props.title,
        slug: props.slug,
        category: 'SUMMIT',
        description: props.description,
        venueName: props.location,
        capacity: props.capacity,
        registeredCount: props.registeredCount,
        startsAt: props.startDate,
        endsAt: props.endDate,
        status: props.status as any,
      },
      update: {
        title: props.title,
        description: props.description,
        venueName: props.location,
        capacity: props.capacity,
        registeredCount: props.registeredCount,
        startsAt: props.startDate,
        endsAt: props.endDate,
        status: props.status as any,
      },
    });
  }

  public async createTicket(eventId: string, userId: string): Promise<any> {
    const qrToken = `EVT-${eventId.slice(0, 8)}-${crypto.randomBytes(16).toString('hex')}`;
    return db.$transaction(async (tx) => {
      const reg = await tx.eventRegistration.create({
        data: {
          eventId,
          userId,
          qrToken,
          status: 'CONFIRMED',
        },
        include: { event: true },
      });

      await tx.event.update({
        where: { id: eventId },
        data: { registeredCount: { increment: 1 } },
      });

      return reg;
    });
  }

  public async findUserTickets(userId: string): Promise<any[]> {
    return db.eventRegistration.findMany({
      where: { userId },
      include: {
        event: {
          include: { chapter: true },
        },
        attendance: true,
      },
      orderBy: { registeredAt: 'desc' },
    });
  }

  public async checkInTicket(ticketId: string, scannedByActorId: string): Promise<any> {
    const registration = await db.eventRegistration.findUnique({
      where: { id: ticketId },
      include: { event: true, attendance: true },
    });

    if (!registration) {
      throw new Error('Ticket not found.');
    }

    if (registration.attendance) {
      return {
        alreadyCheckedIn: true,
        attendance: registration.attendance,
        registration,
      };
    }

    const attendance = await db.attendanceRecord.create({
      data: {
        eventId: registration.eventId,
        registrationId: registration.id,
        userId: registration.userId,
        scannedById: scannedByActorId,
        method: 'QR_SCAN',
        scannedAt: new Date(),
      },
    });

    return {
      alreadyCheckedIn: false,
      attendance,
      registration,
    };
  }

  private toEntity(record: any): EventEntity {
    return new EventEntity(
      record.id,
      {
        title: record.title,
        slug: record.slug,
        description: record.description,
        location: record.venueName,
        startDate: record.startsAt,
        endDate: record.endsAt,
        capacity: record.capacity,
        registeredCount: record.registeredCount,
        chapterId: record.chapterId,
        status: record.status,
      },
      record.createdAt,
      record.updatedAt
    );
  }
}
