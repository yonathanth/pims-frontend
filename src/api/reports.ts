import { httpClient } from './tauriClient';

export interface ReportFilters {
  fromDate?: string;
  toDate?: string;
  category?: string;
  status?: string;
  supplier?: string;
  drugId?: number;
  daysThreshold?: number;
  orderStatus?: string;
}

export interface ReportData {
  reportType: string;
  filters: ReportFilters;
  data: any[];
  headers: { key: string; header: string }[];
  summary: {
    totalRecords: number;
    totalValue?: number;
    totalQuantity?: number;
    [key: string]: any;
  };
}

export interface InventoryReportItem {
  id: number;
  drugName: string;
  sku: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  location: string;
  unitPrice: number;
  lastRestock: string;
  supplier: string;
  category: string;
  status: string;
}

export interface SalesReportItem {
  id: number;
  transactionDate: string;
  sku: string;
  drugName: string;
  quantitySold: number;
  unitPrice: number;
  totalPrice: number;
  user: string;
  category: string;
}

export interface ExpiryReportItem {
  id: number;
  sku: string;
  drugName: string;
  batchNumber: string;
  expiryDate: string;
  quantityRemaining: number;
  daysUntilExpiry: number;
  location: string;
  supplier: string;
  unitCost: number;
  totalValue: number;
  category: string;
}

export interface PurchaseReportItem {
  id: number;
  orderId: number;
  orderDate: string;
  expectedDate: string;
  supplier: string;
  drugName: string;
  sku: string;
  category: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  status: string;
  fulfillmentRate: number;
}

// Report generation functions
export async function generateInventoryReport(
  filters: ReportFilters = {},
): Promise<ReportData> {
  return httpClient.get<ReportData>('/reports/inventory', filters);
}

export async function generateSalesReport(
  filters: ReportFilters = {},
): Promise<ReportData> {
  return httpClient.get<ReportData>('/reports/sales', filters);
}

export async function generateExpiryReport(
  filters: ReportFilters = {},
): Promise<ReportData> {
  return httpClient.get<ReportData>('/reports/expiry', filters);
}

export async function generatePurchaseReport(
  filters: ReportFilters = {},
): Promise<ReportData> {
  return httpClient.get<ReportData>('/reports/purchase', filters);
}

export async function previewReport(
  type: 'inventory' | 'sales' | 'expiry' | 'purchase',
  filters: ReportFilters = {},
): Promise<ReportData> {
  return httpClient.get<ReportData>(`/reports/preview/${type}`, filters);
}

// File download functions
export async function downloadReport(
  type: 'inventory' | 'sales' | 'expiry' | 'purchase',
  format: 'pdf' | 'excel',
  filters: ReportFilters = {},
): Promise<void> {
  const queryParams = new URLSearchParams();

  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const url = `/reports/export/${type}/${format}?${queryParams.toString()}`;

  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}${url}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${type}_report_${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
}

// Helper function to get auth token
function getAuthToken(): string {
  try {
    const session = localStorage.getItem('session');
    if (session) {
      const sessionData = JSON.parse(session);
      return sessionData.token || '';
    }
  } catch (error) {
    console.warn('Error getting auth token:', error);
  }
  return '';
}

// Get available categories for filters
export async function getCategories(): Promise<{ id: number; name: string }[]> {
  return httpClient.get<{ id: number; name: string }[]>('/categories');
}

// Get available suppliers for filters
export async function getSuppliers(): Promise<{ id: number; name: string }[]> {
  return httpClient.get<{ id: number; name: string }[]>('/suppliers');
}
