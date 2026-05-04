import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  primary: string;
  primaryContainer: string;
  secondary: string;
  secondaryContainer: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  card: string;
  cardBorder: string;
  input: string;
  inputBorder: string;
  button: string;
  buttonText: string;
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  chatBubbleUser: string;
  chatBubbleAI: string;
  chatTextUser: string;
  chatTextAI: string;
}

export const themes: Record<Theme, ThemeColors> = {
  dark: {
    background: '#0a0f1e',
    surface: '#111827',
    surfaceVariant: '#1f2937',
    primary: '#3b82f6',
    primaryContainer: '#1e3a5f',
    secondary: '#10b981',
    secondaryContainer: '#064e3b',
    text: '#f9fafb',
    textSecondary: '#e5e7eb',
    textMuted: '#9ca3af',
    border: '#374151',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
    card: '#1f2937',
    cardBorder: '#374151',
    input: '#1f2937',
    inputBorder: '#4b5563',
    button: '#3b82f6',
    buttonText: '#ffffff',
    tabBar: '#111827',
    tabBarActive: '#3b82f6',
    tabBarInactive: '#6b7280',
    chatBubbleUser: '#3b82f6',
    chatBubbleAI: '#1f2937',
    chatTextUser: '#ffffff',
    chatTextAI: '#f9fafb',
  },
  light: {
    background: '#f3f4f6',
    surface: '#ffffff',
    surfaceVariant: '#f9fafb',
    primary: '#2563eb',
    primaryContainer: '#dbeafe',
    secondary: '#059669',
    secondaryContainer: '#d1fae5',
    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    error: '#dc2626',
    success: '#059669',
    warning: '#d97706',
    info: '#2563eb',
    card: '#ffffff',
    cardBorder: '#e5e7eb',
    input: '#ffffff',
    inputBorder: '#d1d5db',
    button: '#2563eb',
    buttonText: '#ffffff',
    tabBar: '#ffffff',
    tabBarActive: '#2563eb',
    tabBarInactive: '#9ca3af',
    chatBubbleUser: '#2563eb',
    chatBubbleAI: '#f3f4f6',
    chatTextUser: '#ffffff',
    chatTextAI: '#111827',
  },
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): React.ReactElement {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
      }
    };
    loadTheme();
  }, []);

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  const colors = themes[theme];
  const isDark = theme === 'dark';

  const value = { theme, colors, isDark, toggleTheme, setTheme };

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
