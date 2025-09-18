import { useCallback, useEffect, useState } from 'react';
import {
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../api/locations';
import type {
  CreateLocationInput,
  UpdateLocationInput,
} from '../types/location';

export interface LocationRow {
  id: string;
  name: string;
  type: string;
  maxCapacity: number | null;
  description?: string;
}

export function useLocationsTable() {
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'locationType' | 'maxCapacity'>(
    'name',
  );
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [locationType, setLocationType] = useState<string | undefined>(
    undefined,
  );
  const [totalItems, setTotalItems] = useState(0);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listLocations({
        search: q || undefined,
        limit,
        page,
        sortBy,
        sortDir,
        locationType,
      });

      const mapped: LocationRow[] = res.data.map((location: any) => ({
        id: String(location.id),
        name: location.name,
        type: location.locationType,
        maxCapacity: location.maxCapacity,
        description: location.description,
      }));

      setLocations(mapped);
      setTotalItems(res.meta.totalItems);
      setError(null);
    } catch (err) {
      setError('Failed to fetch locations');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [q, limit, page, sortBy, sortDir, locationType]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const addLocation = async (input: CreateLocationInput) => {
    try {
      await createLocation(input);
      setError(null);
      // Reset to first page and refresh data
      if (page !== 1) {
        setPage(1); // This will trigger useEffect to refetch
      } else {
        fetchLocations(); // If already on page 1, manually trigger refresh
      }
      return { ok: true } as const;
    } catch (e: any) {
      const message = e?.message || 'Failed to create location';
      setError(message);
      return { ok: false, message } as const;
    }
  };

  const editLocation = async (id: string, input: UpdateLocationInput) => {
    try {
      await updateLocation(Number(id), input);
      setError(null);
      // Refresh current data
      fetchLocations();
      return { ok: true } as const;
    } catch (e: any) {
      const message = e?.message || 'Failed to update location';
      setError(message);
      return { ok: false, message } as const;
    }
  };

  const removeLocation = async (id: string) => {
    try {
      await deleteLocation(Number(id));
      setError(null);
      // Refresh current data
      fetchLocations();
      return { ok: true } as const;
    } catch (e: any) {
      const message = e?.message || 'Failed to delete location';
      setError(message);
      return { ok: false, message } as const;
    }
  };

  const clearError = () => setError(null);

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations,
    // Server-driven controls
    page,
    setPage,
    limit,
    setLimit,
    q,
    setQ,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    locationType,
    setLocationType,
    totalItems,
    // CRUD operations
    addLocation,
    editLocation,
    removeLocation,
    clearError,
  };
}
