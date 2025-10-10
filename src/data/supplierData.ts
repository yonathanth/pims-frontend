// Example data for suppliers that can be used with SortableTable
export interface SupplierItem {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  action?: string;
  [key: string]: any; // Index signature to be compatible with TableRow
}

// Base supplier data
const baseSupplierRows: Omit<SupplierItem, 'id'>[] = [
  {
    name: 'Berchume Dube Belachew',
    contactName: 'Alchalushem bekele',
    phone: '0987654321',
    email: 'bedube@gmail.com',
    address: 'Kality, woredas 02',
  },
  {
    name: 'Pharma Solutions Ltd',
    contactName: 'John Smith',
    phone: '0911234567',
    email: 'john@pharmasol.com',
    address: 'Bole, Addis Ababa',
  },
  {
    name: 'Medical Supply Co',
    contactName: 'Sarah Johnson',
    phone: '0923456789',
    email: 'sarah@medsupply.com',
    address: 'Piassa, Addis Ababa',
  },
  {
    name: 'Healthcare Partners',
    contactName: 'Mike Brown',
    phone: '0934567890',
    email: 'mike@healthcare.com',
    address: 'Merkato, Addis Ababa',
  },
];

// Generate supplier data
export const supplierData: SupplierItem[] = Array.from(
  { length: 100 },
  (_, i) => {
    const baseItem = baseSupplierRows[i % baseSupplierRows.length];
    return {
      ...baseItem,
      id: (i + 1).toString(),
      name: i < 4 ? baseItem.name : `${baseItem.name} ${i - 3}`,
      contactName:
        i < 4 ? baseItem.contactName : `${baseItem.contactName} ${i - 3}`,
    } as SupplierItem;
  },
);

// Table headers for suppliers
export const supplierHeaders = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'contactName', header: 'Contact Name' },
  { key: 'phone', header: 'Phone' },
  { key: 'email', header: 'Email' },
  { key: 'address', header: 'Address' },
  { key: 'actions', header: '' },
];

// Filter options for suppliers
export const supplierFilterOptions = ['All'];

// Custom filter function for suppliers
export const supplierCustomFilter = (
  _row: SupplierItem,
  activeFilter: string,
): boolean => {
  if (activeFilter === 'All') return true;
  return true;
};
