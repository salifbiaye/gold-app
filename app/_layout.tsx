import { Stack } from 'expo-router';
import { Fragment, useEffect } from 'react';
import { Platform } from 'react-native';
import { ApiModeBadge } from '../src/components/dev/ApiModeBadge';
import { ThemeProvider } from '../src/context/ThemeContext';
import { WebSessionProvider } from '../src/context/WebSessionContext';
import { tryRestoreSession } from '../src/services/api/client';
import { tokenStore } from '../src/services/auth/tokenStore';

export default function RootLayout() {
  // Restauration de session au boot :
  //  - Web    : cookie HttpOnly → POST /auth/refresh transparent
  //  - Mobile : refresh token lu depuis SecureStore (Keychain) → tryRestoreSession
  useEffect(() => {
    // Tout est wrappé dans un try/catch pour qu'aucune erreur de boot ne fige l'UI
    // (modules natifs absents en Expo Go, backend injoignable, etc.)
    (async () => {
      try {
        if (Platform.OS !== 'web') {
          await tokenStore.hydrateRefreshFromSecureStore();
        }
        void tryRestoreSession().catch(() => {});
      } catch {
        // Boot best-effort — pas de refresh = l'utilisateur devra se reconnecter
      }
    })();
  }, []);

  const navigation = <Stack screenOptions={{ headerShown: false }} />;

  if (Platform.OS !== 'web') {
    return (
      <Fragment>
        {navigation}
        <ApiModeBadge />
      </Fragment>
    );
  }

  return (
    <ThemeProvider>
      <WebSessionProvider>
        {navigation}
        <ApiModeBadge />
      </WebSessionProvider>
    </ThemeProvider>
  );
}
