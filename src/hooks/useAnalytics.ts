import { useEffect, useState } from 'react';
import { getAnalytics, type AnalyticsResponseDto, type AnalyticsQuery } from '../api/analytics';

export function useAnalytics(query: AnalyticsQuery = {}) {
  const [data, setData] = useState<AnalyticsResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const analytics = await getAnalytics(query);
        if (mounted) {
          setData(analytics);
        }
      } catch (e: any) {
        if (mounted) {
          setError(e.message || 'Failed to load analytics');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, [
    query.timeFilter,
    query.startIso,
    query.endIso,
    query.dateIso,
    query.rangeDays,
    query.topPerformersSort,
    query.topPerformersOrder,
    query.topSuppliersSort,
    query.topSuppliersOrder,
  ]);

  return { data, loading, error };
}
