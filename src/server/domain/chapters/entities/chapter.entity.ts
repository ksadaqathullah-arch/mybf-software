import { BaseEntity } from '../../common/entity.base';
import { DomainRuleViolationError } from '../../common/domain-error';

export interface ChapterProps {
  organizationId: string;
  name: string;
  code: string;
  slug: string;
  constituency?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

export class ChapterEntity extends BaseEntity<ChapterProps> {
  public static create(id: string, props: ChapterProps): ChapterEntity {
    if (!props.name || props.name.trim().length < 2) {
      throw new DomainRuleViolationError('Chapter name must be at least 2 characters.');
    }
    if (!props.code || props.code.trim().length < 2) {
      throw new DomainRuleViolationError('Chapter code must be at least 2 characters.');
    }

    const now = new Date();
    return new ChapterEntity(
      id,
      {
        ...props,
        name: props.name.trim(),
        code: props.code.trim().toUpperCase(),
        slug: props.slug.trim().toLowerCase(),
      },
      now,
      now
    );
  }

  public get name(): string {
    return this._props.name;
  }

  public get code(): string {
    return this._props.code;
  }

  public get slug(): string {
    return this._props.slug;
  }

  public get status(): 'ACTIVE' | 'INACTIVE' {
    return this._props.status;
  }
}
