import { httpClient } from './tauriClient';
import type { ListDrugsQuery, ListCategoriesQuery } from '../types/product';

// Helpers to map legacy query shapes to backend
function mapDrugsQuery(query: ListDrugsQuery = {}) {
  const params: Record<string, any> = {};
  if (query.q) params.search = query.q;
  if (query.limit) params.limit = query.limit;
  if (query.offset !== undefined) {
    const limit = query.limit ?? 50;
    params.page = Math.floor((query.offset as number) / limit) + 1;
  }
  if ((query as any).category_id || (query as any).categoryId) {
    params.categoryId = (query as any).categoryId ?? (query as any).category_id;
  }
  if (query.sort_by) {
    const map: any = {
      sku: 'sku',
      generic_name: 'genericName',
      trade_name: 'tradeName',
    };
    params.sortBy = map[query.sort_by] ?? 'genericName';
  }
  if (query.descending !== undefined)
    params.sortDir = query.descending ? 'desc' : 'asc';
  return params;
}

function mapCategoriesQuery(query: ListCategoriesQuery = {}) {
  const params: Record<string, any> = {};
  if (query.q) params.search = query.q;
  if (query.limit) params.limit = query.limit;
  if ((query as any).page) params.page = (query as any).page;
  if (query.offset !== undefined) {
    const limit = query.limit ?? 50;
    params.page = Math.floor((query.offset as number) / limit) + 1;
  }
  params.sortBy = (query as any).sortBy ?? 'name';
  if ((query as any).sortDir) params.sortDir = (query as any).sortDir;
  if (query.descending !== undefined)
    params.sortDir = query.descending ? 'desc' : 'asc';
  return params;
}

// Drug API (backend-aligned)
export const listDrugs = async (query: ListDrugsQuery = {}) => {
  const params = mapDrugsQuery(query);
  const res = await httpClient.get<{
    data: any[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }>('/drugs', params);
  return res;
};

export const createDrug = async (input: any) => {
  const payload = {
    sku: input.sku || undefined,
    genericName: input.generic_name ?? input.genericName,
    tradeName: (input.trade_name ?? input.tradeName) || undefined,
    strength: input.strength,
    description: input.description || undefined,
    categoryId: input.category_id ?? input.categoryId,
  };
  return httpClient.post('/drugs', payload);
};

export const updateDrug = async (id: number, input: any) => {
  const payload = {
    sku: input.sku || undefined,
    genericName: input.generic_name ?? input.genericName,
    tradeName: (input.trade_name ?? input.tradeName) || undefined,
    strength: input.strength,
    description: input.description || undefined,
    categoryId: input.category_id ?? input.categoryId,
  };
  return httpClient.patch(`/drugs/${id}`, payload);
};

export const deleteDrug = async (id: number) => {
  return httpClient.delete(`/drugs/${id}`);
};

// Category API (backend-aligned)
export const listCategories = async (query: ListCategoriesQuery = {}) => {
  const params = mapCategoriesQuery(query);
  const res = await httpClient.get<{
    data: any[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }>('/categories', params);
  const data = res.data.map((c: any) => ({
    id: String(c.id),
    name: c.name,
    description: c.description,
    drugCount: c.drugCount,
  }));
  return { data, meta: (res as any).meta };
};

export const createCategory = async (input: any) => {
  const payload = { name: input.name, description: input.description };
  return httpClient.post('/categories', payload);
};

export const updateCategory = async (id: number, input: any) => {
  const payload = { name: input.name, description: input.description };
  return httpClient.patch(`/categories/${id}`, payload);
};

export const deleteCategory = async (id: number) => {
  return httpClient.delete(`/categories/${id}`);
};
