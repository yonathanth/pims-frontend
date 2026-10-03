import { httpClient } from './tauriClient';
import type { ListSuppliersQuery } from '../types/supplier';

function mapSuppliersQuery(query: ListSuppliersQuery = {}) {
  const params: Record<string, any> = {};
  if (query.q) params.search = query.q;
  if (query.limit) params.limit = query.limit;
  if ((query as any).page) params.page = (query as any).page;
  else if (query.offset !== undefined) {
    const limit = query.limit ?? 50;
    params.page = Math.floor((query.offset as number) / limit) + 1;
  }
  if (query.sort_by) {
    const map: any = {
      name: 'name',
      phone: 'phone',
      contact_name: 'contactName',
    };
    params.sortBy = map[query.sort_by] ?? 'name';
  }
  if (query.descending !== undefined)
    params.sortDir = query.descending ? 'desc' : 'asc';
  return params;
}

export const listSuppliers = async (query: ListSuppliersQuery = {}) => {
  const res = await httpClient.get<{
    data: any[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }>('/suppliers', mapSuppliersQuery(query));
  return res;
};

export const createSupplier = (input: any) => {
  const payload = {
    name: input.name,
    contactName: input.contact_name ?? input.contactName,
    phone: input.phone,
    email: input.email,
    address: input.address,
  };
  return httpClient.post('/suppliers', payload);
};

export const updateSupplier = (id: number, input: any) => {
  const payload = {
    name: input.name,
    contactName: input.contact_name ?? input.contactName,
    phone: input.phone,
    email: input.email,
    address: input.address,
  };
  return httpClient.patch(`/suppliers/${id}`, payload);
};

export const deleteSupplier = (id: number) => {
  return httpClient.delete(`/suppliers/${id}`);
};

export const getSupplierOrders = async (
  supplierId: number,
  query: any = {},
) => {
  const params: Record<string, any> = {};
  if (query.limit) params.limit = query.limit;
  if (query.page) params.page = query.page;
  if (query.sort_by) params.sort_by = query.sort_by;
  if (query.descending !== undefined) params.descending = query.descending;
  if (query.status) params.status = query.status;

  const res = await httpClient.get<{
    data: any[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }>(`/suppliers/${supplierId}/orders`, params);
  return res;
};
