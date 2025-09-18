import { useState, useEffect } from 'react';
import { getLocationsForSelection } from '../api/locations';

export interface LocationOption {
  id: number;
  text: string;
  value: number;
  type: string;
}

export function useLocationsSelection() {
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await getLocationsForSelection();

        const locationOptions: LocationOption[] = response.map(
          (location: any) => ({
            id: location.id,
            text: `${location.name} (${location.locationType})`,
            value: location.id,
            type: location.locationType,
          }),
        );

        setLocations(locationOptions);
        setError(null);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch locations');
        setLocations([]);
        console.error('Failed to fetch locations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return { locations, loading, error };
}



