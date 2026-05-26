import { useCallback, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClipboardList, Home, MessageCircle, Wallet } from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { QRScannerOverlay } from '../components/QRScannerOverlay';
import { AuthProvider } from '../context/AuthContext';
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

const tabConfig: Record<keyof MainTabParamList, { icon: IconComponent; label: string }> = {
  HomeStack: { icon: Home, label: 'Accueil' },
  Chat: { icon: MessageCircle, label: 'Chat IA' },
  Orders: { icon: ClipboardList, label: 'Commandes' },
  Wallet: { icon: Wallet, label: 'Wallet' },
};

function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Transport" component={TransportScreen} />
      <HomeStack.Screen name="RealEstate" component={RealEstateScreen} />
      <HomeStack.Screen name="Health" component={HealthScreen} />
      <HomeStack.Screen name="Delivery" component={DeliveryScreen} />
      <HomeStack.Screen name="Food" component={FoodScreen} />
      <HomeStack.Screen name="Education" component={EducationScreen} />
      <HomeStack.Screen name="Tourism" component={TourismScreen} />
      <HomeStack.Screen name="Payments" component={PaymentsScreen} />
      <HomeStack.Screen name="Map" component={MapScreen} />
    </HomeStack.Navigator>
  );
}

function MainTabs() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const padBottom = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.mainTabsShell, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
        <AppHeader />
      </SafeAreaView>
      <View style={styles.tabsBody}>
        <Tab.Navigator
          id="MainTabs"
          tabBarPosition="bottom"
          screenOptions={({ route }) => {
            const cfg = tabConfig[route.name];
            return {
              lazy: true,
              swipeEnabled: true,
              animationEnabled: true,
              tabBarShowIcon: true,
              tabBarShowLabel: true,
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: '#7A8490',
              tabBarIndicatorStyle: {
                backgroundColor: colors.primary,
                height: 3,
                borderRadius: 2,
                bottom: 'auto' as any,
                top: 0,
                marginHorizontal: 22,
              },
              tabBarStyle: {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
                borderTopWidth: StyleSheet.hairlineWidth,
                paddingBottom: padBottom,
                paddingTop: 6,
                elevation: 0,
                shadowOpacity: 0,
              },
              tabBarLabelStyle: styles.tabLabel,
              tabBarItemStyle: styles.tabItem,
              tabBarIcon: ({ color }: { color: string }) => {
                const Icon = cfg.icon;
                return <Icon color={color} size={21} strokeWidth={2.1} />;
              },
              tabBarLabel: ({ color }: { color: string }) => (
                <Text style={[styles.tabLabel, { color }]}>{cfg.label}</Text>
              ),
            };
          }}
        >
          <Tab.Screen name="HomeStack" component={HomeStackScreen} />
          <Tab.Screen name="Chat" component={ChatScreen} />
          <Tab.Screen name="Orders" component={OrdersScreen} />
          <Tab.Screen name="Wallet" component={WalletScreen} />
        </Tab.Navigator>
      </View>
    </View>
  );
}

export function RootNavigator() {
  const [hasSplashFinished, setHasSplashFinished] = useState(false);
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);

  const finishSplash = useCallback(() => setHasSplashFinished(true), []);
  const authenticate = useCallback((result: AuthResult) => setAuthResult(result), []);
  const logout = useCallback(() => setAuthResult(null), []);

  if (!hasSplashFinished) return <SplashScreen onFinish={finishSplash} />;
  if (!authResult) return <AuthScreen onAuthenticated={authenticate} />;

  return (
    <AuthProvider auth={authResult} logout={logout}>
      <RootStack.Navigator
        id="RootStack"
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
          gestureEnabled: true,
        }}
      >
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen name="Notifications" component={NotificationsScreen} />
        <RootStack.Screen name="Profile" component={ProfileScreen} />
        <RootStack.Screen name="Settings" component={SettingsScreen} />
      </RootStack.Navigator>
      <QRScannerOverlay />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  mainTabsShell: {
    flex: 1,
  },
  fixedHeader: {
    paddingHorizontal: 18,
    paddingBottom: 6,
  },
  tabsBody: {
    flex: 1,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'none',
  },
  tabItem: {
    height: 50,
    paddingTop: 0,
  },
});
