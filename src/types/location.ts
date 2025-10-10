// Location-related types for Tauri backend integration
export type LocationDto = {
  locationId: number; // backend: location_id
  name: string;
  description?: string | null;
  maxCapacity?: string | null; // backend: max_capacity
  currentQty: number; // backend: current_qty
  locationType: string; // backend: location_type
};

export type CreateLocationInput = {
  name: string;
  description?: string | null;
  max_capacity?: string | null;
  current_qty: number; // initial quantity (consider 0 default)
  location_type: string;
};

export type UpdateLocationInput = {
  name: string;
  description?: string | null;
  max_capacity?: string | null;
  current_qty: number;
  location_type: string;
};

export type LocationWithUtilDto = {
  location: LocationDto;
  utilization_percent: number; // 0-100 float
};

export type ListLocationsQuery = {
  q?: string;
  location_type?: string;
  status?: 'full' | 'near_full' | 'low' | 'exact_100' | 'gt_75' | 'lt_25';
  sort_by?: 'name' | 'current_qty' | 'max_qty';
  descending?: boolean;
  limit?: number;
  offset?: number;
};

export type LocationBatchViewDto = {
  batch_id: number;
  drug_name: string;
  sku: string;
  quantity: number;
  expiry_date: string; // ISO date
};

export type LocationsSummaryDto = {
  total_locations: number;
  total_capacity: number;
  used_capacity: number;
  average_utilization: number;
};
