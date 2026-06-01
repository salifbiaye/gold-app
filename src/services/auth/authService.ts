import { Platform } from 'react-native';
import { endpoints } from '../../config/api';
import { authConfig } from '../../config/auth';
import { AuthCredentials, AuthResult, AuthUser } from '../../types/auth';
import { apiRequest } from '../api/client';
import { restoreBiometricSession, saveBiometricSession } from './secureSessionStore';
import { tokenStore } from './tokenStore';

/**
 * Backend Spring Boot retourne :
 *   { accessToken, refreshToken?, expiresIn, user: { id, email, fullName, phone, roles } }
 * (refreshToken est null sur web — il vit dans un cookie HttpOnly côté navigateur)
 */
type BackendAuthResponse = {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    avatarUrl?: string | null;
    roles: string[];
  };
};

function toAuthResult(res: BackendAuthResponse): AuthResult {
  const user: AuthUser = {
    id: res.user.id,
    email: res.user.email,
    fullName: res.user.fullName ?? '',
    phone: res.user.phone ?? '',
    token: res.accessToken,
    avatarUrl: res.user.avatarUrl ?? null,
  };
  return { token: res.accessToken, user };
}

export async function loginWithCredentials(credentials: AuthCredentials): Promise<AuthResult> {
  // ----------- Mode MOCK -----------
  if (authConfig.useMockAuth) {
    const isValid =
      credentials.identifier.trim() === authConfig.defaultCredentials.identifier &&
      credentials.password === authConfig.defaultCredentials.password;
    if (!isValid) throw new Error('Identifiants incorrects');

    const result: AuthResult = { token: authConfig.demoUser.token, user: authConfig.demoUser };
    tokenStore.set(result.token);
    void saveBiometricSession(result).catch(() => {});
    return result;
  }

  // ----------- Mode LIVE -----------
  // Le backend attend { email, password } — l'identifier front peut être un email OU un téléphone.
  // On envoie le champ comme "email" : le backend fera la résolution si on étend plus tard.
  const body = JSON.stringify({ email: credentials.identifier.trim(), password: credentials.password });

  const res = await apiRequest<BackendAuthResponse>(endpoints.auth.login, {
    method: 'POST',
    body,
    skipAuth: true,
  });

  const result = toAuthResult(res);
  tokenStore.set(result.token);
  // Mobile : on garde le refresh en mémoire (web : ignoré, il vit dans le cookie HttpOnly)
  if (Platform.OS !== 'web' && res.refreshToken) tokenStore.setRefresh(res.refreshToken);

  void saveBiometricSession(result).catch(() => {});
  return result;
}

/** Inscription — disponible uniquement en mode LIVE. */
export async function registerWithCredentials(payload: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}): Promise<AuthResult> {
  if (authConfig.useMockAuth) {
    throw new Error('Inscription désactivée en mode MOCK — désactive EXPO_PUBLIC_USE_MOCK_API');
  }

  const res = await apiRequest<BackendAuthResponse>(endpoints.auth.register, {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  const result = toAuthResult(res);
  tokenStore.set(result.token);
  if (Platform.OS !== 'web' && res.refreshToken) tokenStore.setRefresh(res.refreshToken);
  void saveBiometricSession(result).catch(() => {});
  return result;
}

export async function loginWithBiometricSession(promptMessage: string): Promise<AuthResult | null> {
  const result = await restoreBiometricSession(promptMessage);
  if (result) tokenStore.set(result.token);
  return result;
}

export async function logout(): Promise<void> {
  if (!authConfig.useMockAuth) {
    try {
      await apiRequest(endpoints.auth.logout, { method: 'POST' });
    } catch {
      // Best-effort : on nettoie le store même si l'appel échoue
    }
  }
  tokenStore.clear();
}
