import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import { Bell, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { getUnreadNotificationCount } from '../services/notifications/notificationService';

export function AppHeader() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const { auth } = useAuth();
  const [cityLabel, setCityLabel] = useState('Dakar, Sénégal');
  const [unreadCount, setUnreadCount] = useState(0);

  const firstName = auth.user.fullName?.split(' ')[0] ?? 'vous';
  const avatarSource = auth.user.avatarUrl
    ? { uri: auth.user.avatarUrl }
    : require('../../assets/images/avatar-salif.jpg');

  useEffect(() => {
    void getUnreadNotificationCount().then(setUnreadCount).catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const [result] = await Location.reverseGeocodeAsync(loc.coords);
        if (result) {
          const city = result.city ?? result.subregion ?? result.region ?? '';
          const country = result.country ?? '';
          if (city || country) setCityLabel(city && country ? `${city}, ${country}` : city || country);
        }
      } catch {
        // keep default
      }
    })();
  }, []);

  return (
    <View style={styles.bar}>
      {/* Left: avatar + greeting + location */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Profile')}
        activeOpacity={0.82}
        style={styles.left}
      >
        <Image source={avatarSource} style={styles.avatar} />
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Bonjour, {firstName} 👋
          </Text>
          <View style={styles.locationRow}>
            <MapPin color={colors.primary} size={12} strokeWidth={2.4} />
            <Text style={[styles.locationText, { color: colors.muted }]}>{cityLabel}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Right: bell */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Notifications')}
        activeOpacity={0.8}
        style={[styles.bellBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Bell color={colors.text} size={20} strokeWidth={2.2} />
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>{Math.min(unreadCount, 99)}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingTop: 6,
  },
  left: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  avatar: { borderRadius: 999, height: 44, width: 44 },
  greeting: { fontSize: 16, fontWeight: '800' },
  locationRow: { alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 2 },
  locationText: { fontSize: 12, fontWeight: '600' },
  bellBtn: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  badge: {
    alignItems: 'center',
    borderRadius: 7,
    height: 16,
    justifyContent: 'center',
    minWidth: 16,
    paddingHorizontal: 3,
    position: 'absolute',
    right: 4,
    top: 4,
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
});
