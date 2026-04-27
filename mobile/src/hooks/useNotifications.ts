import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export function useNotifications() {
  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Push notification permissions not granted');
      }
    }
    requestPermissions();
  }, []);
}
