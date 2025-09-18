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
  const params = new URLSearchParams();

  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.type) params.append('type', query.type);
  if (query.severity) params.append('severity', query.severity);
  if (query.isRead !== undefined)
    params.append('isRead', query.isRead.toString());

  console.log('Making API call to:', `/notifications?${params.toString()}`);
  const response = await httpClient.get(`/notifications?${params.toString()}`);
  console.log('Raw API response:', response);
  return response;
}

export async function getNotificationCounts(): Promise<NotificationCountsResponse> {
  const response = await httpClient.get('/notifications/counts');
  return response.data;
}

export async function getNotification(id: number): Promise<NotificationDto> {
  const response = await httpClient.get(`/notifications/${id}`);
  return response.data;
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<NotificationDto> {
  const response = await httpClient.post('/notifications', input);
  return response.data;
}

export async function markNotificationAsRead(
  id: number,
): Promise<NotificationDto> {
  const response = await httpClient.patch(`/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  const response = await httpClient.patch('/notifications/mark-all-read');
  return response.data;
}
