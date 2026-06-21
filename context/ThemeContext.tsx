import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Color palettes ───────────────────────────────────────────────────────────

export const LightColors = {
  primary:       '#7C3AED',
  primaryDark:   '#4C1D95',
  primaryMid:    '#6D28D9',
  primaryLight:  '#8B5CF6',
  primarySoft:   '#EDE9FE',
  primaryBorder: '#C4B5FD',

  background:  '#F5F3FF',
  surface:     '#FFFFFF',
  surfaceAlt:  '#FAF9FF',

  textPrimary:   '#1A1033',
  textSecondary: '#6B7280',
  textMuted:     '#9CA3AF',
  textInverse:   '#FFFFFF',
  textLink:      '#7C3AED',

  success:     '#10B981',
  successSoft: '#D1FAE5',
  warning:     '#F59E0B',
  warningSoft: '#FEF3C7',
  error:       '#EF4444',
  errorSoft:   '#FEE2E2',
  info:        '#3B82F6',
  infoSoft:    '#DBEAFE',

  border:      '#E5E7EB',
  borderFocus: '#7C3AED',
  divider:     '#F3F4F6',

  tabActive:     '#7C3AED',
  tabInactive:   '#9CA3AF',
  tabBackground: '#FFFFFF',
};

export const DarkColors = {
  primary:       '#9B59B6',
  primaryDark:   '#6C3483',
  primaryMid:    '#8E44AD',
  primaryLight:  '#BB8FCE',
  primarySoft:   '#1E1033',
  primaryBorder: '#4A235A',

  background:  '#0F0A1E',
  surface:     '#1A1033',
  surfaceAlt:  '#231642',

  textPrimary:   '#F0EBFF',
  textSecondary: '#B8A9D0',
  textMuted:     '#6B7280',
  textInverse:   '#FFFFFF',
  textLink:      '#BB8FCE',

  success:     '#10B981',
  successSoft: '#0A3D2B',
  warning:     '#F59E0B',
  warningSoft: '#3D2A00',
  error:       '#EF4444',
  errorSoft:   '#3D0A0A',
  info:        '#3B82F6',
  infoSoft:    '#0A1F3D',

  border:      '#2D1B4E',
  borderFocus: '#9B59B6',
  divider:     '#1F1340',

  tabActive:     '#BB8FCE',
  tabInactive:   '#4A235A',
  tabBackground: '#1A1033',
};

export type AppColors = typeof LightColors;

// ─── Context ──────────────────────────────────────────────────────────────────

interface ThemeContextType {
  isDark: boolean;
  colors: AppColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: LightColors,
  toggleTheme: () => {},
});

const STORAGE_KEY = 'codemate_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? DarkColors : LightColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
