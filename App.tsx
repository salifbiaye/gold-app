import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ScannerProvider } from './src/context/ScannerContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function AppShell() {
  const { colors, resolvedMode } = useAppTheme();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const style = document.createElement('style');
    style.textContent = '* { outline: none !important; -webkit-tap-highlight-color: transparent; }';
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <View style={[styles.stage, { backgroundColor: Platform.OS === 'web' ? '#07141D' : colors.background }]}>
      <View style={[styles.phone, { backgroundColor: colors.background }]}>
        <SafeAreaProvider>
          <ScannerProvider>
            <NavigationContainer>
              <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} hidden={Platform.OS === 'web'} />
              <RootNavigator />
            </NavigationContainer>
          </ScannerProvider>
        </SafeAreaProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    ...(Platform.OS === 'web'
      ? {
          alignItems: 'center',
          justifyContent: 'center',
        }
      : null),
  },
  phone: {
    flex: 1,
    overflow: 'hidden',
    width: '100%',
    ...(Platform.OS === 'web'
      ? {
          maxWidth: 390,
        }
      : null),
  },
});
