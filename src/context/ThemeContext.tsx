import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { colors as lightColors } from '../theme/colors';

export type ThemeMode = 'system' | 'light' | 'dark';

const darkColors = {
  ...lightColors,
  background: '#07141D',
  surface: '#10202B',
  surfaceMuted: '#152A36',
  text: '#F8FAFC',
  muted: '#A8B3BD',
  border: '#223845',
  primarySoft: '#123F2D',
};

type ThemeContextValue = {
  colors: typeof lightColors;
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const rawScheme = useColorScheme();
  // useColorScheme() peut renvoyer null sur certains appareils — fallback sur Appearance API
  const systemScheme = rawScheme ?? Appearance.getColorScheme() ?? 'light';
  const [mode, setMode] = useState<ThemeMode>('system');
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const sub = Appearance.addChangeListener(() => forceUpdate((n) => n + 1));
    return () => sub.remove();
  }, []);

  const resolvedMode = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo(
    () => ({
      colors: resolvedMode === 'dark' ? darkColors : lightColors,
      mode,
      resolvedMode,
      setMode,
    }),
    [mode, resolvedMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useAppTheme must be used inside ThemeProvider');
  }

  return value;
}
