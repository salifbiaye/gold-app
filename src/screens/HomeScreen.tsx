import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Sparkles } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { ServiceTile } from '../components/ServiceTile';
import { WalletBalanceCard } from '../components/WalletBalanceCard';
import { useAppTheme } from '../context/ThemeContext';
import { popularServices } from '../data/mockData';
import { colors as appColors } from '../theme/colors';

type ServiceRoute = 'Transport' | 'RealEstate' | 'Health' | 'Delivery' | 'Food' | 'Education' | 'Tourism' | 'Payments' | 'Map';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { colors, resolvedMode } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, resolvedMode), [colors, resolvedMode]);
  const [cityLabel, setCityLabel] = useState('Localisation...');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCityLabel('Position inconnue');
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const [result] = await Location.reverseGeocodeAsync(loc.coords);
        if (result) {
          const city = result.city ?? result.subregion ?? result.region ?? '';
          const country = result.country ?? '';
          setCityLabel(city && country ? `${city}, ${country}` : city || country || 'Ici');
        }
      } catch {
        setCityLabel('Position indisponible');
      }
    })();
  }, []);

  const openService = (route: ServiceRoute) => {
    switch (route) {
      case 'Transport': navigation.navigate('Transport'); break;
      case 'RealEstate': navigation.navigate('RealEstate'); break;
      case 'Health': navigation.navigate('Health'); break;
      case 'Delivery': navigation.navigate('Delivery'); break;
      case 'Food': navigation.navigate('Food'); break;
      case 'Education': navigation.navigate('Education'); break;
      case 'Tourism': navigation.navigate('Tourism'); break;
      case 'Payments': navigation.navigate('Payments'); break;
      case 'Map': navigation.navigate('Map'); break;
    }
  };

  return (
    <Screen edges={['left', 'right']}>
      <View style={styles.location}>
        <MapPin color={colors.primary} size={13} />
        <Text style={[styles.locationText, { color: colors.muted }]}>{cityLabel}</Text>
      </View>

      {/* Wallet */}
      <View style={styles.cardStage}>
        <WalletBalanceCard />
      </View>

      {/* Raccourci Chat IA */}
      <TouchableOpacity
        style={styles.askCard}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Chat' })}
      >
        <View style={styles.askCopy}>
          <Text style={styles.askTitle}>Que recherchez-vous aujourd'hui ?</Text>
          <Text style={styles.askHint}>Parlez ou écrivez à votre assistant IA…</Text>
        </View>
        <View style={styles.aiButton}>
          <Sparkles color="#FFFFFF" size={20} strokeWidth={2.2} />
        </View>
      </TouchableOpacity>

      {/* Services populaires */}
      <SectionHeader
        title="Services populaires"
        action="Voir tout"
        onAction={() => navigation.navigate('Map')}
      />
      <View style={styles.servicesGrid}>
        {popularServices.map((service) => {
          const route = service.route as ServiceRoute | undefined;
          return (
            <ServiceTile
              key={service.id}
              icon={service.icon}
              label={service.label}
              tint={service.tint}
              onPress={route ? () => openService(route) : () => navigation.navigate('Map')}
            />
          );
        })}
      </View>

      {/* Promo livraison */}
      <SectionHeader title="Pour vous" />
      <TouchableOpacity style={styles.promo} activeOpacity={0.86} onPress={() => navigation.navigate('Map')}>
        <View>
          <Text style={styles.promoTitle}>Livraison en promo !</Text>
          <Text style={styles.promoText}>-20% sur vos commandes</Text>
        </View>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400' }}
          style={styles.promoImage}
        />
      </TouchableOpacity>
    </Screen>
  );
}

function createStyles(colors: typeof appColors, resolvedMode: 'light' | 'dark') {
  return StyleSheet.create({
    location: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 4,
      marginBottom: 8,
      marginTop: 2,
    },
    locationText: {
      fontSize: 12,
      fontWeight: '600',
    },
    cardStage: {
      backgroundColor: resolvedMode === 'dark' ? '#10202B' : '#EDF3F7',
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      marginHorizontal: -18,
      marginTop: 10,
      paddingHorizontal: 18,
      paddingVertical: 14,
    },
    askCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 14,
      marginTop: 16,
      minHeight: 80,
      padding: 16,
    },
    askCopy: {
      flex: 1,
    },
    askTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '800',
    },
    askHint: {
      color: colors.muted,
      fontSize: 12,
      marginTop: 6,
    },
    aiButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 21,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    servicesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 14,
    },
    promo: {
      alignItems: 'center',
      backgroundColor: `${colors.primary}14`,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: 82,
      overflow: 'hidden',
      padding: 14,
    },
    promoTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '900',
    },
    promoText: {
      color: colors.muted,
      fontSize: 12,
      marginTop: 5,
    },
    promoImage: {
      borderRadius: 10,
      height: 58,
      width: 86,
    },
  });
}
