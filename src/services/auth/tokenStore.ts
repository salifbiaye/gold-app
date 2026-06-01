import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Access token store — stratégie option B "Memory + refresh cookie HttpOnly".
 *
 * Web :
 *   - access token  : mémoire (perdu au reload — restauré via tryRestoreSession)
 *   - refresh token : COOKIE HttpOnly Secure SameSite=Lax posé par le backend (JS aveugle)
 *
 * Mobile :
 *   - access token  : mémoire (rapide, perdu si app kill)
 *   - refresh token : expo-secure-store (Keychain iOS / EncryptedSharedPreferences Android)
 *                     → survit aux redémarrages → auto-login transparent
 *
 * Pourquoi PAS de localStorage côté web ? Une seule XSS exfiltre le token. Cookie HttpOnly = JS aveugle.
 */

const REFRESH_KEY = 'goldapp.refresh.token';

let _accessToken: string | null = null;
let _refreshToken: string | null = null;

function isMobile() {
  return Platform.OS !== 'web';
}

export const tokenStore = {
  get: () => _accessToken,
  set: (token: string) => {
    _accessToken = token;
  },
  clear: () => {
    _accessToken = null;
    _refreshToken = null;
    if (isMobile()) {
      void SecureStore.deleteItemAsync(REFRESH_KEY).catch(() => {});
    }
  },
  has: () => _accessToken !== null,

  // Refresh — mobile uniquement (web utilise le cookie HttpOnly).
  getRefresh: () => _refreshToken,
  setRefresh: (token: string | null) => {
    _refreshToken = token;
    if (!isMobile()) return;
    // try/catch synchrone pour le cas où le module natif jette à l'appel (Expo Go sans dev client)
    try {
      const op = token
        ? SecureStore.setItemAsync(REFRESH_KEY, token)
        : SecureStore.deleteItemAsync(REFRESH_KEY);
      void op.catch(() => {});
    } catch {
      // SecureStore indisponible — on reste en mémoire seule
    }
  },

  /** À appeler au boot de l'app mobile pour rétablir le refresh depuis le Keychain. */
  hydrateRefreshFromSecureStore: async (): Promise<void> => {
    if (!isMobile()) return;
    try {
      const stored = await SecureStore.getItemAsync(REFRESH_KEY);
      if (stored) _refreshToken = stored;
    } catch {
      // SecureStore peut être indisponible (jamais initialisé) — silent
    }
  },
};
