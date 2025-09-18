export const summaryData: {
  label: string;
  value: string;
  trend: 'up' | 'down';
}[] = [
  { label: 'Total Profit', value: 'ETB 2,000,000', trend: 'down' },
  { label: 'Delayed Orders', value: '400', trend: 'up' },
  { label: 'Total Stock Value', value: 'ETB 40,000,000', trend: 'up' },
  { label: 'Expiring in a Month', value: '39', trend: 'up' },
  { label: 'Low Stock', value: '78', trend: 'down' },
  { label: 'Expired Batches', value: '12', trend: 'up' },
];

// Export alias for dashboard component
export const dashboardSummaryData = summaryData;

export const inventorySummaryData: {
  label: string;
  value: string;
  trend: 'up' | 'down';
}[] = [
  { label: 'Total Items', value: '17,000', trend: 'down' },
  { label: 'Turn Over Rate', value: '78%', trend: 'up' },
  { label: 'Expired Items', value: '400', trend: 'up' },
  { label: 'Expiring in a Month', value: '39', trend: 'up' },
  { label: 'Low Stock Items', value: '78', trend: 'down' },
];

export const salesSummaryData: {
  label: string;
  value: string;
  trend: 'up' | 'down';
}[] = [
  { label: 'Total Sales', value: '17,000', trend: 'down' },
  { label: 'Profit', value: '78%', trend: 'up' },
  { label: 'Total Transactions', value: '400', trend: 'up' },
  { label: 'Average Sale Value', value: '39', trend: 'up' },
  { label: 'Most Saled Item', value: 'Panadol', trend: 'down' },
];

export const supplierSummaryData: {
  label: string;
  value: string;
  trend: 'up' | 'down';
}[] = [
  { label: 'Total Suppliers', value: '17,000', trend: 'down' },
  { label: 'Incomplete Orders', value: '78%', trend: 'up' },
  { label: 'Delayed Orders', value: '400', trend: 'up' },
  { label: 'Average Delivery Time', value: '39', trend: 'up' },
  { label: 'Most Ordered Product', value: 'Panadol', trend: 'down' },
];

export const employeeSummaryData: {
  label: string;
  value: string;
  trend: 'up' | 'down';
}[] = [
  { label: 'Total Staff', value: '17,000', trend: 'down' },
  { label: 'Sales Per Desk', value: '78%', trend: 'up' },
  { label: 'Transaction Per Desk', value: '400', trend: 'up' },
  { label: 'Top Performer', value: '39', trend: 'up' },
];
