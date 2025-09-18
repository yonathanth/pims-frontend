export interface EmployeeItem {
  id: string;
  name: string;
  username: string;
  role: string;
  email: string;
  actions?: string;
}

export const employeeHeaders = [
  { key: "name", header: "Name" },
  { key: "username", header: "Username" },
  { key: "role", header: "Role" },
  { key: "email", header: "Email" },
  { key: "actions", header: "" }
];

export const employeeFilterOptions = [
  "All Roles",
  "Pharmacist",
  "Manager",
  "Assistant"
];

export const employeeCustomFilter = (item: EmployeeItem, filterValue: string) => {
  if (!filterValue || filterValue === "All Roles") return true;
  return item.role === filterValue;
};
