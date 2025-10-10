export interface EmployeeItem {
  id: string;
  name: string;
  username: string;
  role: string;
  email?: string;
  phoneNumber?: string;
  actions?: string;
}

export const employeeHeaders = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'username', header: 'Username' },
  { key: 'role', header: 'Role' },
  { key: 'email', header: 'Email' },
  { key: 'phoneNumber', header: 'Phone Number' },
  { key: 'actions', header: '' },
];

export const employeeFilterOptions = [
  'All Roles',
  'Pharmacist',
  'Manager',
  'Assistant',
];

export const employeeCustomFilter = (
  item: EmployeeItem,
  filterValue: string,
) => {
  if (!filterValue || filterValue === 'All Roles') return true;
  return item.role === filterValue;
};
