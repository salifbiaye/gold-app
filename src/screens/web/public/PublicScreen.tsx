import { Link } from 'expo-router';
import { Check, ArrowRight } from 'lucide-react-native';
import { Image, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { publicRouteMetadata } from '../../../config/routes';
import { WebSeoHead } from './WebSeoHead';
import type { PublicService } from './publicServices';

type PublicWebPageProps = { service?: PublicService };

const piSpiLogo = require('../../../../assets/images/pi-spi.logo.png');

const SANS = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", system-ui, sans-serif',
  default: undefined,
});

const homeFeatures = [
  'Chatbot IA conversationnel',
  'Services multi-domaines',
  'Paiements sécurisés (PI-SPI)',
  'Géolocalisation en temps réel',
  'Suivi commandes & livraisons',
];

export function PublicScreen({ service }: PublicWebPageProps) {
  const { width } = useWindowDimensions();
  const mobile = width < 720;
  const metadata = publicRouteMetadata[service?.slug ?? 'home'];
  const title = service ? service.label : 'Super App IA';
  const subtitle = service
    ? service.description
    : 'Tout ce dont vous avez besoin,\ndans une seule application.';
  const features = service
    ? [
      'Accès simple depuis Gold App',
      'Paiements intégrés PI-SPI',
      'Suivi clair et sécurisé',
      'Support local au Sénégal',
    ]
    : homeFeatures;
  const pageStyle = { ...styles.page, ...(mobile ? styles.pageMobile : null) };
  const contentStyle = { ...styles.content, ...(mobile ? styles.contentMobile : null) };
  const titleStyle = { ...styles.title, ...(mobile ? styles.titleMobile : null) };
  const serviceImageStyle = { ...styles.serviceImage, ...(mobile ? styles.serviceImageMobile : null) };
  const watermarkStyle = { ...styles.watermark, ...(mobile ? styles.watermarkMobile : null) };

  return (
    <>
      <WebSeoHead metadata={metadata} />
      <View style={pageStyle}>
        <View style={styles.brandRow}>
          <View style={styles.aiMark}>
            <Text style={styles.aiText}>Ai</Text>
          </View>
          <Text style={styles.brandText}>
            GOLD <Text style={styles.brandAccent}>APP</Text>
          </Text>
        </View>

        <View style={contentStyle}>
          <Text style={titleStyle}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.featureList}>
            {features.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <View style={styles.checkCircle}>
                  <Check color="#FFFFFF" size={20} strokeWidth={3} />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {service ? (
          <Image source={service.image} resizeMode="cover" style={serviceImageStyle} />
        ) : (
          <Image source={piSpiLogo} resizeMode="contain" style={watermarkStyle} />
        )}

        <Link href="/connexion" asChild>
          <Pressable style={styles.cta}>
            <Text style={styles.ctaText}>Commencer</Text>
            <ArrowRight color="#FFFFFF" size={18} strokeWidth={2.6} />
          </Pressable>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    fontFamily: SANS as any,
    minHeight: '100vh' as any,
    overflow: 'hidden',
    paddingBottom: 34,
    paddingHorizontal: 34,
    paddingTop: 60,
  },
  pageMobile: {
    paddingHorizontal: 22,
    paddingTop: 40,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  aiMark: {
    alignItems: 'center',
    backgroundColor: '#069B66',
    borderRadius: 14,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  aiText: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
  },
  brandText: {
    color: '#1F242A',
    fontSize: 38,
    fontWeight: '500',
    letterSpacing: 0,
  },
  brandAccent: {
    color: '#0BA66D',
    fontWeight: '600',
  },
  content: {
    marginTop: 170,
    maxWidth: 520,
  },
  contentMobile: {
    marginTop: 78,
  },
  title: {
    color: '#202228',
    fontSize: 38,
    fontWeight: '500',
    letterSpacing: 0,
  },
  titleMobile: {
    fontSize: 33,
  },
  subtitle: {
    color: '#8D94A0',
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 30,
    marginTop: 18,
  },
  featureList: {
    gap: 18,
    marginTop: 52,
  },
  featureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
  },
  checkCircle: {
    alignItems: 'center',
    backgroundColor: '#09A96E',
    borderRadius: 18,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  featureText: {
    color: '#2A2D33',
    fontSize: 21,
    fontWeight: '400',
  },
  watermark: {
    bottom: 142,
    height: 220,
    opacity: 0.08,
    position: 'absolute',
    right: 120,
    width: 220,
  },
  watermarkMobile: {
    bottom: 112,
    height: 130,
    opacity: 0.06,
    right: 18,
    width: 130,
  },
  serviceImage: {
    borderRadius: 24,
    height: 360,
    maxWidth: 520,
    position: 'absolute',
    right: 46,
    top: 230,
    width: '34%',
  },
  serviceImageMobile: {
    display: 'none' as any,
  },
  cta: {
    alignItems: 'center',
    backgroundColor: '#09A96E',
    borderRadius: 16,
    bottom: 34,
    flexDirection: 'row',
    gap: 10,
    height: 50,
    justifyContent: 'center',
    left: 34,
    position: 'absolute',
    right: 34,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
  },
});
