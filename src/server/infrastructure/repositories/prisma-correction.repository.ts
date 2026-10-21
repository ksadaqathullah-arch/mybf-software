import { db } from '@/server/db';
import {
  ICorrectionRepository,
  CorrectionListFilter,
} from '../../application/ports/correction.repository.port';
import {
  ProfileCorrectionEntity,
  ProfileCorrectionStatus,
} from '../../domain/identity/entities/profile-correction.entity';

export class PrismaCorrectionRepository implements ICorrectionRepository {
  public async findById(id: string): Promise<ProfileCorrectionEntity | null> {
    const record = await db.profileCorrectionRequest.findUnique({
      where: { id },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  public async save(correction: ProfileCorrectionEntity): Promise<void> {
    const props = correction.props;
    await db.profileCorrectionRequest.upsert({
      where: { id: correction.id },
      create: {
        id: correction.id,
        memberProfileId: props.memberProfileId,
        field: props.field,
        oldValue: props.oldValue,
        requestedValue: props.requestedValue,
        reason: props.reason,
        documentUrl: props.documentUrl,
        status: props.status as any,
        reviewedById: props.reviewedById,
        reviewedAt: props.reviewedAt,
        reviewNotes: props.reviewNotes,
      },
      update: {
        status: props.status as any,
        reviewedById: props.reviewedById,
        reviewedAt: props.reviewedAt,
        reviewNotes: props.reviewNotes,
      },
    });
  }

  public async list(filter: CorrectionListFilter): Promise<{ requests: any[]; total: number }> {
    const where: any = {};
    if (filter.status && filter.status !== 'ALL') {
      where.status = filter.status;
    }

    const page = filter.page || 1;
    const pageSize = filter.pageSize || 50;

    const [requests, total] = await Promise.all([
      db.profileCorrectionRequest.findMany({
        where,
        include: {
          memberProfile: {
            include: {
              chapter: true,
              memberships: { where: { status: 'ACTIVE' }, take: 1 },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.profileCorrectionRequest.count({ where }),
    ]);

    return { requests, total };
  }

  public async applyCorrection(
    requestId: string,
    memberProfileId: string,
    field: string,
    value: string
  ): Promise<void> {
    await db.$transaction(async (tx) => {
      const updateData: Record<string, any> = {};
      if (field === 'fullName') {
        updateData.fullName = value;
      } else if (field === 'dateOfBirth') {
        updateData.dateOfBirth = new Date(value);
      } else if (field === 'gender') {
        updateData.gender = value;
      }

      await tx.memberProfile.update({
        where: { id: memberProfileId },
        data: updateData,
      });

      await tx.profileCorrectionRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      });
    });
  }

  private toEntity(record: any): ProfileCorrectionEntity {
    return new ProfileCorrectionEntity(
      record.id,
      {
        memberProfileId: record.memberProfileId,
        field: record.field,
        oldValue: record.oldValue,
        requestedValue: record.requestedValue,
        reason: record.reason,
        documentUrl: record.documentUrl,
        status: record.status as ProfileCorrectionStatus,
        reviewedById: record.reviewedById,
        reviewedAt: record.reviewedAt,
        reviewNotes: record.reviewNotes,
      },
      record.createdAt,
      record.updatedAt
    );
  }
}
