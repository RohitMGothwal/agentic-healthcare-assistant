import { useEffect } from 'react';

// Try to import expo-notifications, fallback to null if not available
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.warn('expo-notifications not available');
}

export function useNotifications() {
  useEffect(() => {
    if (!Notifications) return;
    
    async function requestPermissions() {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Push notification permissions not granted');
        }
      } catch (e) {
        console.warn('Failed to request notification permissions:', e);
      }
    }
    requestPermissions();
  }, []);
}
