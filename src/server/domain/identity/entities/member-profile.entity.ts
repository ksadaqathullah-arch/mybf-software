import { BaseEntity } from '../../common/entity.base';
import { DomainRuleViolationError } from '../../common/domain-error';
import { IndianPhoneNumber } from '../value-objects/indian-phone.vo';
import { PinCode } from '../value-objects/pin-code.vo';

export interface MemberProfileProps {
  userId: string;
  organizationId?: string;
  chapterId: string;
  fullName: string;
  primaryPhone: string;
  alternatePhone?: string | null;
  email: string;
  dateOfBirth?: Date | null;
  gender?: string | null;
  bloodGroup?: string | null;
  memberCategory?: string | null;
  currentPosition?: string | null;
  occupation?: string | null;
  companyName?: string | null;
  businessSector?: string | null;
  yearsInBusiness?: number | null;
  isStudent?: boolean;
  institutionName?: string | null;
  courseName?: string | null;
  futureGoal?: string | null;
  district: string;
  taluk?: string | null;
  addressLine?: string | null;
  ward?: string | null;
  pinCode?: string | null;
}

export class MemberProfileEntity extends BaseEntity<MemberProfileProps> {
  public static create(id: string, props: MemberProfileProps): MemberProfileEntity {
    if (!props.fullName || props.fullName.trim().length < 2) {
      throw new DomainRuleViolationError('Full Name must be at least 2 characters.');
    }
    const phoneVo = IndianPhoneNumber.create(props.primaryPhone);

    const now = new Date();
    return new MemberProfileEntity(
      id,
      {
        ...props,
        organizationId: props.organizationId || 'org-malappuram-district',
        fullName: props.fullName.trim(),
        primaryPhone: phoneVo.e164,
        email: props.email.trim().toLowerCase(),
        district: props.district || 'Malappuram',
      },
      now,
      now
    );
  }

  /**
   * Update non-sensitive personal details
   */
  public updatePersonal(details: {
    gender?: string | null;
    alternatePhone?: string | null;
    bloodGroup?: string | null;
  }): void {
    if (details.alternatePhone) {
      const altVo = IndianPhoneNumber.create(details.alternatePhone);
      this._props.alternatePhone = altVo.e164;
    } else if (details.alternatePhone === null || details.alternatePhone === '') {
      this._props.alternatePhone = null;
    }

    if (details.gender !== undefined) this._props.gender = details.gender;
    if (details.bloodGroup !== undefined) this._props.bloodGroup = details.bloodGroup;
    this._updatedAt = new Date();
  }

  /**
   * Update professional & student classification
   */
  public updateProfessional(details: {
    memberCategory?: string | null;
    currentPosition?: string | null;
    occupation?: string | null;
    companyName?: string | null;
    businessSector?: string | null;
    yearsInBusiness?: number | null;
    isStudent?: boolean;
    institutionName?: string | null;
    courseName?: string | null;
    futureGoal?: string | null;
  }): void {
    Object.assign(this._props, details);
    this._updatedAt = new Date();
  }

  /**
   * Update residential location (PIN-first).
   * CRITICAL INVARIANT: Updating residential address NEVER updates chapterId!
   */
  public updateLocation(details: {
    taluk: string;
    pinCode: string;
    addressLine?: string | null;
    ward?: string | null;
  }): void {
    const pinVo = PinCode.create(details.pinCode);
    this._props.taluk = details.taluk;
    this._props.pinCode = pinVo.value;
    if (details.addressLine !== undefined) this._props.addressLine = details.addressLine;
    if (details.ward !== undefined) this._props.ward = details.ward;
    this._updatedAt = new Date();
  }

  /**
   * Assign to new constituency chapter (strictly governed by chapter transfer workflow)
   */
  public assignChapter(newChapterId: string): void {
    if (!newChapterId) {
      throw new DomainRuleViolationError('New chapter ID must be provided for chapter assignment.');
    }
    this._props.chapterId = newChapterId;
    this._updatedAt = new Date();
  }

  public updateVerifiedPhone(newPhone: string): void {
    const phoneVo = IndianPhoneNumber.create(newPhone);
    this._props.primaryPhone = phoneVo.e164;
    this._updatedAt = new Date();
  }

  public updateVerifiedEmail(newEmail: string): void {
    this._props.email = newEmail.trim().toLowerCase();
    this._updatedAt = new Date();
  }

  public get chapterId(): string {
    return this._props.chapterId;
  }

  public get fullName(): string {
    return this._props.fullName;
  }

  public get email(): string {
    return this._props.email;
  }

  public get primaryPhone(): string {
    return this._props.primaryPhone;
  }
}
