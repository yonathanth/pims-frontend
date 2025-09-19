import { httpClient } from './tauriClient';
import type {
  NotificationDto,
  CreateNotificationInput,
  ListNotificationsQuery,
  PaginatedNotificationsResponse,
  NotificationCountsResponse,
} from '../types/notification';

export async function listNotifications(
  query: ListNotificationsQuery = {},
): Promise<PaginatedNotificationsResponse> {
  const params: Record<string, any> = {};
  if (query.page) params.page = query.page;
  if (query.limit) params.limit = query.limit;
  if (query.type) params.type = query.type;
  if (query.severity) params.severity = query.severity;
  if (query.isRead !== undefined) params.isRead = query.isRead;

  // Diagnostic: log outgoing params
  console.log('[api/notifications] GET /notifications params:', params);

  const response = await httpClient.get<PaginatedNotificationsResponse>(
    `/notifications`,
    params,
  );
  // Normalize: ensure { data, meta }
  if ((response as any)?.data && (response as any)?.meta)
    return response as any;
  if (Array.isArray(response)) {
    return {
      data: response as any,
      meta: {
        page: 1,
        limit: response.length,
        totalItems: response.length,
        totalPages: 1,
      },
    };
  }
  return response as any;
}

export async function getNotificationCounts(): Promise<NotificationCountsResponse> {
  const response = await httpClient.get('/notifications/counts');
  return (response as any).data ?? (response as any);
}

export async function getNotification(id: number): Promise<NotificationDto> {
  const response = await httpClient.get(`/notifications/${id}`);
  return (response as any).data ?? (response as any);
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<NotificationDto> {
  const response = await httpClient.post('/notifications', input);
  return (response as any).data ?? (response as any);
}

export async function markNotificationAsRead(
  id: number,
): Promise<NotificationDto> {
  const response = await httpClient.patch(`/notifications/${id}/read`);
  return (response as any).data ?? (response as any);
}

export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  const response = await httpClient.patch('/notifications/mark-all-read');
  return (response as any).data ?? (response as any);
}
