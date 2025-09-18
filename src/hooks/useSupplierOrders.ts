import { useState, useCallback } from 'react';
import { getSupplierOrders } from '../api/suppliers';

export function useSupplierOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrdersBySupplier = useCallback(async (supplierId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSupplierOrders(supplierId, {
        limit: 10, // Get last 10 orders
        sort_by: 'createdDate',
        descending: true,
      });
      setOrders(result.data || []);
    } catch (err) {
      setError('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrdersBySupplier,
  };
}
