import { useEffect, useState } from 'react';
import { listBatches } from '../api/inventory';

export interface SaleBatchRow {
  id: string;
  drugName: string;
  strength?: string;
  sku: string;
  batchNumber: string;
  quantity: number;
  unitTypeName?: string;
  expiryDate: string; // YYYY-MM-DD
}

export function useSaleBatchSearch(initialLimit: number = 50) {
  const [batches, setBatches] = useState<SaleBatchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      try {
        // Only batches a sale can use (in stock, not expired), soonest
        // expiry first so the batch that should be sold next is on top
        const res = await listBatches({
          search,
          limit: initialLimit,
          page: 1,
          stockStatus: 'Sellable',
          sortBy: 'expiryDate',
          sortDir: 'asc',
        });

        if (cancelled) return;

        const mapped: SaleBatchRow[] = (res.data || []).map((item: any) => ({
          id: String(item.id),
          drugName: item.drugName || 'Unknown Drug',
          strength: item.drugStrength,
          sku: item.drugSku || '',
          batchNumber: item.batchNumber || String(item.id),
          quantity: item.currentQty || 0,
          unitTypeName: item.unitTypeName,
          expiryDate: item.expiryDate
            ? String(item.expiryDate).slice(0, 10)
            : '',
        }));

        setBatches(mapped);
        setError(null);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Failed to search batches for sale');
        setBatches([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetch();

    return () => {
      cancelled = true;
    };
  }, [search, initialLimit]);

  return {
    batches,
    loading,
    error,
    search,
    setSearch,
  };
}



