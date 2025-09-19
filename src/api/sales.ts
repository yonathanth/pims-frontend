import { httpClient } from './tauriClient';

export interface PendingSale {
  id: number;
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
