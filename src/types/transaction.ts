export interface TransactionItem {
  id: string;
  batchId: number;
  transactionType: string;
  quantity: number;
  transactionDate: string;
  userId: number;
  username: string;
  drugSku: string;
  drugName: string;
  supplierName: string;
  fromLocationName?: string;
  toLocationName?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListTransactionsQuery {
  page?: number;
  limit?: number;
  sortDir?: 'asc' | 'desc';
  type?: string;
  batchId?: number;
  userId?: number;
  fromLocationId?: number;
  toLocationId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const transactionHeaders = [
  { key: 'id', header: 'ID' },
  { key: 'batchId', header: 'Batch ID' },
  { key: 'transactionType', header: 'Type' },
  { key: 'drugName', header: 'Drug Name' },
  { key: 'drugSku', header: 'SKU' },
  { key: 'quantity', header: 'Quantity' },
  { key: 'username', header: 'User' },
  { key: 'transactionDate', header: 'Transaction Date' },
  { key: 'status', header: 'Status' },
  { key: 'supplierName', header: 'Supplier' },
];

export const transactionFilterOptions = [
  { text: 'All Types', value: '' },
  { text: 'Sale', value: 'sale' },
  { text: 'Inbound', value: 'inbound' },
  { text: 'Positive Return', value: 'positive return' },
  { text: 'Negative Return', value: 'negative return' },
];

export const transactionCustomFilter = (row: TransactionItem, filters: any) => {
  if (
    filters.type &&
    filters.type !== '' &&
    row.transactionType !== filters.type
  ) {
    return false;
  }
  return true;
};
