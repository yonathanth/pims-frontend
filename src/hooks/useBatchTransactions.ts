import { useState, useCallback } from 'react';
import { listAllTransactions } from '../api/inventory';

export function useBatchTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactionsByBatch = useCallback(async (batchId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAllTransactions({
        batchId,
        limit: 10,
        page: 1,
      });

      const transactions = (result as any).data || [];
      setTransactions(transactions);
      return transactions;
    } catch (err: any) {
      setError(
        `Failed to fetch transactions: ${err?.message || 'Unknown error'}`,
      );
      setTransactions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    transactions,
    loading,
    error,
    fetchTransactionsByBatch,
  };
}
