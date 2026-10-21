import { BaseEntity } from '../../common/entity.base';
import { DomainRuleViolationError } from '../../common/domain-error';

export type ChapterTransferStatus =
  | 'REQUESTED'
  | 'CURRENT_APPROVED'
  | 'DESTINATION_APPROVED'
  | 'COMPLETED'
  | 'REJECTED';

export interface ChapterTransferProps {
  memberProfileId: string;
  fromChapterId: string;
  toChapterId: string;
  status: ChapterTransferStatus;
  reason: string;
  currentReviewNotes?: string | null;
  currentReviewedAt?: Date | null;
  currentReviewedById?: string | null;
  destinationReviewNotes?: string | null;
  destinationReviewedAt?: Date | null;
  destinationReviewedById?: string | null;
  districtReviewNotes?: string | null;
  districtReviewedAt?: Date | null;
  districtReviewedById?: string | null;
  rejectionReason?: string | null;
  requestedAt: Date;
  completedAt?: Date | null;
}

export class ChapterTransferEntity extends BaseEntity<ChapterTransferProps> {
  public static create(
    id: string,
    memberProfileId: string,
    fromChapterId: string,
    toChapterId: string,
    reason: string
  ): ChapterTransferEntity {
    if (fromChapterId === toChapterId) {
      throw new DomainRuleViolationError('Origin and destination chapters cannot be identical.');
    }
    if (!reason || reason.trim().length < 10) {
      throw new DomainRuleViolationError('Transfer justification must be at least 10 characters.');
    }

    const now = new Date();
    return new ChapterTransferEntity(
      id,
      {
        memberProfileId,
        fromChapterId,
        toChapterId,
        status: 'REQUESTED',
        reason: reason.trim(),
        requestedAt: now,
      },
      now,
      now
    );
  }

  /**
   * Stage 1: Current/Origin Chapter Recommendation
   */
  public recommendByOriginChapter(
    reviewerId: string,
    approved: boolean,
    notes: string
  ): void {
    if (this._props.status !== 'REQUESTED') {
      throw new DomainRuleViolationError(
        `Cannot record origin recommendation. Transfer is in status '${this._props.status}', expected 'REQUESTED'.`
      );
    }
    if (!notes || notes.trim().length < 5) {
      throw new DomainRuleViolationError('Review notes must be at least 5 characters.');
    }

    const now = new Date();
    this._props.currentReviewedById = reviewerId;
    this._props.currentReviewedAt = now;
    this._props.currentReviewNotes = notes.trim();
    this._updatedAt = now;

    if (approved) {
      this._props.status = 'CURRENT_APPROVED';
    } else {
      this._props.status = 'REJECTED';
      this._props.rejectionReason = `Rejected by origin chapter: ${notes.trim()}`;
    }
  }

  /**
   * Stage 2: Destination Chapter Recommendation
   */
  public recommendByDestinationChapter(
    reviewerId: string,
    approved: boolean,
    notes: string
  ): void {
    if (this._props.status !== 'CURRENT_APPROVED') {
      throw new DomainRuleViolationError(
        `Cannot record destination recommendation. Transfer is in status '${this._props.status}', expected 'CURRENT_APPROVED'.`
      );
    }
    if (!notes || notes.trim().length < 5) {
      throw new DomainRuleViolationError('Review notes must be at least 5 characters.');
    }

    const now = new Date();
    this._props.destinationReviewedById = reviewerId;
    this._props.destinationReviewedAt = now;
    this._props.destinationReviewNotes = notes.trim();
    this._updatedAt = now;

    if (approved) {
      this._props.status = 'DESTINATION_APPROVED';
    } else {
      this._props.status = 'REJECTED';
      this._props.rejectionReason = `Rejected by destination chapter: ${notes.trim()}`;
    }
  }

  /**
   * Stage 3: District Admin Statutory Final Decision
   */
  public finalizeByDistrictAdmin(
    adminId: string,
    approved: boolean,
    remarks: string
  ): void {
    if (this._props.status !== 'DESTINATION_APPROVED' && this._props.status !== 'CURRENT_APPROVED') {
      throw new DomainRuleViolationError(
        `Cannot finalize transfer from status '${this._props.status}'. Both chapters must submit recommendations first.`
      );
    }
    if (!remarks || remarks.trim().length < 5) {
      throw new DomainRuleViolationError('District decision remarks must be at least 5 characters.');
    }

    const now = new Date();
    this._props.districtReviewedById = adminId;
    this._props.districtReviewedAt = now;
    this._props.districtReviewNotes = remarks.trim();
    this._updatedAt = now;

    if (approved) {
      this._props.status = 'COMPLETED';
      this._props.completedAt = now;
    } else {
      this._props.status = 'REJECTED';
      this._props.rejectionReason = `Rejected by District Administration: ${remarks.trim()}`;
    }
  }

  /**
   * Root Tenant Super Admin Emergency Override
   */
  public superAdminOverride(
    adminId: string,
    action: 'FORCE_APPROVE' | 'FORCE_REJECT' | 'RESET_TO_PENDING',
    justification: string
  ): void {
    if (!justification || justification.trim().length < 15) {
      throw new DomainRuleViolationError(
        'Super admin overrides require executive justification of at least 15 characters.'
      );
    }

    const now = new Date();
    this._updatedAt = now;
    const note = `[SUPER_ADMIN OVERRIDE by ${adminId}]: ${justification.trim()}`;

    if (action === 'FORCE_APPROVE') {
      this._props.status = 'COMPLETED';
      this._props.completedAt = now;
      this._props.districtReviewNotes = note;
    } else if (action === 'FORCE_REJECT') {
      this._props.status = 'REJECTED';
      this._props.rejectionReason = note;
    } else if (action === 'RESET_TO_PENDING') {
      this._props.status = 'REQUESTED';
      this._props.currentReviewNotes = null;
      this._props.destinationReviewNotes = null;
      this._props.districtReviewNotes = note;
      this._props.rejectionReason = null;
      this._props.completedAt = null;
    }
  }

  public get status(): ChapterTransferStatus {
    return this._props.status;
  }

  public get memberProfileId(): string {
    return this._props.memberProfileId;
  }

  public get fromChapterId(): string {
    return this._props.fromChapterId;
  }

  public get toChapterId(): string {
    return this._props.toChapterId;
  }
}
