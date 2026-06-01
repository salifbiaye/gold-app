import { NavigationIndependentTree } from '@react-navigation/core';
import { Platform } from 'react-native';
import MobileApplication from '../App';
import { SeoHead } from '../src/components/seo/SeoHead';
import { PublicScreen } from '../src/screens/web/public/PublicScreen';

export default function IndexRoute() {
  if (Platform.OS === 'web') {
    return (
      <>
        <SeoHead
          title="GoldApp · Le super-app sénégalais"
          description="Paiements PI-SPI, transport, immobilier, santé, alimentation. Une seule app, tous tes services au Sénégal. Wallet sécurisé, transferts instantanés sans frais."
          path="/"
          keywords="GoldApp, PI-SPI, paiement mobile Sénégal, wallet Dakar, transfert XOF, super app sénégalais, transport Dakar, immobilier Sénégal, téléconsultation"
          schema={{
            '@context': 'https://schema.org',
            '@type': 'MobileApplication',
            name: 'GoldApp',
            operatingSystem: 'Android, iOS, Web',
            applicationCategory: 'FinanceApplication',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'XOF' },
            description: 'Super-app sénégalais regroupant paiements PI-SPI, transport, immobilier, santé, alimentation, éducation et tourisme.',
            aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: '128' },
          }}
        />
        <PublicScreen />
      </>
    );
  }

  return (
    <NavigationIndependentTree>
      <MobileApplication />
    </NavigationIndependentTree>
  );
}
