// Batch/Inventory-related types for Tauri v2 backend integration
export type BatchDto = {
  batchId: number;
  drugId: number;
  supplierId: number;
  manufactureDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  unitCost: number;
  purchaseDate: string; // YYYY-MM-DD
  currentQty: number;
};

export type CreateBatchInput = {
  batch_number?: string;
  drug_id: number;
  supplier_id: number;
  manufacture_date: string;
  expiry_date: string;
  unit_cost: number;
  unit_price: number;
  purchase_date: string;
  current_qty: number;
  low_stock_threshold?: number;
  location_ids?: number[];
};

export type UpdateBatchInput = CreateBatchInput;

export type BatchViewDto = {
  batch: BatchDto;
  sku: string;
  drug_name: string;
  supplier_name: string;
};

export type ListBatchesQuery = {
  q?: string; // sku, drug name, supplier, or numeric batch_id
  status?:
    | 'in_stock'
    | 'out_of_stock'
    | 'low_stock'
    | 'expired'
    | 'near_expiry';
  sort_by?: 'expiry_date' | 'quantity' | 'last_restock' | 'sku' | 'drug_name';
  descending?: boolean;
  limit?: number;
  offset?: number;
};

export type TransactionDto = {
  transaction_id: number;
  batch_id: number;
  transaction_type: string; // "sale" | "inbound" | "positive return" | "negative return"
  quantity: number;
  transaction_date: string; // "YYYY-MM-DD HH:mm:ss"
  user_id: number;
  notes?: string | null;
};

export type CreateTransactionInput = {
  batch_id: number;
  transaction_type: string;
  quantity: number;
  transaction_date: string;
  notes?: string | null;
};

export type ListTransactionsQuery = {
  type?: string; // e.g., "sale"
  descending?: boolean; // default true
  limit?: number;
  offset?: number;
};
