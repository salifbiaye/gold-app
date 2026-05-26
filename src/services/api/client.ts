import { apiConfig } from '../../config/api';
import { tokenStore } from '../auth/tokenStore';

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, payload: unknown) {
    super(`API error ${status}`);
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = Omit<RequestInit, 'signal'> & {
  skipAuth?: boolean;
};

let _onUnauthorized: (() => void) | null = null;

/** Register a 401 handler (called once in AuthProvider). */
export function registerUnauthorizedHandler(handler: () => void) {
  _onUnauthorized = handler;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), apiConfig.timeoutMs);

  const token = options.skipAuth ? null : tokenStore.get();

  try {
    const response = await fetch(`${apiConfig.baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      tokenStore.clear();
      _onUnauthorized?.();
      throw new ApiError(401, null);
    }

    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new ApiError(response.status, payload);
    }

    return payload as T;
  } finally {
    clearTimeout(timeout);
  }
}
