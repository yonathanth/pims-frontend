// Supplier-related types for Tauri v2 backend integration
export type SupplierDto = {
  supplierId: number;
  name: string;
  contactName?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
};

export type CreateSupplierInput = {
  name: string;
  contact_name?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
};

export type UpdateSupplierInput = CreateSupplierInput;

export type ListSuppliersQuery = {
  q?: string; // search by name or phone
  sort_by?: "name" | "phone";
  descending?: boolean;
  limit?: number;
  offset?: number;
};
