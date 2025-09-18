import { httpClient } from './tauriClient';
import type { AuditLogDto, ListAuditLogsQuery } from '../types/audit';

export const listAuditLogs = async (query: ListAuditLogsQuery = {}) => {
  const params: any = {};
  if ((query as any).page) params.page = (query as any).page;
  if ((query as any).limit) params.limit = (query as any).limit;
  if (query.q) params.search = query.q;
  if ((query as any).entity_name)
    params.entityName = (query as any).entity_name;
  if ((query as any).entity_id) params.entityId = (query as any).entity_id;
  if ((query as any).user_id) params.userId = (query as any).user_id;
  if ((query as any).startDate) params.startDate = (query as any).startDate;
  if ((query as any).endDate) params.endDate = (query as any).endDate;
  // Backend defaults sort; no client sort for now
  return httpClient.get<{ data: AuditLogDto[]; meta: any }>(
    '/audit-logs',
    params,
  );
};

export const getAuditLog = (id: number) =>
  httpClient.get<AuditLogDto>(`/audit-logs/${id}`);

interface CreateAuditLogInput {
  entity_name: string;
  entity_id: number;
  action: string;
  user_id: number;
  change_summary?: string;
}

export const createAuditLog = (input: CreateAuditLogInput) =>
  httpClient.post<AuditLogDto>('/audit-logs', input);

export const deleteAuditLog = (id: number) =>
  httpClient.delete<number>(`/audit-logs/${id}`);
