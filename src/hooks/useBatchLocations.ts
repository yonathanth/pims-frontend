import { useState, useCallback } from 'react';
import { getLocationsByBatch } from '../api/locations';

export function useBatchLocations() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // throwOnError lets callers tell "no locations" apart from "failed to load"
  const fetchLocationsByBatch = useCallback(
    async (batchId: number, { throwOnError = false } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getLocationsByBatch(batchId);

        // The /locations/batch/:batchId endpoint returns raw Location[] array
        const locations = Array.isArray(result)
          ? result
          : (result as any).data || [];

        setLocations(locations);
        return locations;
      } catch (err: any) {
        setError(
          `Failed to fetch locations: ${err?.message || 'Unknown error'}`,
        );
        setLocations([]);
        if (throwOnError) throw err;
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    locations,
    loading,
    error,
    fetchLocationsByBatch,
  };
}
