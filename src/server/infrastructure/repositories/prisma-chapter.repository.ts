import { db } from '@/server/db';
import { IChapterRepository } from '../../application/ports/chapter.repository.port';
import { ChapterEntity } from '../../domain/chapters/entities/chapter.entity';

export class PrismaChapterRepository implements IChapterRepository {
  public async findById(id: string): Promise<ChapterEntity | null> {
    const record = await db.chapter.findUnique({
      where: { id },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  public async findBySlug(slug: string): Promise<ChapterEntity | null> {
    const record = await db.chapter.findUnique({
      where: { slug: slug.toLowerCase() },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  public async findByCode(code: string): Promise<ChapterEntity | null> {
    const record = await db.chapter.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  public async resolve(identifier: string): Promise<ChapterEntity | null> {
    const trimmed = identifier.trim();
    const record = await db.chapter.findFirst({
      where: {
        OR: [
          { id: trimmed },
          { slug: trimmed.toLowerCase() },
          { code: trimmed.toUpperCase() },
        ],
      },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  public async listAll(): Promise<ChapterEntity[]> {
    const records = await db.chapter.findMany({
      orderBy: { name: 'asc' },
    });
    return records.map((r) => this.toEntity(r));
  }

  private toEntity(record: any): ChapterEntity {
    return new ChapterEntity(
      record.id,
      {
        organizationId: record.organizationId,
        name: record.name,
        code: record.code,
        slug: record.slug,
        constituency: record.constituency,
        status: record.status,
      },
      record.createdAt,
      record.updatedAt
    );
  }
}
