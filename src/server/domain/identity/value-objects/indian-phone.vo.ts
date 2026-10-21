import { ValueObject } from '../../common/entity.base';
import { DomainRuleViolationError } from '../../common/domain-error';

export class IndianPhoneNumber extends ValueObject<{ raw: string; normalized: string }> {
  private static readonly REGEX = /^[6-9]\d{9}$/;

  private constructor(raw: string, normalized: string) {
    super({ raw, normalized });
  }

  public static create(input: string): IndianPhoneNumber {
    if (!input || typeof input !== 'string') {
      throw new DomainRuleViolationError('Mobile number is required.');
    }

    // Strip whitespace, hyphens, and standard prefixes (+91, 91, 0)
    let cleaned = input.trim().replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+91')) {
      cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith('91') && cleaned.length === 12) {
      cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith('0') && cleaned.length === 11) {
      cleaned = cleaned.substring(1);
    }

    if (!this.REGEX.test(cleaned)) {
      throw new DomainRuleViolationError(
        `Invalid Indian mobile number: '${input}'. Must be a valid 10-digit number starting with 6, 7, 8, or 9.`
      );
    }

    return new IndianPhoneNumber(input, cleaned);
  }

  public get normalized(): string {
    return this.props.normalized;
  }

  public get e164(): string {
    return `+91${this.props.normalized}`;
  }

  public toString(): string {
    return this.props.normalized;
  }
}
