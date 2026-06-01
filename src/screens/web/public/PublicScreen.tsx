import { Link } from 'expo-router';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Fingerprint,
  Layers,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WalletCards,
  Zap,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { publicRouteMetadata } from '../../../config/routes';
import { WebSeoHead } from './WebSeoHead';
import { publicServices, type PublicService } from './publicServices';

type PublicWebPageProps = { service?: PublicService };

const homeLight = require('../../../../pdf-assets/home-light.png');
const walletDark = require('../../../../pdf-assets/wallet-dark.png');
const chatLight = require('../../../../pdf-assets/chat-light.png');
const ordersLight = require('../../../../pdf-assets/orders-light.png');

const MONO = Platform.select({ web: 'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, monospace', default: undefined });
const SANS = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", system-ui, sans-serif',
  default: undefined,
});

export function PublicScreen({ service }: PublicWebPageProps) {
  const { width } = useWindowDimensions();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const mobile = hydrated && width < 880;
  const compact = hydrated && width < 1180;
  const metadata = publicRouteMetadata[service?.slug ?? 'home'];

  return (
    <>
      <WebSeoHead metadata={metadata} />
      <View style={styles.page}>
        <PublicHeader mobile={mobile} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          {service ? <ServiceHero service={service} mobile={mobile} /> : <LandingHero mobile={mobile} compact={compact} />}

          {!service && (
            <>
              <TrustedBy mobile={mobile} />
              <ServicesSection mobile={mobile} />
              <SecuritySection mobile={mobile} />
              <PreviewSection mobile={mobile} />
              <MetricsBand mobile={mobile} />
            </>
          )}

          <FinalCta service={service} />
          <Footer />
        </ScrollView>
      </View>
    </>
  );
}

/* ---------------------------------------------------------------- */
/*                            HEADER                                 */
/* ---------------------------------------------------------------- */

function PublicHeader({ mobile }: { mobile: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <View
      style={styles.header}
      // @ts-expect-error web-only event handlers
      onMouseLeave={() => setOpen(false)}
    >
      <View style={styles.headerInner}>
        <Link href="/" asChild>
          <Pressable style={styles.brand}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>G</Text>
            </View>
            <Text style={styles.brandText}>
              Gold<Text style={styles.brandGreen}>.</Text>
            </Text>
          </Pressable>
        </Link>

        {!mobile && (
          <View style={styles.navigation}>
            <Pressable onHoverIn={() => setOpen(true)} onPress={() => setOpen((v) => !v)} style={styles.navItem}>
              <Text style={styles.navLabel}>Services</Text>
              <View style={styles.navChevron} />
            </Pressable>
            <Link href="/#services" asChild>
              <Pressable style={styles.navItem}>
                <Text style={styles.navLabel}>Wallet</Text>
              </Pressable>
            </Link>
            <Link href="/#security" asChild>
              <Pressable style={styles.navItem}>
                <Text style={styles.navLabel}>Sécurité</Text>
              </Pressable>
            </Link>
            <Link href="/#preview" asChild>
              <Pressable style={styles.navItem}>
                <Text style={styles.navLabel}>Aperçus</Text>
              </Pressable>
            </Link>
          </View>
        )}

        <View style={styles.headerRight}>
          {!mobile && (
            <Link href="/connexion" asChild>
              <Pressable style={styles.signinLink}>
                <Text style={styles.signinText}>Se connecter</Text>
              </Pressable>
            </Link>
          )}
          <Link href="/connexion" asChild>
            <Pressable style={styles.headerCta}>
              <Text style={styles.headerCtaText}>Ouvrir un compte</Text>
              <ArrowRight color="#FFFFFF" size={14} strokeWidth={2.4} />
            </Pressable>
          </Link>
        </View>
      </View>

      {!mobile && open && <MegaMenu />}
    </View>
  );
}

function MegaMenu() {
  return (
    <View style={styles.megaMenu}>
      <View style={styles.megaMenuInner}>
        <View style={styles.megaColumn}>
          <Text style={styles.megaTitle}>Vie quotidienne</Text>
          {publicServices.slice(0, 4).map((s) => (
            <MegaLink key={s.slug} service={s} />
          ))}
        </View>
        <View style={styles.megaColumn}>
          <Text style={styles.megaTitle}>Argent & santé</Text>
          {publicServices.slice(4).map((s) => (
            <MegaLink key={s.slug} service={s} />
          ))}
        </View>
        <View style={styles.megaFeature}>
          <Text style={styles.megaFeatureKicker}>Nouveau</Text>
          <Text style={styles.megaFeatureTitle}>Tous les services dans une seule app.</Text>
          <Text style={styles.megaFeatureCopy}>
            Transport, livraisons, paiements et santé, dans une interface conçue pour Dakar.
          </Text>
          <View style={styles.megaArrow}>
            <ArrowRight color="#0EB56D" size={16} strokeWidth={2.6} />
          </View>
        </View>
      </View>
    </View>
  );
}

function MegaLink({ service }: { service: PublicService }) {
  return (
    <Link href={`/services/${service.slug}` as never} asChild>
      <Pressable style={styles.megaLink}>
        <Text style={styles.megaLinkLabel}>{service.label}</Text>
        <Text style={styles.megaLinkDesc} numberOfLines={1}>
          {service.description}
        </Text>
      </Pressable>
    </Link>
  );
}

/* ---------------------------------------------------------------- */
/*                            HERO                                   */
/* ---------------------------------------------------------------- */

function LandingHero({ mobile, compact }: { mobile: boolean; compact: boolean }) {
  return (
    <View style={styles.heroWrap}>
      <View style={styles.heroMesh} />
      <View style={styles.heroMeshTwo} />
      <View style={styles.heroGrid} />

      <View style={[styles.hero, mobile && styles.heroMobile]}>
        <View style={styles.heroCopy}>
          <View style={styles.heroBadge}>
            <View style={styles.heroBadgeDot} />
            <Text style={styles.heroBadgeText}>v1.0 · Disponible à Dakar</Text>
          </View>

          <Text style={[styles.heroTitle, mobile && styles.heroTitleMobile]}>
            Le quotidien de Dakar,{'\n'}
            <Text style={styles.heroTitleAccent}>simplifié.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Transports, paiements, santé, livraisons. Une seule app, un seul wallet,
            une confidentialité pensée pour chaque opération.
          </Text>

          <View style={styles.buttonRow}>
            <Link href="/connexion" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryText}>Commencer gratuitement</Text>
                <ArrowRight color="#FFFFFF" size={15} strokeWidth={2.4} />
              </Pressable>
            </Link>
            <Pressable style={styles.ghostButton}>
              <Text style={styles.ghostText}>Voir la démo</Text>
              <View style={styles.ghostArrow}>
                <ArrowUpRight color="#0EB56D" size={13} strokeWidth={2.5} />
              </View>
            </Pressable>
          </View>

          <View style={styles.heroProof}>
            <View style={styles.heroProofItem}>
              <Smartphone color="#6B7280" size={14} strokeWidth={2.2} />
              <Text style={styles.heroProofText}>iOS · Android · Web</Text>
            </View>
            <View style={styles.heroProofDot} />
            <View style={styles.heroProofItem}>
              <ShieldCheck color="#6B7280" size={14} strokeWidth={2.2} />
              <Text style={styles.heroProofText}>Cookies HttpOnly</Text>
            </View>
            <View style={styles.heroProofDot} />
            <View style={styles.heroProofItem}>
              <Fingerprint color="#6B7280" size={14} strokeWidth={2.2} />
              <Text style={styles.heroProofText}>Biométrie native</Text>
            </View>
          </View>
        </View>

        <View style={styles.heroVisual}>
          <View style={styles.heroVisualBackdrop} />
          <View style={styles.heroPhoneShell}>
            <Image source={homeLight} resizeMode="cover" style={styles.heroPhoneImg} />
          </View>
          {!compact && (
            <View style={styles.heroPhoneFloat}>
              <Image source={walletDark} resizeMode="cover" style={styles.heroPhoneImg} />
            </View>
          )}
          {!compact && <FloatingChip />}
        </View>
      </View>
    </View>
  );
}

function FloatingChip() {
  return (
    <View style={styles.floatChip}>
      <View style={styles.floatChipIcon}>
        <Zap color="#0EB56D" size={15} strokeWidth={2.6} />
      </View>
      <View>
        <Text style={styles.floatChipLabel}>Paiement reçu</Text>
        <Text style={styles.floatChipMeta}>+25 000 FCFA · à l'instant</Text>
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- */
/*                          TRUSTED BY                               */
/* ---------------------------------------------------------------- */

function TrustedBy({ mobile }: { mobile: boolean }) {
  const partners = ['Wave', 'Orange Money', 'Free Money', 'Sonatel', 'CBAO', 'Ecobank'];
  return (
    <View style={styles.trustedBy}>
      <Text style={styles.trustedLabel}>Compatible avec l'écosystème financier du Sénégal</Text>
      <View style={[styles.trustedRow, mobile && styles.trustedRowMobile]}>
        {partners.map((p) => (
          <Text key={p} style={styles.trustedPartner}>
            {p}
          </Text>
        ))}
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- */
/*                          SERVICES                                 */
/* ---------------------------------------------------------------- */

function ServicesSection({ mobile }: { mobile: boolean }) {
  return (
    <View nativeID="services" style={styles.section}>
      <SectionHeader
        kicker="Services"
        title={
          <>
            Une plateforme,{'\n'}
            <Text style={styles.titleMuted}>huit services essentiels.</Text>
          </>
        }
        copy="Choisissez ce dont vous avez besoin — Gold s'adapte à votre rythme de vie, sans changer d'application."
      />
      <View style={[styles.bento, mobile && styles.bentoMobile]}>
        {publicServices.map((item, i) => (
          <ServiceCard key={item.slug} item={item} large={i === 0} mobile={mobile} />
        ))}
      </View>
    </View>
  );
}

function ServiceCard({ item, large, mobile }: { item: PublicService; large: boolean; mobile: boolean }) {
  // RNW 0.21.x : un Pressable enfant de <Link asChild> ne supporte ni array, ni StyleSheet.flatten([...]).
  // React DOM reçoit l'array et plante avec "CSSStyleProperties doesn't have an indexed property setter for '0'".
  // Fix : object spread conditionnel pur.
  const cardStyle = {
    ...styles.bentoCard,
    ...(large && !mobile ? styles.bentoCardLarge : null),
    ...(mobile ? styles.bentoCardMobile : null),
  };
  return (
    <Link href={`/services/${item.slug}` as never} asChild>
      <Pressable style={cardStyle}>
        <View style={styles.bentoCardInner}>
          <View style={styles.bentoCopy}>
            <Text style={styles.bentoTag}>{String(publicServices.indexOf(item) + 1).padStart(2, '0')}</Text>
            <Text style={styles.bentoTitle}>{item.label}</Text>
            <Text style={styles.bentoDesc}>{item.description}</Text>
            <View style={styles.bentoLink}>
              <Text style={styles.bentoLinkText}>Découvrir</Text>
              <ArrowRight color="#0EB56D" size={13} strokeWidth={2.6} />
            </View>
          </View>
          <View style={styles.bentoVisual}>
            <Image source={item.image} resizeMode="cover" style={styles.bentoImage} />
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

/* ---------------------------------------------------------------- */
/*                          SECURITY                                 */
/* ---------------------------------------------------------------- */

function SecuritySection({ mobile }: { mobile: boolean }) {
  return (
    <View nativeID="security" style={[styles.section, styles.sectionDark]}>
      <View style={[styles.securityWrap, mobile && styles.stacked]}>
        <View style={styles.securityCopy}>
          <View style={styles.kickerDarkWrap}>
            <Text style={styles.kickerDark}>Sécurité</Text>
          </View>
          <Text style={[styles.securityTitle, mobile && styles.securityTitleMobile]}>
            Sensible par défaut.{'\n'}
            <Text style={styles.titleMutedDark}>Discret par conception.</Text>
          </Text>
          <Text style={styles.securitySubtitle}>
            Chaque opération sensible passe par une vérification biométrique. Vos données financières
            sont chiffrées, masquées et ne quittent jamais votre appareil sans votre accord.
          </Text>
          <View style={styles.securityBlock}>
            <TrustLine
              dark
              icon={WalletCards}
              title="Wallet protégé"
              text="Solde masqué par défaut, QR éphémères pour les paiements, historique chiffré."
            />
            <TrustLine
              dark
              icon={Fingerprint}
              title="Biométrie native"
              text="Face ID, Touch ID et empreinte digitale pour valider chaque opération critique."
            />
            <TrustLine
              dark
              icon={LockKeyhole}
              title="Session web durcie"
              text="Cookies HttpOnly, Passkeys et expiration courte sur les interfaces sensibles."
            />
          </View>
        </View>

        <View style={styles.securityPanel}>
          <View style={styles.securityPanelHeader}>
            <View>
              <Text style={styles.panelLabel}>Protections actives</Text>
              <Text style={styles.panelTitle}>Tableau de bord sécurité</Text>
            </View>
            <View style={styles.panelStatus}>
              <View style={styles.panelStatusDot} />
              <Text style={styles.panelStatusText}>Opérationnel</Text>
            </View>
          </View>
          {[
            { label: 'Validation biométrique', value: 'Activée' },
            { label: 'Chiffrement E2E', value: 'TLS 1.3' },
            { label: 'Sessions actives', value: '2 appareils' },
            { label: 'Tentatives bloquées', value: '0 / 30j' },
          ].map((row) => (
            <View key={row.label} style={styles.panelRow}>
              <View style={styles.panelRowLeft}>
                <CheckCircle2 color="#12C47F" size={16} strokeWidth={2.4} />
                <Text style={styles.panelRowLabel}>{row.label}</Text>
              </View>
              <Text style={styles.panelRowValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- */
/*                          PREVIEW                                  */
/* ---------------------------------------------------------------- */

function PreviewSection({ mobile }: { mobile: boolean }) {
  return (
    <View nativeID="preview" style={styles.section}>
      <SectionHeader
        kicker="Interfaces"
        title={
          <>
            Une expérience cohérente,{'\n'}
            <Text style={styles.titleMuted}>du clair au sombre.</Text>
          </>
        }
        copy="Pensée pour la lecture en plein soleil et la tranquillité en soirée."
      />
      <View style={[styles.previewRow, mobile && styles.stacked]}>
        <PreviewPhone source={homeLight} label="Accueil" caption="Tableau de bord personnel" />
        <PreviewPhone dark source={walletDark} label="Wallet" caption="Mode sombre par défaut" />
        <PreviewPhone source={ordersLight} label="Commandes" caption="Historique unifié" />
        <PreviewPhone source={chatLight} label="Assistant" caption="Recherche conversationnelle" />
      </View>
    </View>
  );
}

function PreviewPhone({ caption, dark, label, source }: { caption: string; dark?: boolean; label: string; source: number }) {
  return (
    <View style={[styles.previewCard, dark && styles.previewCardDark]}>
      <View style={styles.previewMeta}>
        <Text style={[styles.previewLabel, dark && styles.previewLabelDark]}>{label}</Text>
        <Text style={[styles.previewCaption, dark && styles.previewCaptionDark]}>{caption}</Text>
      </View>
      <View style={styles.previewFrame}>
        <Image source={source} resizeMode="cover" style={styles.previewImage} />
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- */
/*                           METRICS                                 */
/* ---------------------------------------------------------------- */

function MetricsBand({ mobile }: { mobile: boolean }) {
  const stats = [
    { value: '8', label: 'Services intégrés', sub: 'Une seule app' },
    { value: '<1.2s', label: 'Temps de paiement', sub: 'Médiane mesurée' },
    { value: '100%', label: 'Opérations validées', sub: 'Biométrie native' },
    { value: '24/7', label: 'Assistant IA', sub: 'Conversations FR' },
  ];
  return (
    <View style={styles.section}>
      <View style={[styles.metricsBand, mobile && styles.metricsBandMobile]}>
        {stats.map((s, i) => (
          <View key={s.label} style={[styles.metricCell, i < stats.length - 1 && !mobile && styles.metricCellBorder]}>
            <Text style={styles.metricValue}>{s.value}</Text>
            <Text style={styles.metricLabel}>{s.label}</Text>
            <Text style={styles.metricSub}>{s.sub}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- */
/*                           FINAL CTA                               */
/* ---------------------------------------------------------------- */

function FinalCta({ service }: { service?: PublicService }) {
  return (
    <View style={styles.finalCta}>
      <View style={styles.finalCtaInner}>
        <View style={styles.finalCtaMesh} />
        <View style={styles.finalCtaContent}>
          <View style={styles.finalCtaIcon}>
            <Sparkles color="#0EB56D" size={20} strokeWidth={2.4} />
          </View>
          <Text style={styles.finalTitle}>
            {service ? 'Prêt à explorer ce service ?' : 'Démarrez en moins de 60 secondes.'}
          </Text>
          <Text style={styles.finalText}>
            Création de compte rapide, vérification biométrique sur mobile, accès web sécurisé.
          </Text>
          <View style={styles.finalActions}>
            <Link href="/connexion" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryText}>Créer mon compte</Text>
                <ArrowRight color="#FFFFFF" size={15} strokeWidth={2.4} />
              </Pressable>
            </Link>
            <Pressable style={styles.outlineButton}>
              <Text style={styles.outlineText}>Parler à l'équipe</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- */
/*                           FOOTER                                  */
/* ---------------------------------------------------------------- */

function Footer() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerInner}>
        <View style={styles.footerBrandWrap}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>G</Text>
          </View>
          <Text style={styles.brandText}>
            Gold<Text style={styles.brandGreen}>.</Text>
          </Text>
        </View>
        <Text style={styles.footerCopy}>© 2026 Gold App · Dakar, Sénégal</Text>
        <View style={styles.footerLinks}>
          <Text style={styles.footerLink}>Confidentialité</Text>
          <Text style={styles.footerLink}>Conditions</Text>
          <Text style={styles.footerLink}>Sécurité</Text>
        </View>
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- */
/*                           SHARED                                  */
/* ---------------------------------------------------------------- */

function SectionHeader({ copy, kicker, title }: { copy: string; kicker: string; title: React.ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.kickerWrap}>
        <Text style={styles.kickerMono}>{kicker.toUpperCase()}</Text>
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCopy}>{copy}</Text>
    </View>
  );
}

function TrustLine({
  dark,
  icon: Icon,
  text,
  title,
}: {
  dark?: boolean;
  icon: typeof WalletCards;
  text: string;
  title: string;
}) {
  return (
    <View style={styles.trustLine}>
      <View style={[styles.trustIcon, dark && styles.trustIconDark]}>
        <Icon color={dark ? '#12C47F' : '#0EB56D'} size={17} strokeWidth={2.2} />
      </View>
      <View style={styles.trustCopy}>
        <Text style={[styles.trustTitle, dark && styles.trustTitleDark]}>{title}</Text>
        <Text style={[styles.trustText, dark && styles.trustTextDark]}>{text}</Text>
      </View>
    </View>
  );
}

function ServiceHero({ service, mobile }: { service: PublicService; mobile: boolean }) {
  return (
    <View style={styles.heroWrap}>
      <View style={styles.heroMesh} />
      <View style={styles.heroGrid} />
      <View style={[styles.hero, styles.serviceHero, mobile && styles.heroMobile]}>
        <View style={styles.heroCopy}>
          <View style={styles.heroBadge}>
            <Layers color="#0EB56D" size={13} strokeWidth={2.5} />
            <Text style={styles.heroBadgeText}>Service · {service.label}</Text>
          </View>
          <Text style={[styles.serviceTitle, mobile && styles.serviceTitleMobile]}>{service.headline}</Text>
          <Text style={styles.heroSubtitle}>{service.description}</Text>
          <View style={styles.buttonRow}>
            <Link href="/connexion" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryText}>Accéder au service</Text>
                <ArrowRight color="#FFFFFF" size={15} strokeWidth={2.4} />
              </Pressable>
            </Link>
            <Link href="/" asChild>
              <Pressable style={styles.outlineButton}>
                <Text style={styles.outlineText}>Tous les services</Text>
              </Pressable>
            </Link>
          </View>
        </View>
        <View style={styles.serviceVisual}>
          <View style={styles.serviceVisualGlow} />
          <Image source={service.image} resizeMode="cover" style={styles.serviceScreen} />
        </View>
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- */
/*                            STYLES                                 */
/* ---------------------------------------------------------------- */

const MAX = 1240;
const COLORS = {
  bg: '#EAF8EF',
  bgSoft: '#F4FBF7',
  bgInk: '#0A0F14',
  ink: '#0A0F14',
  inkSoft: '#1F2A33',
  muted: '#6B7480',
  mutedLight: '#A0AAB4',
  border: '#CFEADD',
  borderStrong: '#D7DEE3',
  borderDark: '#1A2630',
  green: '#0EB56D',
  greenBright: '#12C47F',
  greenSoft: '#E8F8F0',
};

const styles = StyleSheet.create({
  page: { backgroundColor: COLORS.bg, flex: 1, fontFamily: SANS as any },
  scrollBody: { paddingTop: 72 },

  /* Header */
  header: {
    backgroundColor: 'rgba(234,248,239,0.94)',
    borderBottomColor: COLORS.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 50,
  },
  headerInner: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 68,
    justifyContent: 'space-between',
    marginHorizontal: 'auto',
    maxWidth: MAX,
    paddingHorizontal: 28,
    width: '100%',
  },
  brand: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  brandMark: {
    alignItems: 'center',
    backgroundColor: COLORS.ink,
    borderRadius: 8,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  brandMarkText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 0 },
  brandText: { color: COLORS.ink, fontSize: 19, fontWeight: '800', letterSpacing: 0 },
  brandGreen: { color: COLORS.green },
  navigation: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  navItem: { alignItems: 'center', borderRadius: 7, flexDirection: 'row', gap: 4, paddingHorizontal: 12, paddingVertical: 8 },
  navLabel: { color: COLORS.inkSoft, fontSize: 14, fontWeight: '600' },
  navChevron: {
    borderColor: COLORS.muted,
    borderRightWidth: 1.5,
    borderTopWidth: 1.5,
    height: 5,
    transform: [{ rotate: '135deg' }],
    width: 5,
  },
  headerRight: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  signinLink: { paddingHorizontal: 12, paddingVertical: 8 },
  signinText: { color: COLORS.inkSoft, fontSize: 14, fontWeight: '600' },
  headerCta: {
    alignItems: 'center',
    backgroundColor: COLORS.ink,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  headerCtaText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  /* Mega menu */
  megaMenu: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: COLORS.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 68,
  },
  megaMenuInner: {
    flexDirection: 'row',
    gap: 48,
    marginHorizontal: 'auto',
    maxWidth: MAX,
    paddingHorizontal: 28,
    paddingVertical: 36,
    width: '100%',
  },
  megaColumn: { flex: 1, gap: 4 },
  megaTitle: { color: COLORS.muted, fontFamily: MONO as any, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 14, textTransform: 'uppercase' },
  megaLink: { borderRadius: 8, gap: 3, paddingHorizontal: 10, paddingVertical: 9 },
  megaLinkLabel: { color: COLORS.ink, fontSize: 14, fontWeight: '700' },
  megaLinkDesc: { color: COLORS.muted, fontSize: 12, fontWeight: '500' },
  megaFeature: {
    backgroundColor: COLORS.bgSoft,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1.2,
    padding: 24,
  },
  megaFeatureKicker: { color: COLORS.green, fontFamily: MONO as any, fontSize: 10, fontWeight: '700', letterSpacing: 0.6, marginBottom: 10, textTransform: 'uppercase' },
  megaFeatureTitle: { color: COLORS.ink, fontSize: 18, fontWeight: '800', letterSpacing: 0, lineHeight: 24 },
  megaFeatureCopy: { color: COLORS.muted, fontSize: 13, lineHeight: 20, marginTop: 10 },
  megaArrow: {
    alignItems: 'center',
    backgroundColor: COLORS.greenSoft,
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    marginTop: 16,
    width: 32,
  },

  /* Hero */
  heroWrap: { overflow: 'hidden', position: 'relative' },
  heroMesh: {
    backgroundColor: COLORS.greenSoft,
    borderRadius: 999,
    height: 520,
    opacity: 0.35,
    position: 'absolute',
    right: -180,
    top: -120,
    width: 520,
  },
  heroMeshTwo: {
    backgroundColor: '#FFF4E5',
    borderRadius: 999,
    height: 380,
    left: -120,
    opacity: 0.3,
    position: 'absolute',
    top: 220,
    width: 380,
  },
  heroGrid: {
    backgroundColor: 'transparent',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  hero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 64,
    marginHorizontal: 'auto',
    maxWidth: MAX,
    paddingHorizontal: 28,
    paddingVertical: 96,
    width: '100%',
  },
  heroMobile: { alignItems: 'stretch', flexDirection: 'column', gap: 48, paddingVertical: 56 },
  heroCopy: { flex: 1, maxWidth: 600 },
  heroBadge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  heroBadgeDot: { backgroundColor: COLORS.green, borderRadius: 999, height: 7, width: 7 },
  heroBadgeText: { color: COLORS.inkSoft, fontSize: 12, fontWeight: '600' },
  heroTitle: { color: COLORS.ink, fontSize: 78, fontWeight: '800', letterSpacing: 0, lineHeight: 82 },
  heroTitleMobile: { fontSize: 44, letterSpacing: 0, lineHeight: 50 },
  heroTitleAccent: { color: COLORS.green, fontStyle: 'italic', fontWeight: '300' },
  titleMuted: { color: COLORS.mutedLight, fontWeight: '300' },
  titleMutedDark: { color: '#8DA0AE', fontWeight: '300' },
  heroSubtitle: { color: COLORS.muted, fontSize: 19, fontWeight: '400', lineHeight: 30, marginTop: 22, maxWidth: 520 },
  serviceTitle: { color: COLORS.ink, fontSize: 56, fontWeight: '800', letterSpacing: 0, lineHeight: 62 },
  serviceTitleMobile: { fontSize: 36, letterSpacing: 0, lineHeight: 42 },

  buttonRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 36 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.ink,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  ghostButton: { alignItems: 'center', flexDirection: 'row', gap: 10, paddingHorizontal: 6, paddingVertical: 14 },
  ghostText: { color: COLORS.ink, fontSize: 14, fontWeight: '700' },
  ghostArrow: {
    alignItems: 'center',
    backgroundColor: COLORS.greenSoft,
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  outlineButton: {
    borderColor: COLORS.borderStrong,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  outlineText: { color: COLORS.ink, fontSize: 14, fontWeight: '700' },

  heroProof: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 40 },
  heroProofItem: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  heroProofText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  heroProofDot: { backgroundColor: COLORS.borderStrong, borderRadius: 999, height: 3, width: 3 },

  heroVisual: { alignItems: 'center', flex: 1, height: 600, justifyContent: 'center', maxWidth: 580, position: 'relative' },
  heroVisualBackdrop: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.border,
    borderRadius: 32,
    borderWidth: 1,
    height: 540,
    position: 'absolute',
    right: 40,
    width: 360,
    transform: [{ rotate: '6deg' }],
    shadowColor: '#0A0F14',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.08,
    shadowRadius: 60,
  },
  heroPhoneShell: {
    backgroundColor: '#0A0F14',
    borderRadius: 36,
    height: 580,
    overflow: 'hidden',
    padding: 8,
    position: 'relative',
    width: 290,
    zIndex: 2,
    shadowColor: '#0A0F14',
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 0.18,
    shadowRadius: 80,
  },
  heroPhoneImg: { borderRadius: 28, height: '100%', width: '100%' },
  heroPhoneFloat: {
    backgroundColor: '#0A0F14',
    borderRadius: 30,
    bottom: 30,
    height: 380,
    overflow: 'hidden',
    padding: 6,
    position: 'absolute',
    right: -10,
    width: 190,
    zIndex: 3,
    transform: [{ rotate: '6deg' }],
    shadowColor: '#0A0F14',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.2,
    shadowRadius: 60,
  },
  floatChip: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    left: -10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 70,
    zIndex: 4,
    shadowColor: '#0A0F14',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
  },
  floatChipIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.greenSoft,
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  floatChipLabel: { color: COLORS.ink, fontSize: 13, fontWeight: '700' },
  floatChipMeta: { color: COLORS.muted, fontSize: 11, fontWeight: '500', marginTop: 2 },

  /* Trusted by */
  trustedBy: {
    alignItems: 'center',
    borderTopColor: COLORS.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 'auto',
    maxWidth: MAX,
    paddingHorizontal: 28,
    paddingVertical: 48,
    width: '100%',
  },
  trustedLabel: { color: COLORS.muted, fontFamily: MONO as any, fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 28, textTransform: 'uppercase' },
  trustedRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 48, justifyContent: 'center' },
  trustedRowMobile: { gap: 24 },
  trustedPartner: { color: COLORS.mutedLight, fontSize: 17, fontWeight: '800', letterSpacing: 0, opacity: 0.7 },

  /* Section */
  section: {
    marginHorizontal: 'auto',
    maxWidth: MAX,
    paddingHorizontal: 28,
    paddingVertical: 112,
    width: '100%',
  },
  sectionDark: {
    backgroundColor: COLORS.bgInk,
    marginHorizontal: 0,
    maxWidth: '100%',
    paddingHorizontal: 0,
  },
  sectionHeader: { marginBottom: 64, maxWidth: 720 },
  kickerWrap: { alignSelf: 'flex-start', marginBottom: 18 },
  kickerMono: { color: COLORS.green, fontFamily: MONO as any, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  kickerDarkWrap: { alignSelf: 'flex-start', marginBottom: 22 },
  kickerDark: { color: COLORS.greenBright, fontFamily: MONO as any, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  sectionTitle: { color: COLORS.ink, fontSize: 52, fontWeight: '800', letterSpacing: 0, lineHeight: 58 },
  sectionCopy: { color: COLORS.muted, fontSize: 18, fontWeight: '400', lineHeight: 28, marginTop: 22, maxWidth: 580 },

  /* Bento */
  bento: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  bentoMobile: { flexDirection: 'column' },
  bentoCard: {
    backgroundColor: COLORS.bgSoft,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    width: `${(100 - 4) / 4}%` as any,
    minWidth: 240,
  },
  bentoCardLarge: { width: `${(100 - 4) / 2}%` as any },
  bentoCardMobile: { width: '100%' },
  bentoCardInner: { gap: 20, minHeight: 200, padding: 22 },
  bentoCopy: { gap: 8 },
  bentoTag: { color: COLORS.mutedLight, fontFamily: MONO as any, fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  bentoTitle: { color: COLORS.ink, fontSize: 19, fontWeight: '800', letterSpacing: 0 },
  bentoDesc: { color: COLORS.muted, fontSize: 13, lineHeight: 20, marginTop: 2 },
  bentoLink: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 12 },
  bentoLinkText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  bentoVisual: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 130,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bentoImage: { height: '100%', width: '100%' },

  /* Security (dark) */
  securityWrap: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 80,
    marginHorizontal: 'auto',
    maxWidth: MAX,
    paddingHorizontal: 28,
    paddingVertical: 120,
    width: '100%',
  },
  stacked: { alignItems: 'stretch', flexDirection: 'column', gap: 48 },
  securityCopy: { flex: 1, maxWidth: 560 },
  securityTitle: { color: '#FFFFFF', fontSize: 52, fontWeight: '800', letterSpacing: 0, lineHeight: 58 },
  securityTitleMobile: { fontSize: 36, letterSpacing: 0, lineHeight: 42 },
  securitySubtitle: { color: '#8DA0AE', fontSize: 17, fontWeight: '400', lineHeight: 27, marginTop: 22 },
  securityBlock: { gap: 8, marginTop: 36 },

  securityPanel: {
    backgroundColor: '#0F1A23',
    borderColor: COLORS.borderDark,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minWidth: 320,
    padding: 28,
  },
  securityPanelHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  panelLabel: { color: COLORS.greenBright, fontFamily: MONO as any, fontSize: 10, fontWeight: '700', letterSpacing: 0.6, marginBottom: 6, textTransform: 'uppercase' },
  panelTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0 },
  panelStatus: {
    alignItems: 'center',
    backgroundColor: 'rgba(18,196,127,0.12)',
    borderColor: 'rgba(18,196,127,0.3)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  panelStatusDot: { backgroundColor: COLORS.greenBright, borderRadius: 999, height: 6, width: 6 },
  panelStatusText: { color: COLORS.greenBright, fontSize: 11, fontWeight: '700' },
  panelRow: {
    alignItems: 'center',
    borderTopColor: COLORS.borderDark,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  panelRowLeft: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  panelRowLabel: { color: '#D7DEE3', fontSize: 13, fontWeight: '600' },
  panelRowValue: { color: '#FFFFFF', fontFamily: MONO as any, fontSize: 12, fontWeight: '600' },

  trustLine: { alignItems: 'flex-start', flexDirection: 'row', gap: 14, paddingVertical: 10 },
  trustIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.greenSoft,
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  trustIconDark: { backgroundColor: 'rgba(18,196,127,0.12)' },
  trustCopy: { flex: 1 },
  trustTitle: { color: COLORS.ink, fontSize: 15, fontWeight: '800', letterSpacing: 0 },
  trustTitleDark: { color: '#FFFFFF' },
  trustText: { color: COLORS.muted, fontSize: 13, lineHeight: 20, marginTop: 4 },
  trustTextDark: { color: '#8DA0AE' },

  /* Preview */
  previewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  previewCard: {
    backgroundColor: COLORS.bgSoft,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minWidth: 220,
    overflow: 'hidden',
    padding: 24,
  },
  previewCardDark: { backgroundColor: COLORS.bgInk, borderColor: COLORS.borderDark },
  previewMeta: { marginBottom: 22 },
  previewLabel: { color: COLORS.ink, fontSize: 15, fontWeight: '800', letterSpacing: 0 },
  previewLabelDark: { color: '#FFFFFF' },
  previewCaption: { color: COLORS.muted, fontSize: 12, fontWeight: '500', marginTop: 4 },
  previewCaptionDark: { color: '#8DA0AE' },
  previewFrame: {
    alignSelf: 'center',
    backgroundColor: '#0A0F14',
    borderRadius: 22,
    height: 380,
    overflow: 'hidden',
    padding: 6,
    width: 200,
  },
  previewImage: { borderRadius: 16, height: '100%', width: '100%' },

  /* Metrics */
  metricsBand: {
    backgroundColor: COLORS.bgSoft,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 36,
  },
  metricsBandMobile: { flexDirection: 'column', gap: 20, paddingVertical: 24 },
  metricCell: { flex: 1, paddingHorizontal: 24 },
  metricCellBorder: { borderRightColor: COLORS.border, borderRightWidth: StyleSheet.hairlineWidth },
  metricValue: { color: COLORS.ink, fontSize: 44, fontWeight: '800', letterSpacing: 0, lineHeight: 48 },
  metricLabel: { color: COLORS.ink, fontSize: 14, fontWeight: '700', marginTop: 12 },
  metricSub: { color: COLORS.muted, fontSize: 12, fontWeight: '500', marginTop: 4 },

  /* Service hero (single service) */
  serviceHero: { paddingVertical: 80 },
  serviceVisual: {
    alignItems: 'center',
    flex: 1,
    height: 500,
    justifyContent: 'center',
    maxWidth: 480,
    position: 'relative',
  },
  serviceVisualGlow: {
    backgroundColor: COLORS.greenSoft,
    borderRadius: 999,
    height: 380,
    opacity: 0.5,
    position: 'absolute',
    width: 380,
  },
  serviceScreen: {
    borderRadius: 22,
    height: 460,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#0A0F14',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.12,
    shadowRadius: 60,
  },

  /* Final CTA */
  finalCta: { backgroundColor: COLORS.bg, paddingHorizontal: 28, paddingVertical: 80 },
  finalCtaInner: {
    backgroundColor: COLORS.bgInk,
    borderRadius: 24,
    marginHorizontal: 'auto',
    maxWidth: MAX,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  finalCtaMesh: {
    backgroundColor: COLORS.green,
    borderRadius: 999,
    height: 600,
    opacity: 0.1,
    position: 'absolute',
    right: -200,
    top: -250,
    width: 600,
  },
  finalCtaContent: { alignItems: 'center', gap: 14, paddingHorizontal: 28, paddingVertical: 96 },
  finalCtaIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(18,196,127,0.12)',
    borderColor: 'rgba(18,196,127,0.3)',
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    marginBottom: 14,
    width: 48,
  },
  finalTitle: { color: '#FFFFFF', fontSize: 46, fontWeight: '800', letterSpacing: 0, lineHeight: 52, maxWidth: 640, textAlign: 'center' },
  finalText: { color: '#8DA0AE', fontSize: 17, lineHeight: 26, marginTop: 12, maxWidth: 520, textAlign: 'center' },
  finalActions: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginTop: 24 },

  /* Footer */
  footer: { backgroundColor: COLORS.bg, borderTopColor: COLORS.border, borderTopWidth: StyleSheet.hairlineWidth },
  footerInner: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'space-between',
    marginHorizontal: 'auto',
    maxWidth: MAX,
    paddingHorizontal: 28,
    paddingVertical: 36,
    width: '100%',
  },
  footerBrandWrap: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  footerCopy: { color: COLORS.muted, fontSize: 13, fontWeight: '500' },
  footerLinks: { flexDirection: 'row', gap: 24 },
  footerLink: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
});
