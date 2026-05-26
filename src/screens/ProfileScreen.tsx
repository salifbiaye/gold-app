import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Lock,
  LogOut,
  MapPin,
  MessageCircle,
  Phone,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { colors as appColors } from '../theme/colors';
import { IconComponent } from '../types/icon';

type ProfileSection = {
  id: string;
  title: string;
  icon: IconComponent;
  rows: string[];
};

const sections: ProfileSection[] = [
  {
    id: 'personal',
    title: 'Informations personnelles',
    icon: UserRound,
    rows: ['Nom complet: Salif Biaye', 'Telephone: +221 77 123 45 67', 'Email: salif@goldapp.sn'],
  },
  {
    id: 'addresses',
    title: 'Mes adresses',
    icon: MapPin,
    rows: ['Domicile: Almadies, Dakar', 'Bureau: Point E', 'Ajouter une nouvelle adresse'],
  },
  {
    id: 'payments',
    title: 'Mes moyens de paiement',
    icon: CreditCard,
    rows: ['Wallet Gold App actif', 'Carte Visa terminant par 2048', 'Ajouter une carte ou un compte'],
  },
  {
    id: 'security',
    title: 'Securite',
    icon: Lock,
    rows: ['Code PIN active', 'Authentification biometrique', 'Changer le mot de passe'],
  },
  {
    id: 'support',
    title: 'Aide & Support',
    icon: HelpCircle,
    rows: ["Centre d'aide", 'Contacter le support', 'Conditions et confidentialité'],
  },
];

const SUPPORT_ROW_ACTIONS: Record<string, string> = {
  "Centre d'aide": 'help',
  'Contacter le support': 'contact',
  'Conditions et confidentialité': 'terms',
};

export function ProfileScreen() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const sheetY = useRef(new Animated.Value(300)).current;
  const sheetBackdrop = useRef(new Animated.Value(0)).current;
  const { logout } = useAuth();
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const toggleSection = (id: string) => {
    setOpenSection((current) => (current === id ? null : id));
  };

  const openSupportSheet = () => {
    setSupportOpen(true);
    Animated.parallel([
      Animated.spring(sheetY, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      Animated.timing(sheetBackdrop, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start();
  };

  const closeSupportSheet = () => {
    Animated.parallel([
      Animated.timing(sheetY, { toValue: 300, duration: 200, useNativeDriver: true }),
      Animated.timing(sheetBackdrop, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => setSupportOpen(false));
  };

  const handleSupportRow = (row: string) => {
    const action = SUPPORT_ROW_ACTIONS[row];
    if (action === 'contact') {
      openSupportSheet();
    } else if (action === 'help') {
      Linking.openURL('https://goldapp.sn/aide');
    } else if (action === 'terms') {
      Linking.openURL('https://goldapp.sn/conditions');
    }
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  return (
    <Screen>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.78} onPress={goBack}>
          <ArrowLeft color={colors.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.headerGhost} />
      </View>

      <View style={styles.profileCard}>
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.profileCover}>
          <View style={styles.coverRingLarge} />
          <View style={styles.coverRingSmall} />
        </LinearGradient>

        <View style={styles.profileBody}>
          <Image source={require('../../assets/images/avatar-salif.jpg')} style={styles.avatar} />
          <View style={styles.profileText}>
            <Text style={styles.name}>Salif Biaye</Text>
            <Text style={styles.handle}>@salif.biaye</Text>
            <View style={styles.verifiedRow}>
              <ShieldCheck color={colors.primary} size={14} />
              <Text style={styles.verified}>Profil verifie</Text>
            </View>
          </View>

          <View style={styles.profileActions}>
            <TouchableOpacity
              style={styles.profilePill}
              activeOpacity={0.78}
              onPress={() => setOpenSection('personal')}
            >
              <UserRound color={colors.text} size={16} />
              <Text style={styles.profilePillText}>Infos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profilePill}
              activeOpacity={0.78}
              onPress={() => navigation.navigate('Settings')}
            >
              <Settings color={colors.text} size={16} />
              <Text style={styles.profilePillText}>Parametres</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.identityCard}>
        <View style={styles.identityCopy}>
          <Text style={styles.identityTitle}>Compte confirme</Text>
          <Text style={styles.identitySub}>+221 77 123 45 67 - Wallet actif</Text>
        </View>
        <View style={styles.identityBadge}>
          <ShieldCheck color={colors.primary} size={16} />
        </View>
      </View>

      <View style={styles.menu}>
        {sections.map((section, sectionIndex) => {
          const Icon = section.icon;
          const isOpen = openSection === section.id;
          const Chevron = isOpen ? ChevronDown : ChevronRight;
          const isLast = sectionIndex === sections.length - 1;

          return (
            <View key={section.id} style={[styles.section, isLast && { borderBottomWidth: 0 }]}>
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.78} onPress={() => toggleSection(section.id)}>
                <View style={styles.itemLeft}>
                  <Icon color={colors.text} size={17} strokeWidth={2} />
                  <Text style={styles.menuLabel}>{section.title}</Text>
                </View>
                <Chevron color={colors.muted} size={18} />
              </TouchableOpacity>

              {isOpen ? (
                <View style={styles.drawer}>
                  {section.rows.map((row, rowIndex) => (
                    <TouchableOpacity
                      key={row}
                      style={[
                        styles.drawerRow,
                        section.id === 'support' && styles.drawerRowSupport,
                        rowIndex < section.rows.length - 1 && styles.drawerRowBorder,
                      ]}
                      activeOpacity={0.6}
                      onPress={section.id === 'support' ? () => handleSupportRow(row) : undefined}
                    >
                      <Text style={[styles.drawerText, { flex: 1 }]}>{row}</Text>
                      {section.id === 'support' && <ChevronRight color={colors.muted} size={14} />}
                    </TouchableOpacity>
                  ))}

                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      {/* Parametres — direct nav */}
      {/* Deconnexion */}
      <View style={styles.logoutCard}>
        <TouchableOpacity style={styles.logoutRow} activeOpacity={0.78} onPress={logout}>
          <LogOut color={colors.muted} size={17} />
          <Text style={styles.logoutText}>Se deconnecter</Text>
        </TouchableOpacity>
      </View>

      {/* Support bottom sheet */}
      <Modal transparent visible={supportOpen} animationType="none" onRequestClose={closeSupportSheet}>
        <TouchableWithoutFeedback onPress={closeSupportSheet}>
          <Animated.View style={[styles.sheetBackdrop, { opacity: sheetBackdrop }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.sheet, { backgroundColor: colors.surface, transform: [{ translateY: sheetY }] }]}
        >
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Contacter le support</Text>
            <TouchableOpacity onPress={closeSupportSheet}>
              <X color={colors.muted} size={20} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.sheetRow, { borderBottomColor: colors.border }]}
            activeOpacity={0.72}
            onPress={() => { closeSupportSheet(); Linking.openURL('https://wa.me/221770000000'); }}
          >
            <View style={[styles.sheetIcon, { backgroundColor: '#25D36614' }]}>
              <MessageCircle color="#25D366" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sheetRowTitle, { color: colors.text }]}>WhatsApp</Text>
              <Text style={[styles.sheetRowSub, { color: colors.muted }]}>Messages et notes vocales</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sheetRow, { borderBottomWidth: 0 }]}
            activeOpacity={0.72}
            onPress={() => { closeSupportSheet(); Linking.openURL('tel:+221800001234'); }}
          >
            <View style={[styles.sheetIcon, { backgroundColor: `${colors.primary}14` }]}>
              <Phone color={colors.primary} size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sheetRowTitle, { color: colors.text }]}>Appel gratuit</Text>
              <Text style={[styles.sheetRowSub, { color: colors.muted }]}>Disponible jusqu'à 21h00</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </Screen>
  );
}

function createStyles(colors: typeof appColors) {
  return StyleSheet.create({
    topHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 12,
      paddingTop: 4,
    },
    backButton: {
      alignItems: 'center',
      borderRadius: 18,
      height: 36,
      justifyContent: 'center',
      width: 36,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '900',
    },
    headerGhost: {
      height: 36,
      width: 36,
    },
    profileCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      marginTop: 14,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.06,
      shadowRadius: 20,
      elevation: 3,
    },
    profileCover: {
      height: 92,
      overflow: 'hidden',
      position: 'relative',
    },
    coverRingLarge: {
      borderColor: 'rgba(255,255,255,0.16)',
      borderRadius: 90,
      borderWidth: 13,
      height: 180,
      position: 'absolute',
      right: -36,
      top: -82,
      width: 180,
    },
    coverRingSmall: {
      borderColor: 'rgba(255,255,255,0.12)',
      borderRadius: 74,
      borderWidth: 12,
      height: 148,
      left: 70,
      position: 'absolute',
      top: -44,
      width: 148,
    },
    profileBody: {
      padding: 16,
      paddingTop: 0,
    },
    avatar: {
      borderColor: '#FFFFFF',
      borderRadius: 34,
      borderWidth: 3,
      height: 68,
      marginTop: -34,
      width: 68,
    },
    profileText: {
      marginTop: 8,
    },
    name: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '900',
    },
    handle: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '800',
      marginTop: 3,
    },
    verified: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '800',
    },
    verifiedRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 4,
      marginTop: 5,
    },
    profileActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 16,
    },
    profilePill: {
      alignItems: 'center',
      borderColor: colors.border,
      borderRadius: 18,
      borderWidth: 1,
      flex: 1,
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'center',
      minHeight: 38,
      paddingHorizontal: 12,
    },
    profilePillText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '900',
    },
    identityCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      marginTop: 14,
      padding: 14,
    },
    identityCopy: {
      flex: 1,
    },
    identityTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '900',
    },
    identitySub: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 17,
      marginTop: 4,
    },
    identityBadge: {
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 16,
      height: 32,
      justifyContent: 'center',
      width: 32,
    },
    menu: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginTop: 18,
      overflow: 'hidden',
    },
    section: {
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
    },
    menuItem: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: 48,
      paddingHorizontal: 16,
    },
    itemLeft: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      gap: 10,
    },
    menuLabel: {
      color: colors.text,
      flex: 1,
      fontSize: 13,
      fontWeight: '800',
    },
    // Drawer Apple-style : fond = surface (blanc en light, surface sombre en dark), pas de gris fort
    drawer: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      borderTopWidth: StyleSheet.hairlineWidth,
      paddingBottom: 14,
      paddingHorizontal: 16,
      paddingTop: 4,
    },
    drawerRow: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingVertical: 11,
    },
    drawerRowSupport: {
      paddingVertical: 14,
    },
    drawerRowBorder: {
      borderBottomColor: colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    drawerText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '500',
    },
    drawerTextMuted: {
      color: colors.muted,
      fontSize: 12,
      marginTop: 2,
    },
    settingsNav: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
      minHeight: 48,
      paddingHorizontal: 16,
    },
    logoutCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginTop: 12,
      overflow: 'hidden',
    },
    logoutRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
      minHeight: 48,
      paddingHorizontal: 16,
    },
    logoutText: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '700',
    },
    sheetBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.48)',
    },
    sheet: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      bottom: 0,
      left: 0,
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
      paddingHorizontal: 20,
      paddingTop: 20,
      position: 'absolute',
      right: 0,
      elevation: 12,
    },
    sheetHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 18,
    },
    sheetTitle: {
      fontSize: 16,
      fontWeight: '900',
    },
    sheetRow: {
      alignItems: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      gap: 14,
      paddingVertical: 16,
    },
    sheetIcon: {
      alignItems: 'center',
      borderRadius: 12,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    sheetRowTitle: {
      fontSize: 14,
      fontWeight: '700',
    },
    sheetRowSub: {
      fontSize: 12,
      fontWeight: '500',
      marginTop: 2,
    },
  });
}
