import { Platform, StyleSheet, View } from 'react-native';
import { serviceConfig } from '../../services/serviceConfig';

/**
 * Indicateur de mode API — DEV uniquement.
 * Petit dot coloré en haut à droite, non-obstructif.
 * Ambre = MOCK · Vert = LIVE
 */
export function ApiModeBadge() {
  // @ts-ignore
  const isProd = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
  if (isProd) return null;

  const mock = serviceConfig.useMock;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={[styles.dot, mock ? styles.mock : styles.live]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: Platform.OS === 'web' ? ('fixed' as never) : 'absolute',
    top: Platform.OS === 'web' ? 6 : 52,
    right: 10,
    zIndex: 9999,
  },
  dot: {
    borderRadius: 999,
    height: 8,
    width: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  mock: { backgroundColor: '#FFB42C' },
  live: { backgroundColor: '#0EB56D' },
});
