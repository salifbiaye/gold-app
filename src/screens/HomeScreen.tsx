import { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mic } from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { ServiceTile } from '../components/ServiceTile';
import { WalletBalanceCard } from '../components/WalletBalanceCard';
import { useAppTheme } from '../context/ThemeContext';
import { getPopularServices } from '../services/home/homeService';
import { useRepositoryQuery } from '../hooks/useRepositoryQuery';
import { colors as appColors } from '../theme/colors';

type ServiceRoute = 'Transport' | 'RealEstate' | 'Health' | 'Delivery' | 'Food' | 'Education' | 'Tourism' | 'Payments' | 'Map';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { colors, resolvedMode } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, resolvedMode), [colors, resolvedMode]);
  const services = useRepositoryQuery(getPopularServices).data ?? [];

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
    <Screen>
      <AppHeader />
      {/* Wallet */}
      <WalletBalanceCard />

      {/* Raccourci Chat IA */}
      <TouchableOpacity
        style={styles.askCard}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Chat' })}
      >
        <View style={styles.askCopy}>
          <Text style={styles.askTitle}>Que recherchez-vous aujourd'hui ?</Text>
          <Text style={styles.askHint}>Parlez ou écrivez…</Text>
        </View>
        <View style={styles.aiButton}>
          <Mic color="#FFFFFF" size={22} strokeWidth={2.35} />
        </View>
      </TouchableOpacity>

      {/* Services populaires */}
      <SectionHeader
        title="Services populaires"
        action="Voir tout"
        onAction={() => navigation.navigate('Map')}
      />
      <View style={styles.servicesGrid}>
        {services.map((service) => {
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

function createStyles(colors: typeof appColors, _resolvedMode: 'light' | 'dark') {
  return StyleSheet.create({
    askCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
      padding: 14,
    },
    askCopy: { flex: 1 },
    askTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
    askHint: { color: colors.muted, fontSize: 12, fontWeight: '600', marginTop: 3 },
    aiButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 999,
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    servicesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 12,
    },
    promo: {
      alignItems: 'center',
      backgroundColor: `${colors.primary}14`,
      borderRadius: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      overflow: 'hidden',
      padding: 14,
    },
    promoTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
    promoText: { color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 4 },
    promoImage: { borderRadius: 10, height: 58, width: 84 },
  });
}

