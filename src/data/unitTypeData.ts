export type UnitTypeItem = {
  id: string;
  name: string;
  description: string; // truncated for table cell
  fullDescription: string; // full content for expanded row
  batchCount: number;
  isActive: boolean;
};

export const unitTypeHeaders = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'description', header: 'Description' },
  { key: 'batchCount', header: 'Number of Batches' },
  { key: 'isActive', header: 'Status' },
  { key: 'actions', header: 'Actions' },
];

