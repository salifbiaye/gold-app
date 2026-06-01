import { Stack } from 'expo-router';
import { SeoNoindex } from '../../src/components/seo/SeoHead';

/**
 * Layout pour toute la zone privée /app/*.
 *
 * Injecte un <meta name="robots" content="noindex, nofollow"> global :
 * - Google / Bing / Yandex n'indexent pas
 * - GPTBot / ClaudeBot / PerplexityBot n'indexent pas
 * - Aucun snippet, aucun preview généré
 *
 * Volontaire : c'est une zone authentifiée (dashboard wallet, commandes, paramètres…)
 * qui n'a aucune valeur SEO et pourrait fuiter des données sensibles dans les caches.
 */
export default function AppLayout() {
  return (
    <>
      <SeoNoindex />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
