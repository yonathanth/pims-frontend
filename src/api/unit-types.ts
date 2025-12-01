import { httpClient } from './tauriClient';

export type UnitType = {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  batchCount?: number;
};

export type CreateUnitTypeInput = {
  name: string;
  description?: string;
  isActive?: boolean;
};

export type UpdateUnitTypeInput = Partial<CreateUnitTypeInput>;

export type ListUnitTypesQuery = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'batchCount' | 'id' | 'createdAt';
  sortDir?: 'asc' | 'desc';
};

export const listUnitTypes = async (query: ListUnitTypesQuery = {}) => {
  return httpClient.get<{ data: UnitType[]; meta: any }>('/unit-types', query);
};

export const getUnitType = async (id: number) => {
  return httpClient.get<UnitType>(`/unit-types/${id}`);
};

export const createUnitType = (input: CreateUnitTypeInput) => {
  return httpClient.post<UnitType>('/unit-types', input);
};

export const updateUnitType = (id: number, input: UpdateUnitTypeInput) => {
  return httpClient.patch<UnitType>(`/unit-types/${id}`, input);
};

export const deleteUnitType = (id: number) => {
  return httpClient.delete(`/unit-types/${id}`);
};

