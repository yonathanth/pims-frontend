// Product/Drug-related types for Tauri v2 backend integration
export type DrugDto = {
  drugId: number;
  sku: string;
  genericName: string;
  tradeName?: string | null;
  strength: string;
  description: string;
  categoryId: number;
};

export type CreateDrugInput = {
  sku?: string;
  generic_name: string;
  trade_name?: string | null;
  strength: string;
  description: string;
  category_id: number;
};

export type UpdateDrugInput = {
  sku?: string;
  generic_name: string;
  trade_name?: string | null;
  strength: string;
  description: string;
  category_id: number;
};

export type CategoryDto = {
  categoryId: number;
  name: string;
  description?: string | null;
};

export type CreateCategoryInput = {
  name: string;
  description?: string | null;
};

export type UpdateCategoryInput = {
  name: string;
  description?: string | null;
};

export type CategoryWithTotalsDto = {
  category: CategoryDto;
  total_drugs: number;
};

export type ListDrugsQuery = {
  q?: string; // search by sku, generic_name, trade_name
  sort_by?: 'sku' | 'generic_name' | 'trade_name';
  descending?: boolean;
  limit?: number;
  offset?: number;
};

export type ListCategoriesQuery = {
  q?: string;
  sort_by?: 'name';
  descending?: boolean;
  limit?: number;
  offset?: number;
};
