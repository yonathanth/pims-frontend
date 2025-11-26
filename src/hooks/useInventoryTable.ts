import { useCallback, useEffect, useState } from 'react';
import {
  listBatches,
  createBatch,
  updateBatch,
  deleteBatch,
} from '../api/inventory';
import type { CreateBatchInput, UpdateBatchInput } from '../types/inventory';

export interface InventoryRow {
  id: string;
  drugName: string;
  sku: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  reorderLevel: number;
  location: string;
  unitPrice: string;
  purchaseDate: string;
  supplier: string;
  transactionHistory: Array<{
    date: string;
    time: string;
    type: string;
    quantity: number;
    user: string;
  }>;
  // Original data for editing
  drugId: number;
  supplierId: number;
  manufactureDate: string;
  unitCost: number;
  currentQty: number;
  batchNumberValue?: string; // Original batchNumber from API (for editing)
}

export function useInventoryTable() {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState<
    | 'purchaseDate'
    | 'expiryDate'
    | 'currentQty'
    | 'drugName'
    | 'sku'
    | 'batchNumber'
  >('batchNumber');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [drugId, setDrugId] = useState<number | undefined>(undefined);
  const [supplierId, setSupplierId] = useState<number | undefined>(undefined);
  const [stockStatus, setStockStatus] = useState<
    | 'All'
    | 'In stock'
    | 'Out of Stock'
    | 'Low Stock'
    | 'Expired'
    | 'Near-Expiry'
  >('All');
  const [expiryFrom, setExpiryFrom] = useState<string | undefined>(undefined);
  const [expiryTo, setExpiryTo] = useState<string | undefined>(undefined);
  const [totalItems, setTotalItems] = useState(0);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        sortBy: sortBy, // Backend now supports batchNumber sorting
        sortDir,
      };

      if (q) params.search = q;
      if (drugId) params.drugId = drugId;
      if (supplierId) params.supplierId = supplierId;
      if (stockStatus && stockStatus !== 'All')
        params.stockStatus = stockStatus;
      if (expiryFrom) params.expiryFrom = expiryFrom;
      if (expiryTo) params.expiryTo = expiryTo;

      const result = await listBatches(params);

      const mapped: InventoryRow[] = (result.data || []).map((item: any) => ({
        id: String(item.id),
        // Use drugName which now contains tradeName ?? genericName from backend
        drugName: item.drugName || 'Unknown Drug',
        sku: item.drugSku || '',
        batchNumber: item.batchNumber || String(item.id), // Use batchNumber if available, fallback to id
        expiryDate: item.expiryDate
          ? new Date(item.expiryDate).toISOString().split('T')[0]
          : '',
        quantity: item.currentQty || 0,
        reorderLevel: item.lowStockThreshold || 50,
        location: 'Unknown', // Location data not available in current API
        unitPrice: String(item.unitPrice || 0),
        purchaseDate: item.purchaseDate
          ? new Date(item.purchaseDate).toISOString().split('T')[0]
          : '',
        supplier: item.supplierName || 'Unknown',
        transactionHistory: [], // Would need separate API call
        // Original data for editing
        drugId: item.drugId,
        supplierId: item.supplierId,
        manufactureDate: item.manufactureDate
          ? new Date(item.manufactureDate).toISOString().split('T')[0]
          : '',
        unitCost: item.unitCost || 0,
        currentQty: item.currentQty || 0,
        batchNumberValue: item.batchNumber, // Store original batchNumber for editing
      }));

      setInventory(mapped);
      setTotalItems(result.meta?.totalItems || mapped.length);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch inventory:', err);
      setError(err?.message || 'Failed to fetch inventory');
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    q,
    sortBy,
    sortDir,
    drugId,
    supplierId,
    stockStatus,
    expiryFrom,
    expiryTo,
  ]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const addBatch = async (input: CreateBatchInput) => {
    try {
      await createBatch(input);
      setError(null);
      // Reset to first page and refresh data
      if (page !== 1) {
        setPage(1);
      } else {
        fetchInventory();
      }
      return { ok: true } as const;
    } catch (e: any) {
      const message = e?.message || 'Failed to create batch';
      setError(message);
      return { ok: false, message } as const;
    }
  };

  const editBatch = async (id: string, input: UpdateBatchInput) => {
    try {
      await updateBatch(Number(id), input);
      setError(null);
      fetchInventory();
      return { ok: true } as const;
    } catch (e: any) {
      const message = e?.message || 'Failed to update batch';
      setError(message);
      return { ok: false, message } as const;
    }
  };

  const removeBatch = async (id: string) => {
    try {
      await deleteBatch(Number(id));
      setError(null);
      fetchInventory();
      return { ok: true } as const;
    } catch (e: any) {
      const message = e?.message || 'Failed to delete batch';
      setError(message);
      return { ok: false, message } as const;
    }
  };

  const clearError = () => setError(null);

  return {
    inventory,
    loading,
    error,
    refetch: fetchInventory,
    // Server-driven controls
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
    drugId,
    setDrugId,
    supplierId,
    setSupplierId,
    stockStatus,
    setStockStatus,
    expiryFrom,
    setExpiryFrom,
    expiryTo,
    setExpiryTo,
    totalItems,
    // CRUD operations
    addBatch,
    editBatch,
    removeBatch,
    clearError,
  };
}
