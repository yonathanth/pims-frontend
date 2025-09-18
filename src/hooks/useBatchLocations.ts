import { useState, useCallback } from 'react';
import { getLocationsByBatch } from '../api/locations';

export function useBatchLocations() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocationsByBatch = useCallback(async (batchId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLocationsByBatch(batchId);

      // The /locations/batch/:batchId endpoint returns raw Location[] array
      const locations = Array.isArray(result) ? result : result.data || [];

      setLocations(locations);
      return locations;
    } catch (err: any) {
      setError(`Failed to fetch locations: ${err?.message || 'Unknown error'}`);
      setLocations([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    locations,
    loading,
    error,
    fetchLocationsByBatch,
  };
}
