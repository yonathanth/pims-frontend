export type LocationItem = {
  id: string;
  locationCode: string;
  name: string;
  type: 'Shelf' | 'Fridge' | 'Room' | 'Other';
  maxCapacity: string;
  currentQuantity: number;
  utilization: number; // 0-100
  status: 'Active' | 'Full' | 'Near Full';
  notes?: string;
  items?: Array<{
    batch: string;
    drug: string;
    qty: number;
    expiryDate: string;
  }>;
};

export const locationHeaders = [
  { key: 'id', header: 'ID' },
  { key: 'locationCode', header: 'Location Code' },
  { key: 'name', header: 'Name' },
  { key: 'type', header: 'Type' },
  { key: 'maxCapacity', header: 'Max Capacity' },
  { key: 'currentQuantity', header: 'Current Quantity' },
  { key: 'utilization', header: 'Utilization' },
  { key: 'status', header: 'Status' },
];

export const locationFilterOptions = [
  'All',
  '<50% full',
  '50-80% full',
  '>80% full',
  'Expired',
  'Near-Expiry',
];

export const locationData: LocationItem[] = [
  {
    id: '1',
    locationCode: 'A1',
    name: 'Shelf A1',
    type: 'Shelf',
    maxCapacity: '500',
    currentQuantity: 420,
    utilization: 80,
    status: 'Active',
    notes: 'Top-shelf, eye level',
    items: [
      {
        batch: 'A12345',
        drug: 'Amoxicillin 500 mg',
        qty: 200,
        expiryDate: '2025-12-15',
      },
      {
        batch: 'A12345',
        drug: 'Amoxicillin 500 mg',
        qty: 230,
        expiryDate: '2025-12-15',
      },
      {
        batch: 'A12345',
        drug: 'Amoxicillin 500 mg',
        qty: 230,
        expiryDate: '2025-12-15',
      },
    ],
  },
  {
    id: '2',
    locationCode: 'B3',
    name: 'Fridge 1',
    type: 'Fridge',
    maxCapacity: '200',
    currentQuantity: 180,
    utilization: 90,
    status: 'Full',
    notes: 'Keep between 2-8°C',
    items: [
      {
        batch: 'C9876',
        drug: 'Insulin 10 ml',
        qty: 50,
        expiryDate: '2025-08-01',
      },
    ],
  },
  {
    id: '3',
    locationCode: 'C2',
    name: 'Shelf C2',
    type: 'Shelf',
    maxCapacity: '500',
    currentQuantity: 400,
    utilization: 80,
    status: 'Near Full',
  },
  {
    id: '4',
    locationCode: 'D1',
    name: 'Room D1',
    type: 'Room',
    maxCapacity: '1000',
    currentQuantity: 300,
    utilization: 30,
    status: 'Active',
  },
];

export const locationCustomFilter = (
  row: LocationItem,
  activeFilter: string,
  typeFilter?: string,
  statusFilter?: string,
) => {
  // Utilization filters
  if (activeFilter === '<50% full' && !(row.utilization < 50)) return false;
  if (
    activeFilter === '50-80% full' &&
    !(row.utilization >= 50 && row.utilization < 80)
  )
    return false;
  if (activeFilter === '>80% full' && !(row.utilization >= 80)) return false;
  // For demo, Expired/Near-Expiry are no-ops

  // Type filter
  if (typeFilter && typeFilter !== 'All Types' && row.type !== typeFilter)
    return false;
  // Status filter
  if (
    statusFilter &&
    statusFilter !== 'All Status' &&
    row.status !== statusFilter
  )
    return false;
  return true;
};
