import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { NavigationContext } from '@react-navigation/core';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, ClipboardList, Home, MessageCircle, Settings, Wallet } from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { QRScannerOverlay } from '../components/QRScannerOverlay';
import { AuthProvider } from '../context/AuthContext';
import { ScannerProvider } from '../context/ScannerContext';
import { useAppTheme } from '../context/ThemeContext';
import { HomeStackParamList, MainTabParamList, RootStackParamList } from '../types/navigation';
import { AuthResult } from '../types/auth';
import { AuthScreen } from '../screens/AuthScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { HealthScreen } from '../screens/HealthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { PaymentsScreen } from '../screens/PaymentsScreen';
import { PiSpiScreen } from '../screens/PiSpiScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RealEstateScreen } from '../screens/RealEstateScreen';
import { DeliveryScreen, EducationScreen, FoodScreen, TourismScreen } from '../screens/ServiceCategoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { TransportScreen } from '../screens/TransportScreen';
import { WalletScreen } from '../screens/WalletScreen';
import type { IconComponent } from '../types/icon';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createMaterialTopTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const SIDEBAR_W = 260;
const piSpiLogo = require('../../assets/images/pi-spi.logo.png');

type TabConfigItem = { icon: IconComponent; image?: never; label: string } | { icon?: never; image: ImageSourcePropType; label: string };

const tabConfig: Record<keyof MainTabParamList, TabConfigItem> = {
  HomeStack: { icon: Home,          label: 'Accueil'   },
  Chat:      { icon: MessageCircle, label: 'Chat IA'   },
  Orders:    { icon: ClipboardList, label: 'Commandes' },
  Wallet:    { icon: Wallet,        label: 'Wallet'    },
  PiSpi:     { image: piSpiLogo,    label: 'PI-SPI'    },
};

type SecondaryKey = 'Notifications' | 'Settings';

const SECONDARY_ITEMS: { key: SecondaryKey; label: string; icon: IconComponent }[] = [
  { key: 'Notifications', label: 'Notifications', icon: Bell      },
  { key: 'Settings',      label: 'Paramètres',    icon: Settings  },
];

const SECONDARY_SCREENS: Record<SecondaryKey, React.ComponentType<any>> = {
  Notifications: NotificationsScreen,
  Settings:      SettingsScreen,
};

/** Intercepte goBack/navigate pour les écrans secondaires rendus inline sur desktop. */
function DesktopNavWrapper({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const nav = useNavigation<any>();
  const customNav = {
    ...nav,
    canGoBack: () => true,
    goBack:    onClose,
    navigate:  (name: string, params?: any) => {
      if (name === 'MainTabs') { onClose(); return; }
      nav.navigate(name, params);
    },
  } as any;
  return <NavigationContext.Provider value={customNav}>{children}</NavigationContext.Provider>;
}

function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <HomeStack.Screen name="Home"       component={HomeScreen}      />
      <HomeStack.Screen name="Transport"  component={TransportScreen} />
      <HomeStack.Screen name="RealEstate" component={RealEstateScreen}/>
      <HomeStack.Screen name="Health"     component={HealthScreen}    />
      <HomeStack.Screen name="Delivery"   component={DeliveryScreen}  />
      <HomeStack.Screen name="Food"       component={FoodScreen}      />
      <HomeStack.Screen name="Education"  component={EducationScreen} />
      <HomeStack.Screen name="Tourism"    component={TourismScreen}   />
      <HomeStack.Screen name="Payments"   component={PaymentsScreen}  />
      <HomeStack.Screen name="Map"        component={MapScreen}       />
    </HomeStack.Navigator>
  );
}

function MobileTabButton({
  activeColor,
  cfg,
  inactiveColor,
  index,
  onPress,
  position,
}: {
  activeColor: string;
  cfg: TabConfigItem;
  inactiveColor: string;
  index: number;
  onPress: () => void;
  position: any;
}) {
  const inputRange = Object.keys(tabConfig).map((_, i) => i);
  const activeOpacity = position.interpolate({
    inputRange,
    outputRange: inputRange.map((i) => (i === index ? 1 : 0)),
    extrapolate: 'clamp',
  });
  const inactiveOpacity = position.interpolate({
    inputRange,
    outputRange: inputRange.map((i) => (i === index ? 0 : 1)),
    extrapolate: 'clamp',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={styles.mobileTab}
    >
      <View style={styles.mobileIconSlot}>
        <Animated.View style={[styles.mobileLayer, { opacity: inactiveOpacity }]}>
          <TabIcon cfg={cfg} color={inactiveColor} />
        </Animated.View>
        <Animated.View style={[styles.mobileLayer, { opacity: activeOpacity }]}>
          <TabIcon cfg={cfg} color={activeColor} active />
        </Animated.View>
      </View>

      <View style={styles.mobileLabelSlot}>
        <Animated.Text style={[styles.tabLabel, styles.mobileLayer, { color: inactiveColor, opacity: inactiveOpacity }]}>
          {cfg.label}
        </Animated.Text>
        <Animated.Text style={[styles.tabLabel, styles.mobileLayer, { color: activeColor, opacity: activeOpacity }]}>
          {cfg.label}
        </Animated.Text>
      </View>
    </TouchableOpacity>
  );
}

function TabIcon({ active, cfg, color, size = 25 }: { active?: boolean; cfg: TabConfigItem; color: string; size?: number }) {
  if ('image' in cfg) {
    return (
      <Image
        source={cfg.image}
        resizeMode="contain"
        style={[styles.tabImage, { height: size, opacity: active ? 1 : 0.58, width: size }]}
      />
    );
  }

  const Icon = cfg.icon;
  return <Icon color={color} size={size} strokeWidth={2.25} />;
}

function MainTabs({ navigation: stackNav }: { navigation: any }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const padBottom = Math.max(insets.bottom, 10);

  const tabNavRef = useRef<any>(null);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  /* On desktop, secondary pages (Profile/Notifs/Settings) render inline
     so the sidebar stays visible. null = show main tabs.              */
  const [desktopPage, setDesktopPage] = useState<SecondaryKey | null>(null);

  const handleSecondaryNav = (key: SecondaryKey) => {
    if (isDesktop) {
      setDesktopPage((prev) => (prev === key ? null : key));
    } else {
      stackNav.navigate(key);
    }
  };

  const closeDesktopPage = () => setDesktopPage(null);

  const DesktopSecondaryContent = desktopPage ? SECONDARY_SCREENS[desktopPage] : null;

  return (
    <View
      style={[
        styles.shell,
        { backgroundColor: colors.background },
        isDesktop && styles.shellRow,
      ]}
    >
      {/* ── Desktop sidebar ──────────────────────────────────────── */}
      {isDesktop && (
        <View
          style={[
            styles.sidebar,
            {
              backgroundColor: colors.surface,
              borderRightColor: colors.border,
              paddingTop: insets.top + 8,
            },
          ]}
        >
          {/* Brand */}
          <View style={[styles.sidebarBrand, { borderBottomColor: colors.border }]}>
            <View style={[styles.brandDot, { backgroundColor: colors.primary }]} />
            <View>
              <Text style={[styles.brandName, { color: colors.text }]}>Gold App</Text>
              <Text style={[styles.brandSub, { color: colors.muted }]}>Superapp Dakar</Text>
            </View>
          </View>

          <View style={styles.sidebarBody}>
            {/* Primary nav items */}
            <View style={styles.sidebarSection}>
              <Text style={[styles.sidebarGroupLabel, { color: colors.muted }]}>NAVIGATION</Text>
              {(
                Object.entries(tabConfig) as [keyof MainTabParamList, TabConfigItem][]
              ).map(([key, cfg], i) => {
                const active = desktopPage === null && activeTabIdx === i;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      setDesktopPage(null);
                      tabNavRef.current?.navigate(key);
                    }}
                    activeOpacity={0.78}
                    style={[styles.sidebarItem, active && { backgroundColor: colors.primarySoft }]}
                  >
                    <TabIcon cfg={cfg} color={active ? colors.primary : colors.muted} active={active} size={20} />
                    <Text style={[styles.sidebarLabel, { color: active ? colors.primary : colors.text }]}>
                      {cfg.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Secondary items pinned to bottom */}
            <View>
              <View style={[styles.sidebarDivider, { backgroundColor: colors.border }]} />
              <View style={styles.sidebarSection}>
                <Text style={[styles.sidebarGroupLabel, { color: colors.muted }]}>COMPTE</Text>
                {SECONDARY_ITEMS.map(({ key, label, icon: Icon }) => {
                  const active = desktopPage === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => handleSecondaryNav(key)}
                      activeOpacity={0.78}
                      style={[styles.sidebarItem, active && { backgroundColor: colors.primarySoft }]}
                    >
                      <Icon color={active ? colors.primary : colors.muted} size={20} strokeWidth={2.2} />
                      <Text style={[styles.sidebarLabel, { color: active ? colors.primary : colors.text }]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* ── Content area ─────────────────────────────────────────── */}
      <View style={styles.content}>
        {!isDesktop && !desktopPage ? (
          <View
            style={[
              styles.mobileHeader,
              {
                backgroundColor: colors.background,
                borderBottomColor: colors.border,
                paddingTop: insets.top + 4,
              },
            ]}
          >
            <AppHeader />
          </View>
        ) : null}
        <View style={styles.tabsBody}>
          {/* Desktop: secondary screens render inline (sidebar stays visible) */}
          {isDesktop && DesktopSecondaryContent ? (
            <DesktopNavWrapper onClose={closeDesktopPage}>
              <DesktopSecondaryContent />
            </DesktopNavWrapper>
          ) : (
            <Tab.Navigator
              id="MainTabs"
              tabBarPosition="bottom"
              screenListeners={{
                state: (e: any) => {
                  const idx = e.data?.state?.index;
                  if (typeof idx === 'number') setActiveTabIdx(idx);
                },
              }}
              screenOptions={() => ({
                lazy: true,
                swipeEnabled: !isDesktop,
                animationEnabled: !isDesktop,
              })}
              tabBar={(props) => {
                tabNavRef.current = props.navigation;

                if (isDesktop) return <View style={{ height: 0 }} />;

                return (
                  <View
                    style={[
                      styles.mobileBar,
                      {
                        backgroundColor: colors.surface,
                        borderTopColor: colors.border,
                        paddingBottom: padBottom,
                      },
                    ]}
                  >
                    {props.state.routes.map((route, i) => {
                      const cfg = tabConfig[route.name as keyof MainTabParamList];
                      return (
                        <MobileTabButton
                          activeColor={colors.primary}
                          cfg={cfg}
                          inactiveColor="#7A8490"
                          index={i}
                          key={route.key}
                          onPress={() => props.navigation.navigate(route.name)}
                          position={props.position}
                        />
                      );
                    })}
                  </View>
                );
              }}
            >
              <Tab.Screen name="HomeStack" component={HomeStackScreen} />
              <Tab.Screen name="Chat"      component={ChatScreen}      />
              <Tab.Screen name="Orders"    component={OrdersScreen}    />
              <Tab.Screen name="Wallet"    component={WalletScreen}    />
              <Tab.Screen name="PiSpi"     component={PiSpiScreen}     />
            </Tab.Navigator>
          )}
        </View>
      </View>
    </View>
  );
}

/** Partie authentifiée — partagée entre mobile (RootNavigator) et web. */
export function AuthenticatedNavigator({
  auth,
  logout,
}: {
  auth: AuthResult;
  logout: () => void;
}) {
  return (
    <AuthProvider auth={auth} logout={logout}>
      <ScannerProvider>
        <RootStack.Navigator
          id="RootStack"
          screenOptions={{
            headerShown: false,
            animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
            gestureEnabled: true,
          }}
        >
          <RootStack.Screen name="MainTabs"      component={MainTabs}            />
          <RootStack.Screen name="Notifications" component={NotificationsScreen} />
          <RootStack.Screen name="Profile"       component={ProfileScreen}       />
          <RootStack.Screen name="Settings"      component={SettingsScreen}      />
        </RootStack.Navigator>
        <QRScannerOverlay />
      </ScannerProvider>
    </AuthProvider>
  );
}

export function RootNavigator() {
  const [hasSplashFinished, setHasSplashFinished] = useState(false);
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);

  const finishSplash = useCallback(() => setHasSplashFinished(true),    []);
  const authenticate = useCallback((r: AuthResult) => setAuthResult(r), []);
  const logout       = useCallback(() => setAuthResult(null),            []);

  if (!hasSplashFinished) return <SplashScreen onFinish={finishSplash} />;
  if (!authResult)        return <AuthScreen onAuthenticated={authenticate} />;

  return <AuthenticatedNavigator auth={authResult} logout={logout} />;
}

const styles = StyleSheet.create({
  shell:    { flex: 1 },
  shellRow: { flexDirection: 'row' },

  /* ── Sidebar ────────────────────────────────────────────────── */
  sidebar: {
    borderRightWidth: StyleSheet.hairlineWidth,
    width: SIDEBAR_W,
  },
  sidebarBrand: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
    paddingBottom: 18,
    paddingHorizontal: 18,
  },
  brandDot:  { borderRadius: 6, height: 12, width: 12 },
  brandName: { fontSize: 17, fontWeight: '700', lineHeight: 20 },
  brandSub:  { fontSize: 11, fontWeight: '600', marginTop: 1 },

  sidebarBody:       { flex: 1, justifyContent: 'space-between', paddingBottom: 12 },
  sidebarSection:    { paddingHorizontal: 12, paddingTop: 6 },
  sidebarGroupLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.8, marginBottom: 4, paddingHorizontal: 4 },
  sidebarItem: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 2,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  sidebarLabel:   { fontSize: 14, fontWeight: '500' },
  sidebarDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16, marginVertical: 6 },

  /* ── Content ────────────────────────────────────────────────── */
  content:  { flex: 1, minWidth: 0 },
  mobileHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
  },
  tabsBody: { flex: 1 },

  /* ── Mobile bottom bar ──────────────────────────────────────── */
  mobileBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    flexDirection: 'row',
    paddingTop: 9,
    shadowOpacity: 0,
  },
  mobileTab: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  mobileIconSlot: {
    height: 25,
    position: 'relative',
    width: 25,
  },
  mobileLabelSlot: {
    alignItems: 'center',
    height: 14,
    position: 'relative',
    width: '100%',
  },
  mobileLayer: {
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  tabImage: {
    borderRadius: 4,
  },
});
