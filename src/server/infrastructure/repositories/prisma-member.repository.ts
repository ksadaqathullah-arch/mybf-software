import { db } from '@/server/db';
import { IMemberRepository } from '../../application/ports/member.repository.port';
import { MemberProfileEntity } from '../../domain/identity/entities/member-profile.entity';
import { EntityNotFoundError } from '../../domain/common/domain-error';

export class PrismaMemberRepository implements IMemberRepository {
  public async findById(id: string): Promise<MemberProfileEntity | null> {
    const record = await db.memberProfile.findUnique({
      where: { id },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  public async findByUserId(userId: string): Promise<MemberProfileEntity | null> {
    const record = await db.memberProfile.findUnique({
      where: { userId },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  public async findByPhoneOrEmail(phone: string, email: string): Promise<MemberProfileEntity | null> {
    const record = await db.memberProfile.findFirst({
      where: {
        OR: [{ primaryPhone: phone }, { email }],
      },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  public async save(member: MemberProfileEntity): Promise<void> {
    const props = member.props;
    const organizationId = props.organizationId || (await this.resolveOrganizationId());
    await db.memberProfile.upsert({
      where: { id: member.id },
      create: {
        id: member.id,
        userId: props.userId,
        organizationId,
        chapterId: props.chapterId,
        fullName: props.fullName,
        primaryPhone: props.primaryPhone,
        alternatePhone: props.alternatePhone,
        email: props.email,
        dateOfBirth: props.dateOfBirth,
        gender: props.gender as any,
        bloodGroup: props.bloodGroup,
        memberCategory: props.memberCategory as any,
        currentPosition: props.currentPosition as any,
        occupation: props.occupation,
        companyName: props.companyName,
        businessSector: props.businessSector,
        yearsInBusiness: props.yearsInBusiness,
        isStudent: props.isStudent ?? false,
        institutionName: props.institutionName,
        courseName: props.courseName,
        futureGoal: props.futureGoal,
        district: props.district,
        taluk: props.taluk,
        addressLine: props.addressLine,
        ward: props.ward,
        pinCode: props.pinCode,
      },
      update: {
        chapterId: props.chapterId,
        fullName: props.fullName,
        primaryPhone: props.primaryPhone,
        alternatePhone: props.alternatePhone,
        email: props.email,
        dateOfBirth: props.dateOfBirth,
        gender: props.gender as any,
        bloodGroup: props.bloodGroup,
        memberCategory: props.memberCategory as any,
        currentPosition: props.currentPosition as any,
        occupation: props.occupation,
        companyName: props.companyName,
        businessSector: props.businessSector,
        yearsInBusiness: props.yearsInBusiness,
        isStudent: props.isStudent ?? false,
        institutionName: props.institutionName,
        courseName: props.courseName,
        futureGoal: props.futureGoal,
        district: props.district,
        taluk: props.taluk,
        addressLine: props.addressLine,
        ward: props.ward,
        pinCode: props.pinCode,
      },
    });
  }

  public async updatePhone(userId: string, memberProfileId: string, newPhone: string): Promise<void> {
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { phone: newPhone, phoneVerified: new Date() },
      });
      await tx.memberProfile.update({
        where: { id: memberProfileId },
        data: { primaryPhone: newPhone },
      });
    });
  }

  public async updateEmail(userId: string, memberProfileId: string, newEmail: string): Promise<void> {
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { email: newEmail, emailVerified: new Date() },
      });
      await tx.memberProfile.update({
        where: { id: memberProfileId },
        data: { email: newEmail },
      });
    });
  }

  public async getCompleteProfile(userId: string): Promise<any> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            chapter: true,
            expectations: true,
            talents: true,
            participationPreferences: true,
            correctionRequests: { orderBy: { createdAt: 'desc' } },
            transfers: {
              include: { fromChapter: true, toChapter: true },
              orderBy: { requestedAt: 'desc' },
            },
            chapterHistory: {
              include: { chapter: true },
              orderBy: { assignedAt: 'desc' },
            },
            memberships: {
              where: { status: 'ACTIVE' },
              include: {
                idCards: {
                  where: { status: 'ACTIVE' },
                  orderBy: { cardVersion: 'desc' },
                  take: 1,
                },
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!user || !user.profile) {
      throw new EntityNotFoundError('MemberProfile', userId);
    }

    return user;
  }

  private async resolveOrganizationId(): Promise<string> {
    const org = await db.organization.findFirst({ select: { id: true } });
    return org?.id || 'org-malappuram-district';
  }

  private toEntity(record: any): MemberProfileEntity {
    return new MemberProfileEntity(
      record.id,
      {
        userId: record.userId,
        organizationId: record.organizationId,
        chapterId: record.chapterId,
        fullName: record.fullName,
        primaryPhone: record.primaryPhone,
        alternatePhone: record.alternatePhone,
        email: record.email,
        dateOfBirth: record.dateOfBirth,
        gender: record.gender,
        bloodGroup: record.bloodGroup,
        memberCategory: record.memberCategory,
        currentPosition: record.currentPosition,
        occupation: record.occupation,
        companyName: record.companyName,
        businessSector: record.businessSector,
        yearsInBusiness: record.yearsInBusiness,
        isStudent: record.isStudent,
        institutionName: record.institutionName,
        courseName: record.courseName,
        futureGoal: record.futureGoal,
        district: record.district,
        taluk: record.taluk,
        addressLine: record.addressLine,
        ward: record.ward,
        pinCode: record.pinCode,
      },
      record.createdAt,
      record.updatedAt
    );
  }
}
