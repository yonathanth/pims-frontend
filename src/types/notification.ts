// Notification-related types for backend integration
export type NotificationDto = {
  id: number;
  userId?: number | null;
  notificationType: string;
  message: string;
  severity: string;
  isRead: boolean;
  readAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  entityName?: string;
  entityId?: number;
  user?: {
    id: number;
    username: string;
    fullName: string;
  };
};

export type CreateNotificationInput = {
  notificationType: string;
  message: string;
  severity: string;
  entityName?: string;
  entityId?: number;
  expiresAt?: string;
};

export type UpdateNotificationInput = {
  message?: string;
  severity?: string;
  isRead?: boolean;
};

export type ListNotificationsQuery = {
  page?: number;
  limit?: number;
  type?: 'out_of_stock' | 'low_stock' | 'expired' | 'near_expiry';
  severity?: 'high' | 'medium' | 'low';
  isRead?: boolean;
};

export type PaginatedNotificationsResponse = {
  data: NotificationDto[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

export type NotificationCountsResponse = {
  total: number;
  unread: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
};
