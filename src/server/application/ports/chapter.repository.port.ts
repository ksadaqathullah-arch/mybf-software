import { ChapterEntity } from '../../domain/chapters/entities/chapter.entity';

export interface IChapterRepository {
  findById(id: string): Promise<ChapterEntity | null>;
  findBySlug(slug: string): Promise<ChapterEntity | null>;
  findByCode(code: string): Promise<ChapterEntity | null>;
  resolve(identifier: string): Promise<ChapterEntity | null>;
  listAll(): Promise<ChapterEntity[]>;
}
