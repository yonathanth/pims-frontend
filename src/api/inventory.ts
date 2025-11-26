import { httpClient } from './tauriClient';
import type {
  CreateBatchInput,
  UpdateBatchInput,
  CreateTransactionInput,
  ListTransactionsQuery,
} from '../types/inventory';

function mapBatchesQuery(query: any = {}) {
  const params: Record<string, any> = {};
  if (query.search) params.search = query.search;
  if (query.q) params.search = query.q; // Support legacy
  if (query.limit) params.limit = query.limit;
  if (query.page) params.page = query.page;
  if (query.sortBy) params.sortBy = query.sortBy;
  if (query.sortDir) params.sortDir = query.sortDir;
  if (query.drugId) params.drugId = query.drugId;
  if (query.supplierId) params.supplierId = query.supplierId;
  if (query.stockStatus) params.stockStatus = query.stockStatus;
  if (query.expiryFrom) params.expiryFrom = query.expiryFrom;
  if (query.expiryTo) params.expiryTo = query.expiryTo;
  return params;
}

// Batch API
export const listBatches = async (query: any = {}) => {
  const res = await httpClient.get<{ data: any[]; meta: any }>(
    '/batches',
    mapBatchesQuery(query),
  );
  return res;
};

export const createBatch = (input: CreateBatchInput) => {
  return httpClient.post('/batches', {
    batchNumber: input.batch_number,
    drugId: input.drug_id,
    supplierId: input.supplier_id,
    manufactureDate: input.manufacture_date,
    expiryDate: input.expiry_date,
    unitPrice: input.unit_price,
    unitCost: input.unit_cost,
    purchaseDate: input.purchase_date,
    currentQty: input.current_qty,
    lowStockThreshold: input.low_stock_threshold,
    locationIds: input.location_ids,
  });
};

export const updateBatch = (id: number, input: UpdateBatchInput) => {
  return httpClient.patch(`/batches/${id}`, {
    batchNumber: input.batch_number,
    drugId: input.drug_id,
    supplierId: input.supplier_id,
    manufactureDate: input.manufacture_date,
    expiryDate: input.expiry_date,
    unitPrice: input.unit_price,
    unitCost: input.unit_cost,
    purchaseDate: input.purchase_date,
    currentQty: input.current_qty,
    lowStockThreshold: input.low_stock_threshold,
    locationIds: input.location_ids,
  });
};

export const deleteBatch = (id: number) => {
  return httpClient.delete(`/batches/${id}`);
};

// Transaction API
export const listTransactions = (query: ListTransactionsQuery = {}) => {
  return httpClient.get('/transactions', query);
};

export const createTransaction = (input: CreateTransactionInput) => {
  return httpClient.post('/transactions', {
    batchId: input.batch_id,
    transactionType: input.transaction_type,
    quantity: input.quantity,
    notes: input.notes,
  });
};

export const listAllTransactions = (query: any = {}) => {
  const params: Record<string, any> = {};
  if (query.page) params.page = query.page;
  if (query.limit) params.limit = query.limit;
  if (query.sortBy) params.sortBy = query.sortBy;
  if (query.sortDir) params.sortDir = query.sortDir;
  if (query.type) params.type = query.type;
  if (query.batchId) params.batchId = query.batchId;
  if (query.userId) params.userId = query.userId;
  if (query.fromLocationId) params.fromLocationId = query.fromLocationId;
  if (query.toLocationId) params.toLocationId = query.toLocationId;
  if (query.startDate) params.startDate = query.startDate;
  if (query.endDate) params.endDate = query.endDate;
  if (query.search) params.search = query.search;

  return httpClient.get('/transactions', params);
};

export const deleteTransaction = (id: number) => {
  return httpClient.delete(`/transactions/${id}`);
};
