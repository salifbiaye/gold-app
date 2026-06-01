import Head from 'expo-router/head';
import { env } from '../../../config/env';
import type { SeoMetadata } from '../../../config/routes';

export function WebSeoHead({ metadata }: { metadata: SeoMetadata }) {
  const canonical = `${env.siteUrl}${metadata.canonicalPath}`;
  return (
    <Head>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <meta name="robots" content={metadata.indexable ? 'index,follow' : 'noindex,nofollow'} />
      <meta name="theme-color" content="#EAF8EF" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Gold App" />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:url" content={canonical} />
      <link rel="canonical" href={canonical} />
    </Head>
  );
}
