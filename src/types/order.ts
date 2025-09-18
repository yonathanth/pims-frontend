// Purchase Order-related types for Tauri v2 backend integration
export type PurchaseOrderDto = {
  purchase_order_id: number;
  supplier_id: number;
  created_at: string; // "YYYY-MM-DD HH:mm:ss"
  expected_date?: string | null;
  status: string; // "Pending" | "Partially Completed" | "Completed" | "Cancelled"
};

export type CreatePurchaseOrderInput = {
  supplier_id: number;
  created_at?: string; // optional, defaults to now
  expected_date?: string;
  status?: string; // defaults to "Pending"
};

export type UpdatePurchaseOrderInput = {
  supplier_id: number;
  created_at?: string;
  expected_date?: string;
  status?: string;
};

export type PurchaseOrderWithTotalsDto = {
  order: PurchaseOrderDto;
  supplier_name: string;
  items_count: number;
};

export type PurchaseOrderItemDto = {
  purchase_order_item_id: number;
  purchase_order_id: number;
  drug_id: number;
  batch_id?: number | null;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  status: string;
};

export type CreatePurchaseOrderItemInput = {
  purchase_order_id: number;
  drug_id: number;
  quantity_ordered: number;
  quantity_received?: number; // defaults 0
  unit_cost: number;
  status?: string; // optional, otherwise derived from quantities
};

export type UpdatePurchaseOrderItemInput = {
  drug_id: number;
  batch_id?: number | null;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  status?: string;
};

export type ListOrdersQuery = {
  q?: string; // supplier name or numeric order id
  supplier_id?: number; // filter by supplier ID
  status?: 'pending' | 'partially received' | 'completed' | 'cancelled';
  sort_by?: 'createdDate' | 'expectedDate';
  descending?: boolean;
  limit?: number;
  offset?: number;
};

export type ListOrderItemsQuery = {
  purchase_order_id?: number;
  status?: string;
  sort_by?: 'quantity_ordered' | 'quantity_received' | 'unit_cost';
  descending?: boolean;
  limit?: number;
  offset?: number;
};
