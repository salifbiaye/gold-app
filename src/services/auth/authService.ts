import { endpoints } from '../../config/api';
import { authConfig } from '../../config/auth';
import { AuthCredentials, AuthResult } from '../../types/auth';
import { apiRequest } from '../api/client';
import { tokenStore } from './tokenStore';

export async function loginWithCredentials(credentials: AuthCredentials): Promise<AuthResult> {
  if (authConfig.useMockAuth) {
    const isValid =
      credentials.identifier.trim() === authConfig.defaultCredentials.identifier &&
      credentials.password === authConfig.defaultCredentials.password;

    if (!isValid) throw new Error('Identifiants incorrects');

    const result: AuthResult = { token: authConfig.demoUser.token, user: authConfig.demoUser };
    tokenStore.set(result.token);
    return result;
  }

  const result = await apiRequest<AuthResult>(endpoints.auth.login, {
    method: 'POST',
    body: JSON.stringify(credentials),
    skipAuth: true,
  });

  tokenStore.set(result.token);
  return result;
}

export function logout() {
  tokenStore.clear();
}
