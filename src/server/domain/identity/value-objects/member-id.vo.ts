import { ValueObject } from '../../common/entity.base';
import { DomainRuleViolationError } from '../../common/domain-error';

export class MemberId extends ValueObject<{ value: string }> {
  private static readonly PATTERN = /^MYBF-\d{10}$/;

  private constructor(value: string) {
    super({ value });
  }

  public static create(value: string): MemberId {
    const trimmed = value.trim().toUpperCase();
    if (!this.PATTERN.test(trimmed)) {
      throw new DomainRuleViolationError(
        `Invalid Member ID format: '${value}'. Must conform to permanent canonical format 'MYBF-0000000001'.`
      );
    }
    return new MemberId(trimmed);
  }

  public static fromNumber(seq: number): MemberId {
    if (!Number.isInteger(seq) || seq <= 0) {
      throw new DomainRuleViolationError(`Member sequence number must be a positive integer, received: ${seq}`);
    }
    const padded = String(seq).padStart(10, '0');
    return new MemberId(`MYBF-${padded}`);
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
