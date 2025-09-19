import { useState, useEffect, useCallback } from 'react';
import {
  getSales,
  type SalesResponse,
  type SalesQueryParams,
} from '../api/sales';

export function useSales(initialParams: SalesQueryParams = {}) {
  const [salesData, setSalesData] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<SalesQueryParams>({
    page: 1,
    limit: 10,
    status: 'all',
    ...initialParams,
  });

  const fetchSales = useCallback(
    async (queryParams: SalesQueryParams = params) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSales(queryParams);
        setSalesData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sales');
      } finally {
        setLoading(false);
      }
    },
    [params],
  );

  const updateParams = useCallback((newParams: Partial<SalesQueryParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      updateParams({ page });
    },
    [updateParams],
  );

  const setSearch = useCallback(
    (search: string) => {
      updateParams({ search, page: 1 }); // Reset to first page when searching
    },
    [updateParams],
  );

  const setStatus = useCallback(
    (status: SalesQueryParams['status']) => {
      updateParams({ status, page: 1 }); // Reset to first page when changing status
    },
    [updateParams],
  );

  // Fetch data when params change
  useEffect(() => {
    fetchSales(params);
  }, [fetchSales, params]);

  return {
    salesData,
    loading,
    error,
    params,
    refreshSales: () => fetchSales(params),
    updateParams,
    goToPage,
    setSearch,
    setStatus,
  };
}
