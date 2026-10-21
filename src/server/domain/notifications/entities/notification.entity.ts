import { BaseEntity } from '../../common/entity.base';
import { DomainRuleViolationError } from '../../common/domain-error';

export interface NotificationProps {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any> | null;
  readAt?: Date | null;
}

export class NotificationEntity extends BaseEntity<NotificationProps> {
  public static create(id: string, props: NotificationProps): NotificationEntity {
    if (!props.title || props.title.trim().length < 2) {
      throw new DomainRuleViolationError('Notification title must be at least 2 characters.');
    }
    if (!props.message || props.message.trim().length < 2) {
      throw new DomainRuleViolationError('Notification message must be at least 2 characters.');
    }

    const now = new Date();
    return new NotificationEntity(
      id,
      {
        ...props,
        title: props.title.trim(),
        message: props.message.trim(),
      },
      now,
      now
    );
  }

  public markAsRead(): void {
    if (!this._props.readAt) {
      this._props.readAt = new Date();
      this._updatedAt = new Date();
    }
  }

  public get isRead(): boolean {
    return !!this._props.readAt;
  }
}
