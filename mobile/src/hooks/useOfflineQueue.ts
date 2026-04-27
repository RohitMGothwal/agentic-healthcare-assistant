import { useEffect, useState, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

type QueuedAction = {
  id: string;
  type: 'chat' | 'appointment' | 'health_metric';
  data: any;
  timestamp: number;
};

const QUEUE_KEY = 'offline_queue';

export function useOfflineQueue() {
  const [isConnected, setIsConnected] = useState(true);
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load queue from storage on mount
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const stored = await AsyncStorage.getItem(QUEUE_KEY);
        if (stored) {
          setQueue(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load offline queue:', e);
      }
    };
    loadQueue();
  }, []);

  // Monitor connection status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
    });

    return unsubscribe;
  }, []);

  // Add action to queue
  const addToQueue = useCallback(async (action: Omit<QueuedAction, 'id' | 'timestamp'>) => {
    const newAction: QueuedAction = {
      ...action,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    const updatedQueue = [...queue, newAction];
    setQueue(updatedQueue);
    
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
    } catch (e) {
      console.error('Failed to save offline queue:', e);
    }
    
    return newAction.id;
  }, [queue]);

  // Remove action from queue
  const removeFromQueue = useCallback(async (id: string) => {
    const updatedQueue = queue.filter(item => item.id !== id);
    setQueue(updatedQueue);
    
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
    } catch (e) {
      console.error('Failed to update offline queue:', e);
    }
  }, [queue]);

  // Clear entire queue
  const clearQueue = useCallback(async () => {
    setQueue([]);
    try {
      await AsyncStorage.removeItem(QUEUE_KEY);
    } catch (e) {
      console.error('Failed to clear offline queue:', e);
    }
  }, []);

  // Get queue length
  const queueLength = queue.length;

  return { 
    isConnected, 
    queue, 
    queueLength, 
    isProcessing,
    setIsProcessing,
    addToQueue, 
    removeFromQueue, 
    clearQueue 
  };
}
