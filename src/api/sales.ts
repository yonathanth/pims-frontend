import { httpClient } from './tauriClient';

export interface PendingSale {
  id: number;
  // Optional sale group identifier (present for grouped sales)
  saleId?: number | null;
  drugName: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customerName: string;
  customerId: number;
  createdAt: string;
  notes?: string;
  batchId: number;
  batchNumber: string;
  expiryDate: string;
  currentStock: number;
}

export interface Sale {
  id: number;
  // Optional sale group identifier (present for grouped sales)
  saleId?: number | null;
  drugName: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customerName: string;
  customerId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  batchId: number;
  batchNumber: string;
  expiryDate: string;
}

export interface SalesResponse {
  sales: Sale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SalesQueryParams {
  page?: number;
  limit?: number;
  status?: 'all' | 'pending' | 'approved' | 'declined';
  search?: string;
}

export interface ApproveSaleRequest {
  notes?: string;
}

export interface DeclineSaleRequest {
  reason: string;
}

export interface CreateSaleItemRequest {
  batchId: number;
  quantity: number;
  lineNotes?: string;
}

export interface CreateSaleRequest {
  notes?: string;
  items: CreateSaleItemRequest[];
}

// Get pending sales for approval
export async function getPendingSales(): Promise<PendingSale[]> {
  return httpClient.get<PendingSale[]>('/sales/pending');
}

// Get all sales with pagination
export async function getSales(
  params: SalesQueryParams = {},
): Promise<SalesResponse> {
  return httpClient.get<SalesResponse>('/sales', params);
}

// Create a grouped sale (sale header + multiple line items)
export async function createSaleGroup(
  data: CreateSaleRequest,
): Promise<void> {
  return httpClient.post('/sales', data);
}

export type ExpiryOrderPolicy = 'off' | 'warn' | 'block';

export interface ExpiryOrderConflict {
  batchId: number;
  batchNumber: string | null;
  drugName: string;
  expiryDate: string;
  soonerBatches: Array<{
    batchId: number;
    batchNumber: string | null;
    expiryDate: string;
    availableQty: number;
  }>;
}

// Checks whether the sale takes stock from a batch while the same product has
// batches that expire sooner; the admin-set policy says whether to warn or block
export async function checkSaleExpiryOrder(
  data: CreateSaleRequest,
): Promise<{ policy: ExpiryOrderPolicy; conflicts: ExpiryOrderConflict[] }> {
  return httpClient.post('/sales/expiry-check', data);
}

// Approve a sale
export async function approveSale(
  id: number,
  data: ApproveSaleRequest,
): Promise<void> {
  return httpClient.post(`/sales/${id}/approve`, data);
}

// Decline a sale
export async function declineSale(
  id: number,
  data: DeclineSaleRequest,
): Promise<void> {
  return httpClient.post(`/sales/${id}/decline`, data);
}

// Approve an entire sale group
export async function approveSaleGroup(
  saleId: number,
  data: ApproveSaleRequest,
): Promise<void> {
  return httpClient.post(`/sales/group/${saleId}/approve`, data);
}

// Decline an entire sale group
export async function declineSaleGroup(
  saleId: number,
  data: DeclineSaleRequest,
): Promise<void> {
  return httpClient.post(`/sales/group/${saleId}/decline`, data);
}

// Product Sales Types
export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface ProductSalesQuery {
  period?: PeriodType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ProductSalesSummary {
  numberOfProductsSold: number;
  totalQuantitySold: number;
  mostSoldItem: string;
  totalRevenue: number;
  totalProfit: number;
}

export interface ProductSale {
  drugId: number;
  drugName: string;
  sku: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
  totalProfit: number;
  unitPrice: number;
}

export interface ProductSalesResponse {
  summary: ProductSalesSummary;
  products: ProductSale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Get product sales with pagination and period filtering
export async function getProductSales(
  params: ProductSalesQuery = {},
): Promise<ProductSalesResponse> {
  return httpClient.get<ProductSalesResponse>('/sales/products', params);
}
