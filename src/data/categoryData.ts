export type CategoryItem = {
  id: string;
  name: string;
  description: string; // truncated for table cell
  fullDescription: string; // full content for expanded row
  productsCount: number;
};

export const categoryHeaders = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'description', header: 'Description' },
  { key: 'productsCount', header: 'Number of Products' },
  { key: 'actions', header: 'Actions' },
];

export const categoryFilterOptions = [
  'All',
  'Anti-biotic',
  'Anti-viral',
  'Pain Relief',
];

const truncate = (text: string, max = 120) =>
  text.length > max ? text.slice(0, max).trimEnd() + '…' : text;

const descriptions = {
  antibiotic:
    'This category includes medications used to relieve mild to severe pain, such as headaches, muscle aches, joint pain, and menstrual cramps.',
  antiviral:
    'Medications used to treat viral infections by inhibiting the development of the pathogen rather than killing it outright.',
  painRelief:
    'Drugs designed to reduce pain. They range from nonsteroidal anti-inflammatory drugs (NSAIDs) to opioids depending on severity and clinical guidance.',
};

export const categoryData: CategoryItem[] = [
  {
    id: '1',
    name: 'Anti-biotic',
    fullDescription: descriptions.antibiotic,
    description: truncate(descriptions.antibiotic),
    productsCount: 500,
  },
  {
    id: '2',
    name: 'Anti-viral',
    fullDescription: descriptions.antiviral,
    description: truncate(descriptions.antiviral),
    productsCount: 600,
  },
  {
    id: '3',
    name: 'Pain Relief',
    fullDescription: descriptions.painRelief,
    description: truncate(descriptions.painRelief),
    productsCount: 420,
  },
  {
    id: '4',
    name: 'Anti-biotic',
    fullDescription: descriptions.antibiotic,
    description: truncate(descriptions.antibiotic),
    productsCount: 300,
  },
];

export const categoryCustomFilter = (
  row: CategoryItem,
  activeFilter: string,
) => {
  if (activeFilter === 'All') return true;
  return row.name === activeFilter;
};
