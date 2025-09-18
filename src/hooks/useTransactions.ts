import { useCallback, useEffect, useState } from 'react';
import { listAllTransactions } from '../api/inventory';
import type { TransactionItem } from '../types/transaction';

export function useTransactions() {
  const [rows, setRows] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [transactionType, setTransactionType] = useState<string>('');
  const [batchId, setBatchId] = useState<string>('');
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAllTransactions({
        page,
        limit,
        search: q,
        ...(transactionType ? { type: transactionType } : {}),
        ...(batchId ? { batchId: Number(batchId) } : {}),
        ...(userId ? { userId } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(status ? { status } : {}),
        sortDir: 'desc',
      });

      const data = (res as any).data || [];
      const meta = (res as any).meta || {
        totalItems: data.length,
        page,
        limit,
      };

      const mapped: TransactionItem[] = data.map((d: any) => ({
        id: String(d.id),
        transactionId: `TXN-${String(d.id).padStart(4, '0')}`,
        batchId: d.batchId,
        transactionType: d.transactionType,
        quantity: d.quantity,
        transactionDate: d.transactionDate,
        userId: d.userId,
        username: d.username || 'Unknown User',
        drugSku: d.drugSku || '',
        drugName: d.drugName || 'Unknown Drug',
        supplierName: d.supplierName || 'Unknown Supplier',
        fromLocationName: d.fromLocationName,
        toLocationName: d.toLocationName,
        notes: d.notes,
        status: d.status || 'completed',
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }));

      setRows(mapped);
      setTotalItems(meta.totalItems);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch transactions');
      setRows([]);
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    q,
    transactionType,
    batchId,
    userId,
    startDate,
    endDate,
    status,
  ]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    rows,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    q,
    setQ,
    totalItems,
    transactionType,
    setTransactionType,
    batchId,
    setBatchId,
    userId,
    setUserId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    status,
    setStatus,
    refetch: fetchTransactions,
  };
}
