import { useEffect } from 'react';
import { useSupplierOrders } from '../hooks/useSupplierOrders';
import type { SupplierItem } from '../data/supplierData';

interface SupplierExpandedRowProps {
  supplier: SupplierItem;
}

const SupplierExpandedRow = ({ supplier }: SupplierExpandedRowProps) => {
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    fetchOrdersBySupplier,
  } = useSupplierOrders();

  useEffect(() => {
    if (supplier.id) {
      fetchOrdersBySupplier(Number(supplier.id));
    }
  }, [supplier.id, fetchOrdersBySupplier]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6">
      <h4 className="font-semibold text-lg mb-3">
        Orders from {supplier.name}
      </h4>
      {ordersLoading ? (
        <div className="text-center py-4">Loading orders...</div>
      ) : ordersError ? (
        <div className="text-red-600 py-4">
          Error loading orders: {ordersError}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-gray-500 py-4">
          No orders found for this supplier.
        </div>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Order ID</th>
              <th className="border border-gray-300 p-2 text-left">
                Created Date
              </th>
              <th className="border border-gray-300 p-2 text-left">
                Expected Date
              </th>
              <th className="border border-gray-300 p-2 text-left">Status</th>
              <th className="border border-gray-300 p-2 text-left">
                Items Count
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="border border-gray-300 p-2">PO-{order.id}</td>
                <td className="border border-gray-300 p-2">
                  {formatDate(order.createdDate)}
                </td>
                <td className="border border-gray-300 p-2">
                  {order.expectedDate ? formatDate(order.expectedDate) : 'N/A'}
                </td>
                <td className="border border-gray-300 p-2">{order.status}</td>
                <td className="border border-gray-300 p-2">
                  {order._count?.items || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SupplierExpandedRow;
