import { ReactNode, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Bell,
  Building2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CreditCard,
  HeartPulse,
  Headphones,
  Home,
  LogOut,
  Map,
  Menu,
  MessageCircle,
  Phone,
  Settings,
  ShieldCheck,
  Truck,
  UserRound,
  Wallet,
  X,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import type { IconComponent } from '../types/icon';

const SCREEN_W = Dimensions.get('window').width;
const DRAWER_W = Math.min(SCREEN_W * 0.82, 320);
const UNREAD_COUNT = 2;

// ─── Drawer data ─────────────────────────────────────────────────────────────

type NavChild = { icon: IconComponent; label: string; route: string };
type NavItem = {
  icon: IconComponent;
  label: string;
  tab?: string;
  screen?: string;
  children?: NavChild[];
  action?: 'support';
};

const NAV_ITEMS: NavItem[] = [
  {
    icon: Home,
    label: 'Accueil',
    tab: 'HomeStack',
    children: [
      { icon: Truck, label: 'Transport', route: 'Transport' },
      { icon: Building2, label: 'Immobilier', route: 'RealEstate' },
      { icon: HeartPulse, label: 'Santé', route: 'Health' },
      { icon: CreditCard, label: 'Paiements', route: 'Payments' },
      { icon: Map, label: 'Carte', route: 'Map' },
    ],
  },
  { icon: MessageCircle, label: 'Chat IA', tab: 'Chat' },
  { icon: ClipboardList, label: 'Commandes', tab: 'Orders' },
  { icon: Wallet, label: 'Wallet', tab: 'Wallet' },
  { icon: UserRound, label: 'Mon Profil', screen: 'Profile' },
  { icon: Bell, label: 'Notifications', screen: 'Notifications' },
  { icon: Headphones, label: 'Support', action: 'support' },
  { icon: Settings, label: 'Parametres', screen: 'Settings' },
];

// ─── Component ───────────────────────────────────────────────────────────────

type AppHeaderProps = {
  action?: ReactNode;
  title?: string;
};

export function AppHeader({ action, title }: AppHeaderProps) {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const { auth, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const slideX = useRef(new Animated.Value(-DRAWER_W)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(300)).current;
  const sheetBackdrop = useRef(new Animated.Value(0)).current;

  // ── Drawer animations ──

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(slideX, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = (cb?: () => void) => {
    Animated.parallel([
      Animated.spring(slideX, { toValue: -DRAWER_W, tension: 65, friction: 11, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setDrawerOpen(false);
      setExpanded(null);
      cb?.();
    });
  };

  // ── Support sheet ──

  const openSupport = () => {
    closeDrawer(() => {
      setSupportOpen(true);
      Animated.parallel([
        Animated.spring(sheetY, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
        Animated.timing(sheetBackdrop, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]).start();
    });
  };

  const closeSupport = () => {
    Animated.parallel([
      Animated.timing(sheetY, { toValue: 300, duration: 200, useNativeDriver: true }),
      Animated.timing(sheetBackdrop, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => setSupportOpen(false));
  };

  // ── Navigation ──

  const goTo = (tab?: string, screen?: string, childRoute?: string) => {
    closeDrawer(() => {
      if (screen) {
        navigation.navigate(screen);
      } else if (childRoute) {
        navigation.navigate('MainTabs', { screen: 'HomeStack', params: { screen: childRoute } });
      } else if (tab) {
        navigation.navigate('MainTabs', { screen: tab });
      }
    });
  };

  const toggleExpand = (label: string) =>
    setExpanded((p) => (p === label ? null : label));

  return (
    <>
      {/* ── Header bar ── */}
      <View style={styles.bar}>
        <TouchableOpacity
          onPress={openDrawer}
          activeOpacity={0.82}
          style={[styles.menuBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Menu color={colors.primary} size={21} strokeWidth={2.2} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        {action ?? (
          <TouchableOpacity
            style={[styles.bellBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Bell color={colors.text} size={18} strokeWidth={2.2} />
            {UNREAD_COUNT > 0 && (
              <View style={[styles.bellBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.bellBadgeText}>{UNREAD_COUNT}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.82} style={styles.avatarWrap}>
          <Image source={require('../../assets/images/avatar-salif.jpg')} style={styles.avatar} />
          <View style={[styles.onlineDot, { borderColor: colors.background }]} />
        </TouchableOpacity>
      </View>

      {title && (
        <View style={styles.titleRow}>
          <View style={[styles.titleDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.titleText, { color: colors.text }]}>{title}</Text>
        </View>
      )}

      {/* ── Side drawer ── */}
      <Modal transparent visible={drawerOpen} animationType="none" onRequestClose={() => closeDrawer()}>
        <TouchableWithoutFeedback onPress={() => closeDrawer()}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.panel, { backgroundColor: colors.background, transform: [{ translateX: slideX }] }]}
        >
          {/* Panel header */}
          <View style={styles.panelHeader}>
            <Text style={[styles.panelBrand, { color: colors.text }]}>
              GOLD <Text style={{ color: colors.primary }}>APP</Text>
            </Text>
            <View style={styles.panelHeaderRight}>
              <TouchableOpacity
                style={[styles.headerIconBtn, { backgroundColor: colors.surface }]}
                onPress={() => closeDrawer()}
              >
                <X color={colors.muted} size={15} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile mini-card */}
          <TouchableOpacity
            style={[styles.profileRow, { backgroundColor: colors.surface }]}
            activeOpacity={0.78}
            onPress={() => goTo(undefined, 'Profile')}
          >
            <Image source={require('../../assets/images/avatar-salif.jpg')} style={styles.profileAvatar} />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]} numberOfLines={1}>
                {auth.user.fullName}
              </Text>
              <Text style={[styles.profileDetail, { color: colors.muted }]}>{auth.user.phone}</Text>
            </View>
            <View style={[styles.verifiedPill, { backgroundColor: colors.primarySoft }]}>
              <ShieldCheck color={colors.primary} size={11} />
              <Text style={[styles.verifiedLabel, { color: colors.primary }]}>Vérifié</Text>
            </View>
          </TouchableOpacity>

          {/* Navigation */}
          <ScrollView
            style={styles.navScroll}
            contentContainerStyle={styles.navContent}
            showsVerticalScrollIndicator={false}
          >
            {NAV_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const hasChildren = !!item.children?.length;
              const isOpen = expanded === item.label;
              const Chevron = isOpen ? ChevronDown : ChevronRight;

              const showOtherTitle = item.label === 'Notifications';

              return (
                <View key={item.label}>
                  {showOtherTitle && (
                    <>
                      <View style={[styles.divider, { backgroundColor: colors.border }]} />
                      <Text style={[styles.navSectionTitle, { color: colors.muted }]}>Autres</Text>
                    </>
                  )}
                  <TouchableOpacity
                    style={styles.navRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (item.action === 'support') {
                        openSupport();
                      } else if (hasChildren) {
                        toggleExpand(item.label);
                      } else {
                        goTo(item.tab, item.screen);
                      }
                    }}
                  >
                    <Icon color={colors.muted} size={18} strokeWidth={1.8} />
                    <Text style={[styles.navLabel, { color: colors.text }]}>{item.label}</Text>
                    {hasChildren && <Chevron color={colors.muted} size={16} />}
                  </TouchableOpacity>

                  {hasChildren && isOpen && (
                    <View style={[styles.subList, { borderLeftColor: colors.border }]}>
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <TouchableOpacity
                            key={child.label}
                            style={styles.subRow}
                            activeOpacity={0.7}
                            onPress={() => goTo(undefined, undefined, child.route)}
                          >
                            <ChildIcon color={colors.muted} size={15} strokeWidth={1.6} />
                            <Text style={[styles.subLabel, { color: colors.text }]}>{child.label}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.panelFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.logoutRow, { backgroundColor: colors.surface }]}
              activeOpacity={0.78}
              onPress={() => closeDrawer(logout)}
            >
              <LogOut color={colors.muted} size={17} />
              <Text style={[styles.logoutLabel, { color: colors.muted }]}>Se déconnecter</Text>
            </TouchableOpacity>
            <Text style={[styles.version, { color: colors.muted }]}>Gold App v1.0.0</Text>
          </View>
        </Animated.View>
      </Modal>

      {/* ── Support bottom sheet ── */}
      <Modal transparent visible={supportOpen} animationType="none" onRequestClose={closeSupport}>
        <TouchableWithoutFeedback onPress={closeSupport}>
          <Animated.View style={[styles.backdrop, { opacity: sheetBackdrop }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, transform: [{ translateY: sheetY }] },
          ]}
        >
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Contacter le support</Text>
            <TouchableOpacity onPress={closeSupport}>
              <X color={colors.muted} size={20} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.sheetRow, { borderBottomColor: colors.border }]}
            activeOpacity={0.72}
            onPress={() => {
              closeSupport();
              Linking.openURL('https://wa.me/221770000000');
            }}
          >
            <View style={[styles.sheetIcon, { backgroundColor: '#25D36614' }]}>
              <MessageCircle color="#25D366" size={20} />
            </View>
            <View style={styles.sheetRowText}>
              <Text style={[styles.sheetRowTitle, { color: colors.text }]}>WhatsApp</Text>
              <Text style={[styles.sheetRowSub, { color: colors.muted }]}>Messages et notes vocales</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sheetRow, { borderBottomWidth: 0 }]}
            activeOpacity={0.72}
            onPress={() => {
              closeSupport();
              Linking.openURL('tel:+221800001234');
            }}
          >
            <View style={[styles.sheetIcon, { backgroundColor: `${colors.primary}14` }]}>
              <Phone color={colors.primary} size={20} />
            </View>
            <View style={styles.sheetRowText}>
              <Text style={[styles.sheetRowTitle, { color: colors.text }]}>Appel gratuit</Text>
              <Text style={[styles.sheetRowSub, { color: colors.muted }]}>Disponible jusqu'à 21h00</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Header bar
  bar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
    paddingTop: 4,
  },
  menuBtn: {
    alignItems: 'center',
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerSpacer: { flex: 1 },
  avatarWrap: { position: 'relative' },
  avatar: { borderRadius: 21, height: 42, width: 42 },
  onlineDot: {
    backgroundColor: '#22C55E',
    borderRadius: 4,
    borderWidth: 2,
    bottom: 0,
    height: 8,
    position: 'absolute',
    right: -1,
    width: 8,
  },
  bellBtn: {
    alignItems: 'center',
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  bellBadge: {
    alignItems: 'center',
    borderRadius: 7,
    height: 14,
    justifyContent: 'center',
    minWidth: 14,
    paddingHorizontal: 3,
    position: 'absolute',
    right: 5,
    top: 5,
  },
  bellBadgeText: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
    marginTop: 12,
  },
  titleDot: { borderRadius: 3, height: 6, width: 6 },
  titleText: { fontSize: 18, fontWeight: '900' },

  // Drawer
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.48)' },
  panel: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: DRAWER_W,
    paddingTop: Platform.OS === 'ios' ? 58 : 40,
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  panelBrand: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  panelHeaderRight: { flexDirection: 'row', gap: 8 },
  headerIconBtn: {
    alignItems: 'center',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  profileRow: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    padding: 12,
  },
  profileAvatar: { borderRadius: 22, height: 44, width: 44 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 14, fontWeight: '800' },
  profileDetail: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  verifiedPill: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  verifiedLabel: { fontSize: 10, fontWeight: '700' },
  navScroll: { flex: 1, marginTop: 10 },
  navContent: { paddingHorizontal: 16, paddingBottom: 12 },
  navRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 13,
  },
  navLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  subList: { borderLeftWidth: 2, marginLeft: 8, paddingLeft: 20 },
  subRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  subLabel: { fontSize: 13, fontWeight: '500' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 8 },
  navSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  panelFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    paddingTop: 14,
  },
  logoutRow: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  logoutLabel: { fontSize: 14, fontWeight: '600' },
  version: { fontSize: 10, fontWeight: '600', marginTop: 12, textAlign: 'center' },

  // Support sheet
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sheetTitle: { fontSize: 16, fontWeight: '900' },
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
  sheetRowText: { flex: 1 },
  sheetRowTitle: { fontSize: 14, fontWeight: '700' },
  sheetRowSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },
});
