import { endpoints } from '../../config/api';
import { authConfig } from '../../config/auth';
import { apiRequest } from '../api/client';
import { serviceConfig } from '../serviceConfig';
import { tokenStore } from './tokenStore';
import type { AuthCredentials, AuthUser } from '../../types/auth';

export interface WebAuthService {
  login(credentials: AuthCredentials): Promise<AuthUser>;
  logout(): Promise<void>;
  restoreSession(): Promise<AuthUser | null>;
}

export const webAuthService: WebAuthService = {
  async login(credentials) {
    if (serviceConfig.useMock) {
      const valid =
        credentials.identifier.trim() === authConfig.defaultCredentials.identifier &&
        credentials.password === authConfig.defaultCredentials.password;
    if (!valid) throw new Error('Identifiants incorrects');
      return authConfig.demoUser;
    }
    const result = await apiRequest<{ accessToken: string; user: AuthUser }>(endpoints.auth.login, {
      body: JSON.stringify({ email: credentials.identifier.trim(), password: credentials.password }),
      method: 'POST',
      skipAuth: true,
    });
    tokenStore.set(result.accessToken);
    return { ...result.user, token: result.accessToken };
  },
  async logout() {
    if (serviceConfig.useMock) return;
    await apiRequest<void>(endpoints.auth.logout, { method: 'POST' });
    tokenStore.clear();
  },
  async restoreSession() {
    if (serviceConfig.useMock) return null;
    try {
      const result = await apiRequest<{ user: AuthUser }>(endpoints.auth.me);
      return result.user;
    } catch {
      return null;
    }
  },
};
