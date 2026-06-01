import Head from 'expo-router/head';
import { Platform } from 'react-native';

/**
 * Composant <Head> SEO unifié pour les pages publiques.
 *
 * Utilisé sur la landing et les pages /services/*, /agences, /blog.
 * Pour les pages privées /app/* utiliser <SeoNoindex /> à la place.
 *
 * Schema.org JSON-LD inclus pour le référencement par les LLM (ChatGPT, Claude,
 * Perplexity, Gemini) qui privilégient ce format.
 */

const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://goldapp.sn';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

type SeoHeadProps = {
  title: string;
  description: string;
  /** Path relatif (ex: '/services/transport') — devient canonical + og:url. */
  path?: string;
  /** URL d'image OG (1200×630 recommandé). Optionnel. */
  ogImage?: string;
  /** JSON-LD structured data additionnel (Service, Product, FAQPage…). */
  schema?: object | object[];
  /** Mots-clés ciblés (séparés par virgule). */
  keywords?: string;
};

export function SeoHead({
  title,
  description,
  path = '/',
  ogImage = DEFAULT_OG_IMAGE,
  schema,
  keywords,
}: SeoHeadProps) {
  // Head n'a d'effet qu'en web — on évite tout coût sur mobile.
  if (Platform.OS !== 'web') return null;

  const canonical = `${SITE_URL}${path}`;
  const fullTitle = title.endsWith('GoldApp') ? title : `${title} · GoldApp`;

  // Schema.org Organization (toujours présent + schema spécifique à la page)
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GoldApp',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Super-app sénégalais : paiements PI-SPI, transport, immobilier, santé, alimentation, éducation, tourisme.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dakar',
      addressCountry: 'SN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+221-33-821-0001',
      contactType: 'customer support',
      areaServed: 'SN',
      availableLanguage: ['French', 'Wolof'],
    },
    sameAs: [
      'https://twitter.com/goldapp_sn',
      'https://linkedin.com/company/goldapp',
      'https://facebook.com/goldapp.sn',
    ],
  };

  const schemaArray = [
    orgSchema,
    ...(Array.isArray(schema) ? schema : schema ? [schema] : []),
  ];

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph (partage social + IA) */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="fr_SN" />
      <meta property="og:site_name" content="GoldApp" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Robots (indexable par défaut) */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow" />

      {/* JSON-LD pour LLM et moteurs */}
      <script type="application/ld+json">
        {JSON.stringify(schemaArray)}
      </script>
    </Head>
  );
}

/**
 * Pour les pages privées /app/* : interdit l'indexation par tous les bots
 * (Google, Bing, GPTBot, ClaudeBot, PerplexityBot, etc.).
 */
export function SeoNoindex({ title }: { title?: string }) {
  if (Platform.OS !== 'web') return null;
  return (
    <Head>
      {title && <title>{title} · GoldApp</title>}
      <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
      <meta name="googlebot" content="noindex, nofollow" />
    </Head>
  );
}
