export interface AuditLogItem {
  id: string;
  entityName: string;
  entityId: string;
  action: string;
  user: string;
  timestamp: string;
  details: {
    description: string;
    oldValue?: string;
    newValue?: string;
    ipAddress: string;
    userAgent: string;
  };
}

export const auditLogData: AuditLogItem[] = [
  {
    id: '1',
    entityName: 'Inventory',
    entityId: 'INV-123',
    action: 'CREATE',
    user: 'john.doe',
    timestamp: '2024-12-15 10:30:15',
    details: {
      description: 'Added new inventory item - Amoxicillin 500mg',
      newValue: 'Quantity: 100, Location: Shelf A1, Expiry: 2025-06-15',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  },
  {
    id: '2',
    entityName: 'Inventory',
    entityId: 'INV-124',
    action: 'UPDATE',
    user: 'jane.smith',
    timestamp: '2024-12-15 11:15:22',
    details: {
      description: 'Updated inventory quantity for Penicillin',
      oldValue: 'Quantity: 50',
      newValue: 'Quantity: 25',
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  },
  {
    id: '3',
    entityName: 'User',
    entityId: 'USR-045',
    action: 'LOGIN',
    user: 'admin',
    timestamp: '2024-12-15 08:45:33',
    details: {
      description: 'User logged into the system',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  },
  {
    id: '4',
    entityName: 'Product',
    entityId: 'PRD-789',
    action: 'DELETE',
    user: 'manager.user',
    timestamp: '2024-12-15 14:22:10',
    details: {
      description: 'Deleted expired product from inventory',
      oldValue: 'Aspirin 325mg - Expired 2024-01-15',
      ipAddress: '192.168.1.115',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  },
  {
    id: '5',
    entityName: 'Order',
    entityId: 'ORD-456',
    action: 'CREATE',
    user: 'pharmacist1',
    timestamp: '2024-12-15 16:30:45',
    details: {
      description: 'Created new purchase order for supplier',
      newValue: 'Order Total: ETB 2,500.00, Supplier: MedSupply Inc, Items: 15',
      ipAddress: '192.168.1.120',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  },
  {
    id: '6',
    entityName: 'User',
    entityId: 'USR-067',
    action: 'UPDATE',
    user: 'admin',
    timestamp: '2024-12-15 09:15:18',
    details: {
      description: 'Updated user permissions',
      oldValue: 'Role: Pharmacist',
      newValue: 'Role: Senior Pharmacist',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  },
];

export const auditLogHeaders = [
  { key: 'id', header: 'ID' },
  { key: 'entityName', header: 'Entity Name' },
  { key: 'entityId', header: 'Entity ID' },
  { key: 'action', header: 'Action' },
  { key: 'user', header: 'User' },
  { key: 'timestamp', header: 'Timestamp' },
];

export const auditLogFilterOptions = [
  'All Actions',
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
];

export const auditLogCustomFilter = (
  item: AuditLogItem,
  filterValue: string,
) => {
  if (!filterValue || filterValue === 'All Actions') return true;
  return item.action === filterValue;
};
