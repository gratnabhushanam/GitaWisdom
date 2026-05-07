import { authApiClient } from './client';

export const getNotifications = async () => {
  const response = await authApiClient.get('/api/notifications');
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await authApiClient.post('/api/notifications/read-all', {});
  return response.data;
};
