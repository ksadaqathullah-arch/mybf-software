import { ValueObject } from '../../common/entity.base';
import { DomainRuleViolationError } from '../../common/domain-error';

export class PinCode extends ValueObject<{ value: string }> {
  private static readonly REGEX = /^[1-9][0-9]{5}$/;

  private constructor(value: string) {
    super({ value });
  }

  public static create(input: string): PinCode {
    if (!input || typeof input !== 'string') {
      throw new DomainRuleViolationError('Postal PIN code is required.');
    }

    const trimmed = input.trim();
    if (!this.REGEX.test(trimmed)) {
      throw new DomainRuleViolationError(
        `Invalid PIN code '${input}'. Must be a 6-digit Indian postal code starting with 1-9.`
      );
    }

    return new PinCode(trimmed);
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
