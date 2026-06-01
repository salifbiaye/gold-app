import { Redirect } from 'expo-router';

/**
 * React Navigation syncs son état dans l'URL web (ex: /application/MainTabs/Wallet).
 * Ce catch-all intercepte ces paths au refresh et redirige vers /application,
 * où l'app reboot et React Navigation restaure la bonne route.
 */
export default function ApplicationDeepRoute() {
  return <Redirect href="/application" />;
}
