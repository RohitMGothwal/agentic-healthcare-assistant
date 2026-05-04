import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/client';

type User = { username: string; email?: string; is_admin?: boolean };

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Load stored auth on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load auth:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setErrorState(null);
    try {
      const response = await authApi.login(username, password);
      await AsyncStorage.setItem(TOKEN_KEY, response.access_token);
      const userData: User = { username };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (err: any) {
      setErrorState(err.response?.data?.detail || 'Login failed');
      throw err;
    }
  }, []);

  const register = useCallback(async (username: string, password: string, email?: string) => {
    setErrorState(null);
    try {
      await authApi.register(username, password, email);
      // Auto-login after registration
      await login(username, password);
    } catch (err: any) {
      setErrorState(err.response?.data?.detail || 'Registration failed');
      throw err;
    }
  }, [login]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const setError = useCallback((newError: string | null) => {
    setErrorState(newError);
  }, []);

  const value = useMemo(
    () => ({ user, login, register, logout, isAuthenticated: !!user, isLoading, error: errorState, setError }),
    [user, login, register, logout, isLoading, errorState, setError],
  );

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
