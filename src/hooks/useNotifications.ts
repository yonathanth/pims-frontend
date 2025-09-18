import { useEffect, useState, useCallback } from 'react';
import {
  listNotifications,
  getNotificationCounts,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../api/notifications';
import type {
  ListNotificationsQuery,
  NotificationCountsResponse,
} from '../types/notification';

// Local interface that matches the UI expectations
interface NotificationItem {
  id: number;
  type?: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  created: string;
  read?: boolean;
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export function useNotifications(query: ListNotificationsQuery = {}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [counts, setCounts] = useState<NotificationCountsResponse | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(
    async (queryParams: ListNotificationsQuery = {}) => {
      setLoading(true);
      try {
        // Ensure we only use valid backend parameters
        const cleanQuery: ListNotificationsQuery = {
          page: queryParams.page || 1,
          limit: queryParams.limit || 20,
        };

        // Only add optional parameters if they exist
        if (queryParams.type) cleanQuery.type = queryParams.type;
        if (queryParams.severity) cleanQuery.severity = queryParams.severity;
        if (queryParams.isRead !== undefined)
          cleanQuery.isRead = queryParams.isRead;

        const result = await listNotifications(cleanQuery);

        // Debug: Log the actual response
        console.log('API Response:', result);

        // Check if result has the expected structure
        if (!result || !result.data) {
          console.error('Unexpected API response structure:', result);
          setNotifications([]);
          setPagination(null);
          setError('Invalid API response structure');
          return;
        }

        // Map backend response to expected format
        const mapped: NotificationItem[] = result.data.map((notification) => ({
          id: notification.id,
          type: notification.notificationType || undefined,
          message: notification.message,
          severity: mapSeverity(notification.severity),
          created: notification.createdAt,
          read: notification.isRead || false,
        }));

        setNotifications(mapped);
        setPagination(result.meta);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setError('Failed to fetch notifications');
        setNotifications([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchCounts = useCallback(async () => {
    try {
      const result = await getNotificationCounts();
      setCounts(result);
    } catch (error) {
      console.error('Failed to fetch notification counts:', error);
    }
  }, []);

  const markAsRead = useCallback(
    async (id: number) => {
      try {
        await markNotificationAsRead(id);
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
        // Refresh counts
        await fetchCounts();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        throw error;
      }
    },
    [fetchCounts],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      // Refresh counts
      await fetchCounts();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }, [fetchCounts]);

  // Helper function to map backend severity to UI severity
  const mapSeverity = (severity: string): 'info' | 'warning' | 'error' => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
      default:
        return 'info';
    }
  };

  useEffect(() => {
    fetchNotifications(query);
    fetchCounts();
  }, [fetchNotifications, fetchCounts, JSON.stringify(query)]);

  return {
    notifications,
    counts,
    pagination,
    loading,
    error,
    refetch: () => fetchNotifications(query),
    markAsRead,
    markAllAsRead,
  };
}
