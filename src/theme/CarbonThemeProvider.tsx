import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Theme } from '@carbon/react';

// Supported theme names mapping to Carbon theme tokens
type ThemeToken = 'white' | 'g10' | 'g90' | 'g100';

const THEME_MAP: Record<string, ThemeToken> = {
  Light: 'white',
  Dark: 'g100', // Carbon dark theme token
};

export type AppTheme = 'Light' | 'Dark' | 'Auto';

type ThemeCtx = {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
};

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used inside CarbonThemeProvider');
  return ctx;
};

// Resolve theme when set to Auto using prefers-color-scheme
function useResolvedTheme(theme: AppTheme): ThemeToken {
  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (theme === 'Auto') {
    return prefersDark ? 'g100' : 'white';
  }
  return THEME_MAP[theme];
}

export const CarbonThemeProvider: React.FC<React.PropsWithChildren<{ initial?: AppTheme }>> = ({ initial = 'Light', children }) => {
  const [theme, setTheme] = useState<AppTheme>(() => (localStorage.getItem('appTheme') as AppTheme) || initial);

  useEffect(() => {
    localStorage.setItem('appTheme', theme);
  }, [theme]);

  const resolved = useResolvedTheme(theme);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  // Wrap body with a Carbon Theme component for tokens
  return (
    <Theme theme={resolved}>
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </Theme>
  );
};