import { db } from '@/server/db';
import { IAuditRepository, AuditLogEntry } from '../../application/ports/audit.repository.port';

export class PrismaAuditRepository implements IAuditRepository {
  public async log(entry: AuditLogEntry): Promise<void> {
    try {
      await db.auditEvent.create({
        data: {
          action: entry.action,
          resource: entry.entityType,
          resourceId: entry.entityId,
          actorId: entry.actorId ?? null,
          diffJson: entry.payload ? entry.payload : undefined,
        },
      });
    } catch (err) {
      // In Clean Architecture, audit logging failure should be logged without crashing critical transactions
      console.error('[PrismaAuditRepository] Failed to write audit log:', err);
    }
  }

  public async list(options?: {
    entityType?: string;
    actorId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ logs: any[]; total: number }> {
    const where: any = {};
    if (options?.entityType) where.resource = options.entityType;
    if (options?.actorId) where.actorId = options.actorId;

    const page = options?.page || 1;
    const pageSize = options?.pageSize || 50;

    const [logs, total] = await Promise.all([
      db.auditEvent.findMany({
        where,
        include: { actor: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.auditEvent.count({ where }),
    ]);

    return { logs, total };
  }
}
