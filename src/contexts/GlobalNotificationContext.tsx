import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import { useNotificationCounts } from '../hooks/useNotificationCounts';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../api/notifications';
import type { NotificationCountsResponse } from '../types/notification';

interface GlobalNotificationContextType {
  counts: NotificationCountsResponse | null;
  unreadCount: number;
  totalCount: number;
  loading: boolean;
  error: string | null;
  refreshCounts: () => void;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  forceRefresh: () => void;
}

const GlobalNotificationContext = createContext<
  GlobalNotificationContextType | undefined
>(undefined);

interface GlobalNotificationProviderProps {
  children: ReactNode;
}

export const GlobalNotificationProvider: React.FC<
  GlobalNotificationProviderProps
> = ({ children }) => {
  const { counts, unreadCount, totalCount, loading, error, refetch } =
    useNotificationCounts();
  const [localUnreadCount, setLocalUnreadCount] = useState<number>(unreadCount);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update local count when server count changes
  useEffect(() => {
    setLocalUnreadCount(unreadCount);
  }, [unreadCount]);

  // Set up automatic refresh every 30 seconds
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval for automatic refresh
    intervalRef.current = setInterval(() => {
      refetch();
    }, 1000); // 1 second

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetch]);

  // Refresh when page becomes visible (user switches back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

  const refreshCounts = useCallback(() => {
    refetch();
  }, [refetch]);

  const forceRefresh = useCallback(() => {
    console.log('Force refreshing notification counts...');
    refetch();
  }, [refetch]);

  const markAsRead = useCallback(
    async (id: number) => {
      try {
        // Call the API to mark as read
        await markNotificationAsRead(id);

        // Optimistically update the local count
        if (localUnreadCount > 0) {
          setLocalUnreadCount((prev) => Math.max(0, prev - 1));
        }

        // Refresh from server to get accurate count
        setTimeout(() => {
          refetch();
        }, 100);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        // Refresh counts to get accurate state
        refetch();
      }
    },
    [localUnreadCount, refetch],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      // Call the API to mark all as read
      await markAllNotificationsAsRead();

      // Optimistically update the local count to 0
      setLocalUnreadCount(0);

      // Refresh from server to get accurate count
      setTimeout(() => {
        refetch();
      }, 100);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Refresh counts to get accurate state
      refetch();
    }
  }, [refetch]);

  const contextValue: GlobalNotificationContextType = {
    counts,
    unreadCount: localUnreadCount, // Use local count for immediate updates
    totalCount,
    loading,
    error,
    refreshCounts,
    markAsRead,
    markAllAsRead,
    forceRefresh,
  };

  return (
    <GlobalNotificationContext.Provider value={contextValue}>
      {children}
    </GlobalNotificationContext.Provider>
  );
};

export const useGlobalNotifications = (): GlobalNotificationContextType => {
  const context = useContext(GlobalNotificationContext);
  if (!context) {
    throw new Error(
      'useGlobalNotifications must be used within a GlobalNotificationProvider',
    );
  }
  return context;
};

// Optional hook for components that might not have the provider
export const useGlobalNotificationsOptional =
  (): GlobalNotificationContextType | null => {
    const context = useContext(GlobalNotificationContext);
    return context || null;
  };
