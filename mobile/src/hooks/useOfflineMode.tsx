import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_MODE_KEY = 'offline_mode_enabled';

interface OfflineModeContextType {
  isOfflineMode: boolean;
  toggleOfflineMode: () => Promise<void>;
  setOfflineMode: (value: boolean) => Promise<void>;
}

const OfflineModeContext = createContext<OfflineModeContextType | undefined>(undefined);

export function OfflineModeProvider({ children }: { children: ReactNode }) {
  const [isOfflineMode, setIsOfflineModeState] = useState(false);

  // Load offline mode setting on mount
  useEffect(() => {
    const loadOfflineMode = async () => {
      try {
        const stored = await AsyncStorage.getItem(OFFLINE_MODE_KEY);
        if (stored !== null) {
          setIsOfflineModeState(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load offline mode setting:', e);
      }
    };
    loadOfflineMode();
  }, []);

  const setOfflineMode = useCallback(async (value: boolean) => {
    try {
      await AsyncStorage.setItem(OFFLINE_MODE_KEY, JSON.stringify(value));
      setIsOfflineModeState(value);
    } catch (e) {
      console.error('Failed to save offline mode setting:', e);
    }
  }, []);

  const toggleOfflineMode = useCallback(async () => {
    await setOfflineMode(!isOfflineMode);
  }, [isOfflineMode, setOfflineMode]);

  return (
    <OfflineModeContext.Provider value={{ isOfflineMode, toggleOfflineMode, setOfflineMode }}>
      {children}
    </OfflineModeContext.Provider>
  );
}

export function useOfflineMode() {
  const context = useContext(OfflineModeContext);
  if (!context) {
    throw new Error('useOfflineMode must be used within an OfflineModeProvider');
  }
  return context;
}
