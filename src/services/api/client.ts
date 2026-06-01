import { Platform } from 'react-native';
import { apiConfig } from '../../config/api';
import { tokenStore } from '../auth/tokenStore';

/**
 * API client unifié — connaît le wrapper { success, data, error } du backend Spring Boot.
 *
 * Stratégie token (option B "Memory + refresh cookie HttpOnly") :
 *  - Web : Authorization: Bearer <access> + credentials: 'include' pour envoyer le cookie HttpOnly
 *  - Mobile : Authorization: Bearer <access> + refresh en mémoire (plus tard expo-secure-store)
 *
 * Auto-refresh : sur 401, tentative unique de POST /auth/refresh, puis retry de la requête.
 */

export class ApiError extends Error {
  status: number;
  code: string;
  payload: unknown;

  constructor(status: number, code: string, message: string, payload?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

type RequestOptions = Omit<RequestInit, 'signal'> & {
  /** Si true, n'envoie ni Bearer ni cookie. */
  skipAuth?: boolean;
  /** Si true, retourne le payload brut sans unwrap (utile pour /auth/refresh). */
  raw?: boolean;
};

let _onUnauthorized: (() => void) | null = null;
let _refreshing: Promise<boolean> | null = null;

/** Enregistre un handler global appelé quand toute tentative de refresh échoue. */
export function registerUnauthorizedHandler(handler: () => void) {
  _onUnauthorized = handler;
}

/** Appelé au boot de l'app web pour rétablir la session via le cookie HttpOnly. */
export async function tryRestoreSession(): Promise<boolean> {
  return tryRefresh();
}

async function tryRefresh(): Promise<boolean> {
  if (_refreshing) return _refreshing;
  _refreshing = (async () => {
    try {
      const isWeb = Platform.OS === 'web';
      const refresh = isWeb ? null : tokenStore.getRefresh();
      const body = refresh ? JSON.stringify({ refreshToken: refresh }) : undefined;

      const response = await fetch(`${apiConfig.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: isWeb ? 'include' : 'omit',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(isWeb ? { 'X-Client': 'web' } : {}),
        },
        body,
      });

      if (!response.ok) return false;
      const json = await response.json();
      const data = json?.data;
      if (!data?.accessToken) return false;
      tokenStore.set(data.accessToken);
      if (!isWeb && data.refreshToken) tokenStore.setRefresh(data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      _refreshing = null;
    }
  })();
  return _refreshing;
}

async function rawFetch(path: string, options: RequestOptions): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), apiConfig.timeoutMs);

  const isWeb = Platform.OS === 'web';
  const token = options.skipAuth ? null : tokenStore.get();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  try {
    return await fetch(`${apiConfig.baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      credentials: isWeb ? 'include' : 'omit',
      headers: {
        Accept: 'application/json',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(isWeb ? { 'X-Client': 'web' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Backend Spring Boot répond :
 *   succès : { success: true, data: <T>, timestamp }
 *   erreur : { success: false, error: { code, message, fields? }, timestamp }
 */
type Envelope<T> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; fields?: Array<{ field: string; message: string }> };
  timestamp?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await rawFetch(path, options);

  // Tentative unique de refresh + retry en cas de 401
  if (response.status === 401 && !options.skipAuth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      response = await rawFetch(path, options);
    } else {
      tokenStore.clear();
      _onUnauthorized?.();
      throw new ApiError(401, 'UNAUTHENTICATED', 'Session expirée');
    }
  }

  const text = await response.text();
  const json: Envelope<T> | null = text ? (JSON.parse(text) as Envelope<T>) : null;

  if (options.raw) {
    if (!response.ok) {
      throw new ApiError(response.status, 'HTTP_' + response.status, response.statusText, json);
    }
    return json as unknown as T;
  }

  if (!response.ok) {
    const code = json?.error?.code ?? 'HTTP_' + response.status;
    const message = json?.error?.message ?? `HTTP ${response.status}`;
    throw new ApiError(response.status, code, message, json);
  }

  if (json && json.success === false) {
    throw new ApiError(
      response.status,
      json.error?.code ?? 'ERROR',
      json.error?.message ?? 'Erreur inconnue',
      json
    );
  }

  return (json?.data ?? (json as unknown)) as T;
}
