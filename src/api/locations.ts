import { httpClient } from './tauriClient';
import type {
  CreateLocationInput,
  UpdateLocationInput,
  LocationBatchViewDto,
  LocationsSummaryDto,
} from '../types/location';

function mapLocationsQuery(query: any = {}) {
  const params: Record<string, any> = {};
  if (query.search) params.search = query.search;
  if (query.q) params.search = query.q; // Support legacy
  if (query.limit) params.limit = query.limit;
  if (query.page) params.page = query.page;
  if (query.offset !== undefined) {
    const limit = query.limit ?? 50;
    params.page = Math.floor((query.offset as number) / limit) + 1;
  }
  if (query.sortBy) params.sortBy = query.sortBy;
  if (query.sort_by) params.sortBy = query.sort_by; // Support legacy
  if (query.sortDir) params.sortDir = query.sortDir;
  if (query.descending !== undefined)
    params.sortDir = query.descending ? 'desc' : 'asc';
  if (query.locationType) params.locationType = query.locationType;
  return params;
}

export const listLocations = async (query: any = {}) => {
  const res = await httpClient.get<{ data: any[]; meta: any }>(
    '/locations',
    mapLocationsQuery(query),
  );
  return res;
};

export const createLocation = (input: CreateLocationInput) => {
  return httpClient.post('/locations', {
    name: (input as any).name,
    description: (input as any).description,
    maxCapacity: (input as any).max_capacity ?? (input as any).maxCapacity,
    locationType: (input as any).location_type ?? (input as any).locationType,
  });
};

export const updateLocation = (id: number, input: UpdateLocationInput) => {
  return httpClient.patch(`/locations/${id}`, {
    name: (input as any).name,
    description: (input as any).description,
    maxCapacity: (input as any).max_capacity ?? (input as any).maxCapacity,
    locationType: (input as any).location_type ?? (input as any).locationType,
  });
};

export const deleteLocation = (id: number) => {
  return httpClient.delete(`/locations/${id}`);
};

export const listBatchesInLocation = (location_id: number) =>
  httpClient.get<LocationBatchViewDto[]>(`/locations/${location_id}/batches`);

export const locationsSummary = () =>
  httpClient.get<LocationsSummaryDto>('/locations/summary');

export const getLocationsByBatch = async (batchId: number) => {
  return await httpClient.get(`/locations/batch/${batchId}`);
};

// Get all locations for dropdown selection (simplified, no pagination)
export const getLocationsForSelection = async () => {
  const res = await httpClient.get<{ data: any[]; meta: any }>('/locations', {
    limit: 1000, // Get all locations for selection
  });
  return res.data || [];
};
