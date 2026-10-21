import { ChapterTransferEntity } from '../../domain/identity/entities/chapter-transfer.entity';

export interface TransferListFilter {
  chapterId?: string;
  direction?: 'ALL' | 'OUTGOING' | 'INCOMING';
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface ITransferRepository {
  findById(id: string): Promise<ChapterTransferEntity | null>;
  findActiveByProfileId(profileId: string): Promise<ChapterTransferEntity | null>;
  save(transfer: ChapterTransferEntity): Promise<void>;
  list(filter: TransferListFilter): Promise<{ transfers: any[]; total: number }>;
  executeAtomicTransfer(
    transferId: string,
    memberProfileId: string,
    newChapterId: string,
    notes: string,
    adminId: string
  ): Promise<void>;
}
