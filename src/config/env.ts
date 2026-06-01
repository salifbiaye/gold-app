function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value == null) return fallback;
  return value.toLowerCase() === 'true';
}

export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api',
  apiTimeoutMs: 15000,
  useMockApi: parseBoolean(process.env.EXPO_PUBLIC_USE_MOCK_API, true),
  siteUrl: (process.env.EXPO_PUBLIC_SITE_URL ?? 'https://goldapp.sn').replace(/\/$/, ''),
  enableWebPasskeys: parseBoolean(process.env.EXPO_PUBLIC_ENABLE_WEB_PASSKEYS, false),
};
