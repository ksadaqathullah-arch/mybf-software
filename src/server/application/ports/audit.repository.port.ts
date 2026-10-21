export interface AuditLogEntry {
  action: string;
  entityType: string;
  entityId: string;
  actorId?: string | null;
  payload?: any;
}

export interface IAuditRepository {
  log(entry: AuditLogEntry): Promise<void>;
  list(options?: {
    entityType?: string;
    actorId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ logs: any[]; total: number }>;
}
