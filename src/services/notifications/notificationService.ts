import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiConfig, endpoints } from '../../config/api';
import { apiRequest } from '../api/client';
import { tokenStore } from '../auth/tokenStore';
import { serviceConfig } from '../serviceConfig';

export type NotificationType = 'PAYMENT' | 'ORDER' | 'SECURITY' | 'PROMO' | 'SYSTEM';

export type GoldNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  dataJson?: string | null;
  read: boolean;
  createdAt?: string | null;
  readAt?: string | null;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function listNotifications(limit = 50): Promise<GoldNotification[]> {
  if (serviceConfig.useMock) return [];
  return apiRequest<GoldNotification[]>(`${endpoints.notifications.list}?limit=${limit}`);
}

export async function getUnreadNotificationCount(): Promise<number> {
  // Mock : 2 non lues (cf. INITIAL_NOTIFICATIONS de NotificationsScreen) pour
  // démontrer l'indicateur. Live : on respecte le compteur réel du backend.
  if (serviceConfig.useMock) return 2;
  const result = await apiRequest<{ count: number }>(endpoints.notifications.unreadCount);
  return result.count;
}

export async function markNotificationRead(id: string): Promise<GoldNotification> {
  return apiRequest<GoldNotification>(endpoints.notifications.read(id), { method: 'PATCH' });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiRequest<void>(endpoints.notifications.readAll, { method: 'PATCH' });
}

export async function createTestNotification(): Promise<GoldNotification> {
  return apiRequest<GoldNotification>(endpoints.notifications.test, {
    method: 'POST',
    body: JSON.stringify({
      title: 'Notification GoldApp',
      body: 'Ton centre de notifications est connecte en temps reel.',
      type: 'SYSTEM',
    }),
  });
}

export async function registerPushToken(): Promise<void> {
  if (serviceConfig.useMock || Platform.OS === 'web') return;

  const permission = await Notifications.getPermissionsAsync();
  const finalPermission = permission.granted
    ? permission
    : await Notifications.requestPermissionsAsync();
  if (!finalPermission.granted) return;

  const projectId =
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return;

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await apiRequest<void>(endpoints.notifications.deviceToken, {
    method: 'POST',
    body: JSON.stringify({ token, platform: Platform.OS }),
  });
}

export function openNotificationStream(onNotification: (notification: GoldNotification) => void) {
  if (serviceConfig.useMock || Platform.OS !== 'web' || typeof EventSource === 'undefined') {
    return () => {};
  }

  const token = tokenStore.get();
  if (!token) return () => {};

  const url = `${apiConfig.baseUrl}${endpoints.notifications.stream}?access_token=${encodeURIComponent(token)}`;
  const source = new EventSource(url);
  source.addEventListener('notification', (event) => {
    try {
      onNotification(JSON.parse(event.data) as GoldNotification);
    } catch {
      // Ignore malformed stream events.
    }
  });

  return () => source.close();
}
