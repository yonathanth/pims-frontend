import { useState, useEffect, useCallback } from 'react';
import {
  getPendingSales,
  approveSale,
  declineSale,
  approveSaleGroup,
  declineSaleGroup,
  type PendingSale,
} from '../api/sales';

export function usePendingSales() {
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingSales = useCallback(async (isBackgroundRefresh = false) => {
    // Only show loading state for manual refreshes, not background refreshes
    if (!isBackgroundRefresh) {
      setLoading(true);
    }
    setError(null);
    try {
      const sales = await getPendingSales();
      setPendingSales(sales);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch pending sales',
      );
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
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

  const handleApproveSaleGroup = useCallback(async (saleId: number) => {
    try {
      await approveSaleGroup(saleId, {});
      // Remove all sales in this group from pending list
      setPendingSales((prev) =>
        prev.filter((sale) => sale.saleId !== saleId),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to approve sale group',
      );
      throw err;
    }
  }, []);

  const handleDeclineSaleGroup = useCallback(
    async (saleId: number, reason: string) => {
      try {
        await declineSaleGroup(saleId, { reason });
        // Remove all sales in this group from pending list
        setPendingSales((prev) =>
          prev.filter((sale) => sale.saleId !== saleId),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to decline sale group',
        );
        throw err;
      }
    },
    [],
  );

  // Auto-refresh every 2 seconds (background refresh)
  useEffect(() => {
    fetchPendingSales(); // Initial load with loading state
    const interval = setInterval(() => {
      fetchPendingSales(true); // Background refresh without loading state
    }, 2000); // Reduced from 1000ms to 2000ms for smoother experience
    return () => clearInterval(interval);
  }, [fetchPendingSales]);

  return {
    pendingSales,
    loading,
    error,
    refreshPendingSales: () => fetchPendingSales(false), // Manual refresh with loading state
    approveSale: handleApproveSale,
    declineSale: handleDeclineSale,
    approveSaleGroup: handleApproveSaleGroup,
    declineSaleGroup: handleDeclineSaleGroup,
  };
}
