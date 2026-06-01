import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClipboardList, Home, MessageCircle, UserRound, Wallet } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';

type BottomKey = 'Home' | 'Chat' | 'Orders' | 'Wallet' | 'Profile';

type AppBottomBarProps = {
  active?: BottomKey;
};

const items = [
  { key: 'Home', label: 'Accueil', icon: Home },
  { key: 'Chat', label: 'Chat IA', icon: MessageCircle },
  { key: 'Orders', label: 'Commandes', icon: ClipboardList },
  { key: 'Wallet', label: 'Wallet', icon: Wallet },
  { key: 'Profile', label: 'Profil', icon: UserRound },
] as const;

export function AppBottomBar({ active = 'Home' }: AppBottomBarProps) {
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
        const Icon = item.icon;
        const isActive = item.key === active;

        return (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.82}
            style={styles.item}
            onPress={() => navigation.navigate('MainTabs', { screen: item.key })}
          >
            <Icon color={isActive ? colors.primary : colors.muted} size={25} strokeWidth={2.25} />
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
    fontWeight: '800',
  },
});
