import { useState, useEffect, useCallback } from 'react';
import { getNotificationCounts } from '../api/notifications';
import type { NotificationCountsResponse } from '../types/notification';

export function useNotificationCounts() {
  const [counts, setCounts] = useState<NotificationCountsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getNotificationCounts();
      setCounts(result);
    } catch (err) {
      console.error('Failed to fetch notification counts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch counts');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCounts = useCallback(() => {
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return {
    counts,
    unreadCount: counts?.unread || 0,
    totalCount: counts?.total || 0,
    loading,
    error,
    refetch: refreshCounts,
  };
}

