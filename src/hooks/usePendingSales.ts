import { useState, useEffect, useCallback } from 'react';
import {
  getPendingSales,
  approveSale,
  declineSale,
  type PendingSale,
} from '../api/sales';

export function usePendingSales() {
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sales = await getPendingSales();
      setPendingSales(sales);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch pending sales',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApproveSale = useCallback(async (id: number) => {
    try {
      await approveSale(id, {});
      // Remove the approved sale from pending list
      setPendingSales((prev) => prev.filter((sale) => sale.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve sale');
      throw err;
    }
  }, []);

  const handleDeclineSale = useCallback(async (id: number, reason: string) => {
    try {
      await declineSale(id, { reason });
      // Remove the declined sale from pending list
      setPendingSales((prev) => prev.filter((sale) => sale.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline sale');
      throw err;
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchPendingSales();
    const interval = setInterval(fetchPendingSales, 30000);
    return () => clearInterval(interval);
  }, [fetchPendingSales]);

  return {
    pendingSales,
    loading,
    error,
    refreshPendingSales: fetchPendingSales,
    approveSale: handleApproveSale,
    declineSale: handleDeclineSale,
  };
}
