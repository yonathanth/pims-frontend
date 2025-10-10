import { useCallback, useEffect, useState } from 'react';
import {
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  listBatchesInLocation,
  locationsSummary,
} from '../api/locations';
import type {
  CreateLocationInput,
  UpdateLocationInput,
  LocationBatchViewDto,
  LocationsSummaryDto,
  ListLocationsQuery,
} from '../types/location';

export interface LocationRow {
  id: string;
  name: string;
  type: string;
  maxCapacity: string | null;
  currentQuantity: number;
  utilization: number; // integer percent for table
  status: string; // derived status label
  description?: string;
  batches?: LocationBatchViewDto[]; // loaded on expand
}

function deriveStatus(util: number): string {
  if (util >= 100) return 'Full';
  if (util >= 80) return 'Near Full';
  return 'Active';
}

export function useLocations(initialQuery: ListLocationsQuery = {}) {
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<LocationsSummaryDto | null>(null);
  const [query, setQuery] = useState<ListLocationsQuery>(initialQuery);
  const [loadingBatches, setLoadingBatches] = useState<Record<string, boolean>>(
    {},
  );

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listLocations(query);
      const mapped: LocationRow[] = (rows as any).map((r: any) => {
        const loc: any = r.location;
        const id = loc.locationId ?? loc.location_id;
        const util = Math.round(r.utilization_percent);
        return {
          id: String(id),
          name: loc.name,
          type: loc.locationType ?? loc.location_type,
          maxCapacity: loc.maxCapacity ?? loc.max_capacity ?? null,
          currentQuantity: loc.currentQty ?? loc.current_qty ?? 0,
          utilization: util,
          status: deriveStatus(util),
          description: loc.description ?? undefined,
        };
      });
      setLocations(mapped);
      setError(null);
    } catch (e) {
      setError('Failed to fetch locations');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const fetchSummary = useCallback(async () => {
    try {
      const s = await locationsSummary();
      setSummary(s);
    } catch (e) {
      // ignore summary errors separately
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const refetch = () => {
    fetchLocations();
    fetchSummary();
  };

  const addLocation = async (
    input: Omit<CreateLocationInput, 'current_qty'> & { current_qty?: number },
  ) => {
    const created = await createLocation({ current_qty: 0, ...input });
    const util = (created as any).maxCapacity
      ? Math.round(
          ((created as any).currentQty /
            parseFloat((created as any).maxCapacity)) *
            100,
        )
      : 0;
    setLocations((prev) => [
      {
        id: String((created as any).locationId ?? (created as any).location_id),
        name: (created as any).name,
        type: (created as any).locationType ?? (created as any).location_type,
        maxCapacity:
          (created as any).maxCapacity ?? (created as any).max_capacity ?? null,
        currentQuantity:
          (created as any).currentQty ?? (created as any).current_qty ?? 0,
        utilization: util,
        status: deriveStatus(util),
        description: (created as any).description ?? undefined,
      },
      ...prev,
    ]);
    fetchSummary();
  };

  const editLocation = async (id: string, input: UpdateLocationInput) => {
    const updated = await updateLocation(Number(id), input);
    const maxCap =
      (updated as any).maxCapacity ?? (updated as any).max_capacity ?? null;
    const curr =
      (updated as any).currentQty ?? (updated as any).current_qty ?? 0;
    const util = maxCap ? Math.round((curr / maxCap) * 100) : 0;
    setLocations((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              name: (updated as any).name,
              type:
                (updated as any).locationType ?? (updated as any).location_type,
              maxCapacity: maxCap,
              currentQuantity: curr,
              utilization: util,
              status: deriveStatus(util),
              description: (updated as any).description ?? undefined,
            }
          : l,
      ),
    );
    fetchSummary();
  };

  const removeLocation = async (id: string) => {
    await deleteLocation(Number(id));
    setLocations((prev) => prev.filter((l) => l.id !== id));
    fetchSummary();
  };

  const loadBatches = async (id: string) => {
    setLoadingBatches((prev) => ({ ...prev, [id]: true }));
    try {
      const batches = await listBatchesInLocation(Number(id));
      setLocations((prev) =>
        prev.map((l) => (l.id === id ? { ...l, batches } : l)),
      );
    } finally {
      setLoadingBatches((prev) => ({ ...prev, [id]: false }));
    }
  };

  return {
    locations,
    loading,
    error,
    summary,
    query,
    setQuery,
    refetch,
    addLocation,
    editLocation,
    removeLocation,
    loadBatches,
    loadingBatches,
  };
}
