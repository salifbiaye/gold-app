import { Redirect } from 'expo-router';

/**
 * Legacy /app/* URLs are handled by the authenticated /application shell.
 * Keeping one catch-all avoids a noisy folder full of identical redirect files.
 */
export default function LegacyAppRoute() {
  return <Redirect href="/application" />;
}