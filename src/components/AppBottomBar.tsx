import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClipboardList, Home, MessageCircle, Wallet } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import type { IconComponent } from '../types/icon';

type BottomKey = 'HomeStack' | 'Chat' | 'Orders' | 'Wallet' | 'PiSpi';
type BottomItem =
  | { key: BottomKey; label: string; icon: IconComponent; image?: never }
  | { key: BottomKey; label: string; icon?: never; image: ImageSourcePropType };

type AppBottomBarProps = {
  active?: BottomKey;
};

const piSpiLogo = require('../../assets/images/pi-spi.logo.png');

const items: BottomItem[] = [
  { key: 'HomeStack', label: 'Accueil', icon: Home },
  { key: 'Chat', label: 'Chat IA', icon: MessageCircle },
  { key: 'Orders', label: 'Commandes', icon: ClipboardList },
  { key: 'Wallet', label: 'Wallet', icon: Wallet },
  { key: 'PiSpi', label: 'PI-SPI', image: piSpiLogo },
] as const;

export function AppBottomBar({ active = 'HomeStack' }: AppBottomBarProps) {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        height: 68 + insets.bottom,
        paddingBottom: Math.max(insets.bottom, 10),
      },
    ]}>
      {items.map((item) => {
        const isActive = item.key === active;
        const Icon = 'icon' in item ? item.icon : null;

        return (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.82}
            style={styles.item}
            onPress={() => navigation.navigate('MainTabs', { screen: item.key })}
          >
            {'image' in item ? (
              <Image source={item.image} resizeMode="contain" style={[styles.logoIcon, !isActive && styles.logoIconMuted]} />
            ) : Icon ? (
              <Icon color={isActive ? colors.primary : colors.muted} size={25} strokeWidth={2.25} />
            ) : null}
            <Text style={[styles.label, isActive && { color: colors.primary }]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 9,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  label: {
    color: '#75808B',
    fontSize: 11,
    fontWeight: '600',
  },
  logoIcon: {
    height: 25,
    width: 25,
  },
  logoIconMuted: {
    opacity: 0.58,
  },
});
