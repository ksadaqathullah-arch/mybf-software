import { BaseEntity } from '../../common/entity.base';
import { DomainRuleViolationError } from '../../common/domain-error';

export interface EventProps {
  title: string;
  slug: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  registeredCount: number;
  chapterId?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
}

export class EventEntity extends BaseEntity<EventProps> {
  public static create(id: string, props: EventProps): EventEntity {
    if (!props.title || props.title.trim().length < 3) {
      throw new DomainRuleViolationError('Event title must be at least 3 characters.');
    }
    if (props.capacity < 1) {
      throw new DomainRuleViolationError('Event capacity must be at least 1.');
    }
    if (props.endDate < props.startDate) {
      throw new DomainRuleViolationError('Event end date cannot precede start date.');
    }

    const now = new Date();
    return new EventEntity(
      id,
      {
        ...props,
        title: props.title.trim(),
        registeredCount: props.registeredCount ?? 0,
      },
      now,
      now
    );
  }

  public registerTicket(): void {
    if (this._props.status !== 'PUBLISHED') {
      throw new DomainRuleViolationError('Tickets can only be registered for PUBLISHED events.');
    }
    if (this._props.registeredCount >= this._props.capacity) {
      throw new DomainRuleViolationError('Event capacity has been reached. No tickets remaining.');
    }
    this._props.registeredCount += 1;
    this._updatedAt = new Date();
  }

  public get isFull(): boolean {
    return this._props.registeredCount >= this._props.capacity;
  }

  public get availableSeats(): number {
    return Math.max(0, this._props.capacity - this._props.registeredCount);
  }
}
