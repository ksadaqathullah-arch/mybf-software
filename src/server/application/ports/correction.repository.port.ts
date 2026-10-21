import { ProfileCorrectionEntity } from '../../domain/identity/entities/profile-correction.entity';

export interface CorrectionListFilter {
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface ICorrectionRepository {
  findById(id: string): Promise<ProfileCorrectionEntity | null>;
  save(correction: ProfileCorrectionEntity): Promise<void>;
  list(filter: CorrectionListFilter): Promise<{ requests: any[]; total: number }>;
  applyCorrection(
    requestId: string,
    memberProfileId: string,
    field: string,
    value: string
  ): Promise<void>;
}
