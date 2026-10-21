import { IUseCase } from '../../common/use-case.interface';
import { IMemberRepository } from '../../ports/member.repository.port';
import { IAuditRepository } from '../../ports/audit.repository.port';
import { AuthActor } from '@/server/auth/types';
import { assertAuthorized } from '@/server/auth/policy';
import {
  UnauthorizedError,
  EntityNotFoundError,
} from '@/server/domain/common/domain-error';

export interface UpdateMemberProfileInput {
  segment: 'personal' | 'professional' | 'location';
  data: Record<string, any>;
}

export class UpdateMemberProfileUseCase implements IUseCase<UpdateMemberProfileInput, { success: boolean; message: string }> {
  constructor(
    private readonly memberRepo: IMemberRepository,
    private readonly auditRepo: IAuditRepository
  ) {}

  public async execute(
    input: UpdateMemberProfileInput,
    actor?: AuthActor
  ): Promise<{ success: boolean; message: string }> {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new UnauthorizedError();
    }

    assertAuthorized({
      actor,
      action: 'member.update_own',
      resource: 'membership',
      recordOwnerId: actor.userId,
    });

    const member = await this.memberRepo.findByUserId(actor.userId);
    if (!member) {
      throw new EntityNotFoundError('MemberProfile', actor.userId);
    }

    if (input.segment === 'personal') {
      member.updatePersonal({
        gender: input.data.gender,
        alternatePhone: input.data.alternatePhone,
        bloodGroup: input.data.bloodGroup,
      });
    } else if (input.segment === 'professional') {
      member.updateProfessional({
        memberCategory: input.data.memberCategory,
        currentPosition: input.data.currentPosition,
        occupation: input.data.occupation,
        companyName: input.data.companyName,
        businessSector: input.data.businessSector,
        yearsInBusiness: input.data.yearsInBusiness,
        isStudent: input.data.isStudent,
        institutionName: input.data.institutionName,
        courseName: input.data.courseName,
        futureGoal: input.data.futureGoal,
      });
    } else if (input.segment === 'location') {
      // Invariant: location updates NEVER alter chapter assignment
      member.updateLocation({
        taluk: input.data.taluk,
        pinCode: input.data.pinCode,
        addressLine: input.data.addressLine,
        ward: input.data.ward,
      });
    }

    await this.memberRepo.save(member);

    await this.auditRepo.log({
      action: `MEMBER_PROFILE_${input.segment.toUpperCase()}_UPDATED`,
      entityType: 'MemberProfile',
      entityId: member.id,
      actorId: actor.userId,
      payload: input.data,
    });

    return {
      success: true,
      message: `${input.segment.charAt(0).toUpperCase() + input.segment.slice(1)} details updated successfully.`,
    };
  }
}
