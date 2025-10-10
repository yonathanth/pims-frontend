export interface ProductItem {
  id: string;
  name: string; // This will be the generic name
  sku: string;
  tradeName: string; // This will be the trade/brand name
  category: string; // resolved human-readable category name
  categoryId?: number; // underlying category id from backend
  strength: string;
  description?: string;
}

export const productData: ProductItem[] = [
  {
    id: '1',
    sku: 'PND-500-MB',
    name: 'Paracetamol', // Generic name
    tradeName: 'Panadol', // Trade name
    category: 'Antibiotic',
    strength: '500',
    description:
      'Paracetamol (Panadol) 500mg tablets are used for the relief of mild to moderate pain such as headaches, toothaches, menstrual cramps, and for reducing fever. Each tablet contains 500mg of paracetamol. Suitable for adults and children over 12 years. Do not exceed 4g (8 tablets) per day.',
  },
  {
    id: '2',
    sku: 'PEN-600-GM',
    name: 'Penicillin', // Generic name
    tradeName: 'German Brand', // Trade name
    category: 'Anti-viral',
    strength: '600',
  },
  {
    id: '3',
    sku: 'AMX-600-ET',
    name: 'Amoxicillin', // Generic name
    tradeName: 'Ethiopian Brand', // Trade name
    category: 'Anti-viral',
    strength: '600',
  },
  {
    id: '4',
    sku: 'AMX-600-MB',
    name: 'Amoxicillin', // Generic name
    tradeName: 'Mercedes Brand', // Trade name
    category: 'Anti-viral',
    strength: '600',
  },
  {
    id: '5',
    sku: 'AMX-600-EN',
    name: 'Amoxicillin', // Generic name
    tradeName: 'English Brand', // Trade name
    category: 'Anti-viral',
    strength: '600',
  },
  {
    id: '6',
    sku: 'AMX-600-GM',
    name: 'Amoxicillin', // Generic name
    tradeName: 'German Brand', // Trade name
    category: 'Anti-viral',
    strength: '600',
  },
];

export const productHeaders = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Generic Name' },
  { key: 'sku', header: 'SKU' },
  { key: 'tradeName', header: 'Trade Name' },
  { key: 'category', header: 'Category' },
  { key: 'strength', header: 'Strength (mg)' },
  { key: 'actions', header: '' },
];

export const productFilterOptions = [
  'All Categories',
  'Antibiotic',
  'Anti-viral',
  'Pain Relief',
];

export const productCustomFilter = (item: ProductItem, filterValue: string) => {
  if (!filterValue || filterValue === 'All Categories') return true;
  return item.category === filterValue;
};
