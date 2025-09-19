import { httpClient } from './tauriClient';
import type {
  PurchaseOrderDto,
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  PurchaseOrderWithTotalsDto,
  PurchaseOrderItemDto,
  CreatePurchaseOrderItemInput,
  UpdatePurchaseOrderItemInput,
  ListOrdersQuery,
  ListOrderItemsQuery,
} from '../types/order';

// Helpers
function mapOrdersQuery(query: ListOrdersQuery = {}) {
  const params: Record<string, any> = {};
  if (query.q) params.search = query.q;
  if (query.supplier_id) params.supplierId = query.supplier_id;
  if (query.status) params.status = query.status;
  if (query.sort_by) params.sortBy = query.sort_by;
  if (query.descending !== undefined)
    params.sortDir = query.descending ? 'desc' : 'asc';
  if (query.limit) params.limit = query.limit;
  if (query.offset !== undefined) {
    const limit = query.limit ?? 50;
    params.page = Math.floor((query.offset as number) / limit) + 1;
  }
  return params;
}

function normalizeStatus(status?: string) {
  if (!status) return undefined as any;
  // Force to exactly one of the UI statuses
  const s = status.trim().toLowerCase();
  if (s.startsWith('comp')) return 'Complete';
  if (s.startsWith('pend')) return 'Pending';
  if (s.startsWith('part')) return 'Partially Received';
  if (s.startsWith('canc')) return 'Cancelled';
  return status;
}

function mapCreateOrderPayload(input: CreatePurchaseOrderInput) {
  return {
    supplierId: input.supplier_id,
    createdDate: input.created_at ?? undefined,
    expectedDate: input.expected_date ?? undefined,
    status: normalizeStatus(input.status) ?? 'Pending',
  } as any;
}

function mapUpdateOrderPayload(input: UpdatePurchaseOrderInput) {
  return {
    supplierId: input.supplier_id,
    createdDate: (input as any).created_at ?? undefined,
    expectedDate: input.expected_date ?? undefined,
    status: normalizeStatus(input.status),
  } as any;
}

function mapCreateItemPayload(input: CreatePurchaseOrderItemInput) {
  return {
    drugId: input.drug_id,
    quantityOrdered: input.quantity_ordered,
    quantityReceived: input.quantity_received ?? 0,
    unitCost: input.unit_cost,
    status: normalizeStatus(input.status) ?? 'Pending',
  } as any;
}

function mapUpdateItemPayload(input: UpdatePurchaseOrderItemInput) {
  return {
    drugId: input.drug_id,
    batchId: input.batch_id ?? undefined,
    quantityOrdered: input.quantity_ordered,
    quantityReceived: input.quantity_received,
    unitCost: input.unit_cost,
    status: normalizeStatus(input.status),
  } as any;
}

function toProductName(drug: any, drugId?: number) {
  return (
    drug?.brandName ||
    drug?.genericName ||
    drug?.brand_name ||
    drug?.generic_name ||
    (drugId != null ? `Drug ID: ${drugId}` : 'Unknown Product')
  );
}

// Purchase Order API
export const listPurchaseOrders = async (query: ListOrdersQuery = {}) => {
  const res = await httpClient.get<{
    data: any[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }>('/purchase-orders', mapOrdersQuery(query));
  const rows = (res as any).data || [];
  const mapped: PurchaseOrderWithTotalsDto[] = rows.map((po: any) => ({
    order: {
      purchase_order_id: po.id ?? po.purchase_order_id,
      supplier_id: po.supplierId ?? po.supplier_id,
      created_at: po.createdDate ?? po.created_at ?? po.createdAt,
      expected_date: po.expectedDate ?? po.expected_date,
      status: po.status,
    } as PurchaseOrderDto,
    supplier_name: po.supplier?.name ?? po.supplier_name ?? '',
    items_count: Array.isArray(po.items)
      ? po.items.length
      : (po.items_count ?? 0),
  }));
  const meta = (res as any).meta || {
    page: 1,
    limit: mapped.length,
    totalItems: mapped.length,
    totalPages: 1,
  };
  return { data: mapped, meta } as any;
};

export const createPurchaseOrder = async (input: CreatePurchaseOrderInput) => {
  const payload = mapCreateOrderPayload(input);
  const res = await httpClient.post<any>('/purchase-orders', payload);
  const po = res as any;
  const mapped: PurchaseOrderDto = {
    purchase_order_id: po.id ?? po.purchase_order_id,
    supplier_id: po.supplierId ?? po.supplier_id,
    created_at: po.createdAt ?? po.created_at,
    expected_date: po.expectedDate ?? po.expected_date,
    status: po.status,
  };
  return mapped;
};

export const updatePurchaseOrder = (
  id: number,
  input: UpdatePurchaseOrderInput,
) => {
  const payload = mapUpdateOrderPayload(input);
  return httpClient.patch<PurchaseOrderDto>(`/purchase-orders/${id}`, payload);
};

export const deletePurchaseOrder = (id: number) => {
  return httpClient.delete<number>(`/purchase-orders/${id}`);
};

// Purchase Order Item API
export const listPurchaseOrderItems = async (
  query: ListOrderItemsQuery = {},
) => {
  const purchaseOrderId = query.purchase_order_id;
  if (!purchaseOrderId) return [] as PurchaseOrderItemDto[];
  const po = await httpClient.get<any>(`/purchase-orders/${purchaseOrderId}`);
  const items = (po as any)?.items ?? [];
  const mapped: PurchaseOrderItemDto[] = items.map((it: any) => ({
    purchase_order_item_id: it.id ?? it.purchase_order_item_id,
    purchase_order_id:
      it.purchaseOrderId ?? it.purchase_order_id ?? purchaseOrderId,
    drug_id: it.drugId ?? it.drug_id,
    batch_id: it.batchId ?? it.batch_id ?? null,
    quantity_ordered: it.quantityOrdered ?? it.quantity_ordered,
    quantity_received: it.quantityReceived ?? it.quantity_received ?? 0,
    unit_cost: it.unitCost ?? it.unit_cost ?? 0,
    status: it.status,
    product_name: toProductName(it.drug, it.drugId ?? it.drug_id),
  }));
  return mapped;
};

export const createPurchaseOrderItem = async (
  input: CreatePurchaseOrderItemInput,
) => {
  const payload = mapCreateItemPayload(input);
  const id = input.purchase_order_id;
  const res = await httpClient.post<any>(
    `/purchase-orders/${id}/items`,
    payload,
  );
  const it = res as any;
  const mapped: PurchaseOrderItemDto = {
    purchase_order_item_id: it.id ?? it.purchase_order_item_id,
    purchase_order_id: it.purchaseOrderId ?? it.purchase_order_id ?? id,
    drug_id: it.drugId ?? it.drug_id,
    batch_id: it.batchId ?? it.batch_id ?? null,
    quantity_ordered: it.quantityOrdered ?? it.quantity_ordered,
    quantity_received: it.quantityReceived ?? it.quantity_received ?? 0,
    unit_cost: it.unitCost ?? it.unit_cost ?? 0,
    status: it.status,
    product_name: toProductName(it.drug, it.drugId ?? it.drug_id),
  };
  return mapped;
};

export const updatePurchaseOrderItem = async (
  id: number,
  input: UpdatePurchaseOrderItemInput,
) => {
  const payload = mapUpdateItemPayload(input);
  const res = await httpClient.patch<any>(
    `/purchase-orders/items/${id}`,
    payload,
  );
  const it = res as any;
  const mapped: PurchaseOrderItemDto = {
    purchase_order_item_id: it.id ?? it.purchase_order_item_id,
    purchase_order_id: it.purchaseOrderId ?? it.purchase_order_id,
    drug_id: it.drugId ?? it.drug_id,
    batch_id: it.batchId ?? it.batch_id ?? null,
    quantity_ordered: it.quantityOrdered ?? it.quantity_ordered,
    quantity_received: it.quantityReceived ?? it.quantity_received ?? 0,
    unit_cost: it.unitCost ?? it.unit_cost ?? 0,
    status: it.status,
    product_name: toProductName(it.drug, it.drugId ?? it.drug_id),
  };
  return mapped;
};

export const deletePurchaseOrderItem = (id: number) => {
  return httpClient.delete<number>(`/purchase-orders/items/${id}`);
};
