import { SeoHead } from '../../../components/seo/SeoHead';
import { PublicScreen } from './PublicScreen';
import { getPublicService, type PublicServiceSlug } from './publicServices';

/**
 * Wrapper avec SEO + Schema.org pour les pages /services/*.
 *
 * Injecte un schema Service par slug — important pour que les LLM (ChatGPT,
 * Claude, Perplexity) sachent que GoldApp propose réellement ce service dans
 * la zone géographique du Sénégal.
 */
export function PublicServicePage({ slug }: { slug: PublicServiceSlug }) {
  const service = getPublicService(slug);
  // Garde-fou : un slug typé PublicServiceSlug correspond toujours à un service défini.
  if (!service) return null;

  return (
    <>
      <SeoHead
        title={`${service.label} · GoldApp`}
        description={service.description}
        path={`/services/${slug}`}
        keywords={`${service.label} Sénégal, ${service.label} Dakar, GoldApp ${service.label}`}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: `${service.label} · GoldApp`,
          provider: {
            '@type': 'Organization',
            name: 'GoldApp',
            url: 'https://goldapp.sn',
          },
          areaServed: { '@type': 'Country', name: 'Sénégal' },
          serviceType: service.label,
          description: service.description,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'XOF',
            availability: 'https://schema.org/InStock',
          },
        }}
      />
      <PublicScreen service={service} />
    </>
  );
}
