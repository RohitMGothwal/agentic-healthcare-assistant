import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api/client';

type User = { username: string; email?: string };

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stored auth on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync(USER_KEY);
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
    setError(null);
    try {
      const response = await authApi.login(username, password);
      await SecureStore.setItemAsync(TOKEN_KEY, response.access_token);
      const userData: User = { username };
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
      throw err;
    }
  }, []);

  const register = useCallback(async (username: string, password: string, email?: string) => {
    setError(null);
    try {
      await authApi.register(username, password, email);
      // Auto-login after registration
      await login(username, password);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
      throw err;
    }
  }, [login]);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, register, logout, isAuthenticated: !!user, isLoading, error }),
    [user, login, register, logout, isLoading, error],
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
