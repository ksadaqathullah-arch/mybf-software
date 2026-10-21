import { ValueObject } from '../../common/entity.base';
import { DomainRuleViolationError } from '../../common/domain-error';

export interface AgeCalculationResult {
  age: number;
  isEligibleYouth: boolean; // 18 to 40 inclusive
  requiresException: boolean; // > 40
  isUnderAge: boolean; // < 18
}

export class AgeEligibility extends ValueObject<AgeCalculationResult> {
  public static readonly MIN_AGE = 18;
  public static readonly MAX_AGE = 40;

  private constructor(props: AgeCalculationResult) {
    super(props);
  }

  public static calculate(dateOfBirth: Date | string, referenceDate: Date = new Date()): AgeEligibility {
    const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    if (isNaN(dob.getTime())) {
      throw new DomainRuleViolationError('Invalid date of birth provided.');
    }

    if (dob > referenceDate) {
      throw new DomainRuleViolationError('Date of birth cannot be in the future.');
    }

    let age = referenceDate.getFullYear() - dob.getFullYear();
    const monthDiff = referenceDate.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < dob.getDate())) {
      age--;
    }

    const isUnderAge = age < this.MIN_AGE;
    const isEligibleYouth = age >= this.MIN_AGE && age <= this.MAX_AGE;
    const requiresException = age > this.MAX_AGE;

    return new AgeEligibility({
      age,
      isEligibleYouth,
      requiresException,
      isUnderAge,
    });
  }

  public get age(): number {
    return this.props.age;
  }

  public get isEligibleYouth(): boolean {
    return this.props.isEligibleYouth;
  }

  public get requiresException(): boolean {
    return this.props.requiresException;
  }

  public get isUnderAge(): boolean {
    return this.props.isUnderAge;
  }
}
