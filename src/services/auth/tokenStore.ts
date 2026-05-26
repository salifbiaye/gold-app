/**
 * In-memory token store.
 * Swap the implementation to expo-secure-store when the backend is ready
 * without touching anything else — only this file changes.
 */
let _accessToken: string | null = null;

export const tokenStore = {
  get: () => _accessToken,
  set: (token: string) => { _accessToken = token; },
  clear: () => { _accessToken = null; },
};
