import { useCallback, useEffect, useMemo, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'theme';

const canUseDOM = () => typeof window !== 'undefined' && typeof document !== 'undefined';

export const getStoredTheme = (): Theme => {
  if (!canUseDOM()) return 'dark';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'light' ? 'light' : 'dark';
};

export const applyTheme = (theme: Theme) => {
  if (!canUseDOM()) return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, toggleTheme]);
}

