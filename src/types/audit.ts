export interface AuditLogDto {
  audit_id: number;
  entity_name: string;
  entity_id: number;
  action: string;
  user_id: number;
  timestamp: string; // ISO or naive string returned by backend
  change_summary?: string | null;
}

export interface ListAuditLogsQuery {
  entity_name?: string;
  entity_id?: number;
  user_id?: number;
  q?: string;
  limit?: number;
  offset?: number;
}
