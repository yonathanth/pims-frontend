import { useCallback, useEffect, useState } from 'react';
import { listAuditLogs } from '../api/audit';
import type { AuditLogItem } from '../data/auditLogData';

export function useAuditLogs() {
  const [rows, setRows] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [entityName, setEntityName] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [entityId, setEntityId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAuditLogs({
        page,
        limit,
        q,
        ...(entityName ? { entity_name: entityName } : ({} as any)),
        ...(action ? { action } : ({} as any)),
        ...(userId ? { user_id: Number(userId) } : ({} as any)),
        ...(entityId ? { entity_id: Number(entityId) } : ({} as any)),
        ...(startDate ? { startDate } : ({} as any)),
        ...(endDate ? { endDate } : ({} as any)),
      } as any);
      const data = (res as any).data || [];
      const meta = (res as any).meta || {
        totalItems: data.length,
        page,
        limit,
      };
      const mapped: AuditLogItem[] = data.map((d: any) => ({
        id: String(d.id ?? d.audit_id),
        auditId: `AUD-${String(d.id ?? d.audit_id).padStart(4, '0')}`,
        entityName: d.entityName ?? d.entity_name,
        entityId: String(d.entityId ?? d.entity_id),
        action: String(d.action).toUpperCase(),
        user: String(d.user?.id ?? d.userId ?? d.user_id ?? ''),
        timestamp: d.timestamp,
        details: {
          description: d.changeSummary ?? d.change_summary ?? '',
          ipAddress: '-',
          userAgent: '-',
        },
      }));
      setRows(mapped);
      setTotalItems(meta.totalItems ?? mapped.length);
      setError(null);
    } catch (e: any) {
      setRows([]);
      setError(e?.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    q,
    entityName,
    action,
    userId,
    entityId,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    rows,
    loading,
    error,
    refetch: fetchLogs,
    page,
    setPage,
    limit,
    setLimit,
    q,
    setQ,
    totalItems,
    entityName,
    setEntityName,
    action,
    setAction,
    userId,
    setUserId,
    entityId,
    setEntityId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  };
}
