import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { authConfig } from '../config/auth';
import { useAppTheme } from '../context/ThemeContext';
import { colors as appColors } from '../theme/colors';

type SplashScreenProps = {
  onFinish: () => void;
};

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const { colors, resolvedMode } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, resolvedMode), [colors, resolvedMode]);
  const markOpacity = useRef(new Animated.Value(0)).current;
  const markScale = useRef(new Animated.Value(0.86)).current;
  const shadowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const exitTimer = setTimeout(onFinish, authConfig.splashDurationMs);

    Animated.parallel([
      Animated.timing(markOpacity, {
        duration: 520,
        easing: Easing.out(Easing.quad),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(markScale, {
        friction: 9,
        tension: 58,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(shadowOpacity, {
        delay: 180,
        duration: 520,
        easing: Easing.out(Easing.quad),
        toValue: resolvedMode === 'dark' ? 0.22 : 0.14,
        useNativeDriver: true,
      }),
    ]).start();

    return () => clearTimeout(exitTimer);
  }, [markOpacity, markScale, onFinish, resolvedMode, shadowOpacity]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.View style={[styles.shadowMark, { opacity: shadowOpacity }]}>
        <Text style={styles.shadowLetter}>G</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: markOpacity,
            transform: [{ scale: markScale }],
          },
        ]}
      >
        <Text style={styles.logoGhost}>G</Text>
        <Text style={styles.logoMain}>A</Text>
      </Animated.View>
      <View style={styles.homeIndicator} />
    </View>
  );
}

function createStyles(colors: typeof appColors, resolvedMode: 'light' | 'dark') {
  const background = resolvedMode === 'dark' ? '#07141D' : colors.primary;

  return StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: background,
      flex: 1,
      justifyContent: 'center',
    },
    shadowMark: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
    },
    shadowLetter: {
      color: '#FFFFFF',
      fontSize: 118,
      fontWeight: '900',
      opacity: resolvedMode === 'dark' ? 0.08 : 0.24,
    },
    logoWrap: {
      alignItems: 'center',
      height: 118,
      justifyContent: 'center',
      width: 128,
    },
    logoGhost: {
      color: '#FFFFFF',
      fontSize: 84,
      fontWeight: '900',
      left: 18,
      opacity: resolvedMode === 'dark' ? 0.18 : 0.32,
      position: 'absolute',
      top: 0,
    },
    logoMain: {
      color: '#FFFFFF',
      fontSize: 92,
      fontWeight: '900',
      letterSpacing: 0,
      position: 'absolute',
      right: 18,
      top: 12,
    },
    homeIndicator: {
      backgroundColor: 'rgba(255,255,255,0.48)',
      borderRadius: 2,
      bottom: 8,
      height: 4,
      position: 'absolute',
      width: 132,
    },
  });
}

