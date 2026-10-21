import { BaseEntity } from '../../common/entity.base';
import { DomainRuleViolationError } from '../../common/domain-error';
import { AgeEligibility } from '../value-objects/age-eligibility.vo';

export type ProfileCorrectionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLARIFICATION_REQUESTED';

export interface ProfileCorrectionProps {
  memberProfileId: string;
  field: string;
  oldValue: string | null;
  requestedValue: string;
  reason: string;
  documentUrl?: string | null;
  status: ProfileCorrectionStatus;
  reviewedById?: string | null;
  reviewedAt?: Date | null;
  reviewNotes?: string | null;
}

export class ProfileCorrectionEntity extends BaseEntity<ProfileCorrectionProps> {
  private static readonly ALLOWED_FIELDS = ['fullName', 'dateOfBirth', 'gender', 'other'];

  public static create(
    id: string,
    memberProfileId: string,
    field: string,
    oldValue: string | null,
    requestedValue: string,
    reason: string,
    documentUrl?: string | null
  ): ProfileCorrectionEntity {
    if (!this.ALLOWED_FIELDS.includes(field)) {
      throw new DomainRuleViolationError(
        `Invalid correction field '${field}'. Allowed fields: ${this.ALLOWED_FIELDS.join(', ')}`
      );
    }
    if (!requestedValue || requestedValue.trim().length < 2) {
      throw new DomainRuleViolationError('Requested value must be at least 2 characters.');
    }
    if (!reason || reason.trim().length < 10) {
      throw new DomainRuleViolationError('Justification reason must be at least 10 characters.');
    }

    // If correcting Date of Birth, strictly enforce 18-40 age eligibility
    if (field === 'dateOfBirth') {
      const eligibility = AgeEligibility.calculate(requestedValue.trim());
      if (eligibility.isUnderAge) {
        throw new DomainRuleViolationError(
          'Date of Birth correction rejected: Applicant must be at least 18 years of age.'
        );
      }
      if (eligibility.requiresException) {
        throw new DomainRuleViolationError(
          'Date of Birth correction rejected: Member age exceeds the 40-year youth forum eligibility window.'
        );
      }
    }

    const now = new Date();
    return new ProfileCorrectionEntity(
      id,
      {
        memberProfileId,
        field,
        oldValue,
        requestedValue: requestedValue.trim(),
        reason: reason.trim(),
        documentUrl: documentUrl?.trim() || null,
        status: 'PENDING',
      },
      now,
      now
    );
  }

  public review(
    reviewerId: string,
    decision: 'APPROVE' | 'REJECT' | 'REQUEST_CLARIFICATION',
    reviewNotes: string
  ): void {
    if (this._props.status !== 'PENDING' && this._props.status !== 'CLARIFICATION_REQUESTED') {
      throw new DomainRuleViolationError(
        `Cannot review request in status '${this._props.status}'. Expected PENDING or CLARIFICATION_REQUESTED.`
      );
    }
    if (!reviewNotes || reviewNotes.trim().length < 5) {
      throw new DomainRuleViolationError('Review notes must be at least 5 characters.');
    }

    const now = new Date();
    this._props.reviewedById = reviewerId;
    this._props.reviewedAt = now;
    this._props.reviewNotes = reviewNotes.trim();
    this._updatedAt = now;

    if (decision === 'APPROVE') {
      this._props.status = 'APPROVED';
    } else if (decision === 'REJECT') {
      this._props.status = 'REJECTED';
    } else {
      this._props.status = 'CLARIFICATION_REQUESTED';
    }
  }

  public get status(): ProfileCorrectionStatus {
    return this._props.status;
  }

  public get field(): string {
    return this._props.field;
  }

  public get requestedValue(): string {
    return this._props.requestedValue;
  }

  public get memberProfileId(): string {
    return this._props.memberProfileId;
  }
}
