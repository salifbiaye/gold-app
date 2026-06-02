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
  const subtitleStyle = { ...styles.subtitle, ...(mobile ? styles.subtitleMobile : null) };
  const featureListStyle = { ...styles.featureList, ...(mobile ? styles.featureListMobile : null) };
  const featureTextStyle = { ...styles.featureText, ...(mobile ? styles.featureTextMobile : null) };
  const checkCircleStyle = { ...styles.checkCircle, ...(mobile ? styles.checkCircleMobile : null) };
  const ctaStyle = { ...styles.cta, ...(mobile ? styles.ctaMobile : null) };

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
          <Text style={subtitleStyle}>{subtitle}</Text>

          <View style={featureListStyle}>
            {features.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <View style={checkCircleStyle}>
                  <Check color="#FFFFFF" size={mobile ? 15 : 20} strokeWidth={3} />
                </View>
                <Text style={featureTextStyle}>{feature}</Text>
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
          <Pressable style={ctaStyle}>
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
    minHeight: '100dvh' as any,
    paddingBottom: 34,
    paddingHorizontal: 34,
    paddingTop: 60,
  },
  pageMobile: {
    minHeight: 'auto' as any,
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    zIndex: 2,
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
    flexShrink: 1,
    marginTop: 170,
    maxWidth: 520,
    zIndex: 2,
  },
  contentMobile: {
    marginTop: 54,
  },
  title: {
    color: '#202228',
    fontSize: 38,
    fontWeight: '500',
    letterSpacing: 0,
  },
  titleMobile: {
    fontSize: 22,
  },
  subtitle: {
    color: '#8D94A0',
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 30,
    marginTop: 18,
  },
  subtitleMobile: {
    fontSize: 15,
    lineHeight: 20,
    marginTop: 16,
  },
  featureList: {
    gap: 18,
    marginTop: 52,
  },
  featureListMobile: {
    gap: 12,
    marginTop: 28,
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
  checkCircleMobile: {
    borderRadius: 10,
    height: 20,
    width: 20,
  },
  featureText: {
    color: '#2A2D33',
    fontSize: 21,
    fontWeight: '400',
  },
  featureTextMobile: {
    fontSize: 13,
    lineHeight: 18,
  },
  watermark: {
    bottom: 142,
    height: 220,
    opacity: 0.08,
    position: 'absolute',
    right: 120,
    width: 220,
    zIndex: 0,
  },
  watermarkMobile: {
    display: 'none' as any,
  },
  serviceImage: {
    borderRadius: 24,
    height: 360,
    maxWidth: 520,
    position: 'absolute',
    right: 46,
    top: 230,
    width: '34%',
    zIndex: 0,
  },
  serviceImageMobile: {
    display: 'none' as any,
  },
  cta: {
    alignItems: 'center',
    backgroundColor: '#09A96E',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    height: 50,
    justifyContent: 'center',
    marginTop: 'auto' as any,
    width: '100%',
    zIndex: 3,
  },
  ctaMobile: {
    flexShrink: 0,
    marginTop: 30,
    minHeight: 48,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
  },
});
