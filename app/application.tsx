import { NavigationIndependentTree } from '@react-navigation/core';
import { NavigationContainer } from '@react-navigation/native';
import { Redirect, useRouter } from 'expo-router';
import { ActivityIndicator, Platform, View } from 'react-native';
import MobileApplication from '../App';
import { useWebSession } from '../src/context/WebSessionContext';
import { AuthenticatedNavigator } from '../src/navigation/RootNavigator';
import type { AuthResult } from '../src/types/auth';

export default function ApplicationRoute() {
  if (Platform.OS !== 'web') {
    return (
      <NavigationIndependentTree>
        <MobileApplication />
      </NavigationIndependentTree>
    );
  }
  return <WebAuthGate />;
}

function WebAuthGate() {
  const { status, user, logout } = useWebSession();
  const router = useRouter();

  /* Session en cours de restauration (cookie HttpOnly) */
  if (status === 'authenticating') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* Non authentifié → login */
  if (status !== 'authenticated' || !user) {
    return <Redirect href="/connexion" />;
  }

  const auth: AuthResult = { token: user.token, user };

  const handleLogout = () => {
    logout().catch(() => {}).finally(() => router.replace('/connexion'));
  };

  // NavigationContainer sans `linking` = React Navigation ne met JAMAIS à jour
  // l'URL du navigateur. L'URL reste /application au lieu de /application/MainTabs/Wallet,
  // ce qui évite le 404 "Unmatched Route" au refresh.
  return (
    <NavigationContainer independent>
      <AuthenticatedNavigator auth={auth} logout={handleLogout} />
    </NavigationContainer>
  );
}
