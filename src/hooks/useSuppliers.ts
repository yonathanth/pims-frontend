import { useEffect, useState, useCallback } from 'react';
import type { SupplierItem } from '../data/supplierData';
import { listSuppliers } from '../api/suppliers';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState<
    'name' | 'contactName' | 'phone' | 'email'
  >('name');
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('ASC');
  const [totalItems, setTotalItems] = useState(0);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listSuppliers({
        q,
        limit,
        ...(page ? { page } : ({} as any)),
        ...(sortBy
          ? { sort_by: sortBy === 'contactName' ? 'contact_name' : sortBy }
          : ({} as any)),
        ...(sortDir ? { descending: sortDir === 'DESC' } : ({} as any)),
      });
      const rows = (res as any).data || [];
      const meta = (res as any).meta || {
        totalItems: rows.length,
        page,
        limit,
      };
      const mapped = rows.map((supplier: any) => ({
        // Map backend fields to SupplierItem interface
        id: String(supplier.id ?? supplier.supplierId ?? supplier.supplier_id),
        name: supplier.name,
        contactName: supplier.contactName ?? supplier.contact_name ?? 'N/A',
        phone: supplier.phone,
        email: supplier.email ?? 'N/A',
        address: supplier.address ?? 'N/A',
      }));
      setSuppliers(mapped);
      setTotalItems(meta.totalItems ?? mapped.length);
      setError(null);
    } catch (error) {
      setError('Failed to fetch suppliers');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [q, limit, page, sortBy, sortDir]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return {
    suppliers,
    loading,
    error,
    refetch: fetchSuppliers,
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
  };
}
