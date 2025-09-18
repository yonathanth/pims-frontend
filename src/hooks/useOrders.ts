import { useEffect, useState, useCallback } from 'react';
import type { OrderItem } from '../data/orderData';
import { listPurchaseOrders } from '../api/orders';

export function useOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState<
    'createdDate' | 'expectedDate' | 'status'
  >('createdDate');
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await listPurchaseOrders({
        q,
        limit,
        ...(page ? { offset: (page - 1) * limit } : ({} as any)),
        ...(sortBy ? { sort_by: sortBy } : ({} as any)),
        ...(sortDir ? { descending: sortDir === 'DESC' } : ({} as any)),
        ...(statusFilter && statusFilter !== 'All Statuses'
          ? { status: statusFilter }
          : ({} as any)),
      })) as any;
      const rows = (result?.data as any[]) ?? (result as any[]);
      const meta = (result?.meta as any) ?? undefined;
      const mapped = rows.map((order: any) => ({
        // Map backend fields to OrderItem interface
        id: String(
          order.order.purchase_order_id ?? order.order.purchaseOrderId,
        ),
        orderId: String(
          order.order.purchase_order_id ?? order.order.purchaseOrderId,
        ),
        orderDate: (order.order.created_at || 'N/A')
          ?.toString()
          .split('T')[0]
          .split(' ')[0],
        arrivalDate: (order.order.expected_date || 'N/A')
          ?.toString()
          .split('T')[0]
          .split(' ')[0],
        items: order.items_count ?? order.itemsCount ?? 0,
        status: order.order.status,
        supplier: order.supplier_name ?? order.supplierName ?? 'Unknown',
      }));
      setOrders(mapped);
      if (meta && typeof meta.totalItems === 'number') {
        setTotalItems(meta.totalItems);
      } else {
        setTotalItems((res) =>
          mapped.length < limit && page === 1 ? mapped.length : res,
        );
      }
      setError(null);
    } catch (error) {
      setError('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [q, limit, page, sortBy, sortDir, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    page,
    setPage,
    limit,
    setLimit,
    q,
    setQ,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    totalItems,
    statusFilter,
    setStatusFilter,
  };
}
