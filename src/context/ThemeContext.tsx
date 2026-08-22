import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserSettings } from '../api/settings';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  applyTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>('system');

  const applyTheme = (next: Theme) => {
    setTheme(next);
    document.documentElement.dataset.theme = resolveTheme(next);
  };

  // Load the persisted preference once a session exists.
  useEffect(() => {
    if (!user) return;
    fetchUserSettings()
      .then((settings) => applyTheme(settings.theme))
      .catch(() => {
        /* ignore — falls back to 'system' */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Keep the resolved theme in sync with OS changes while 'system' is selected.
  useEffect(() => {
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      document.documentElement.dataset.theme = resolveTheme('system');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, applyTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
