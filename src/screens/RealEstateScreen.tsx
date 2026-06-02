import { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Home } from 'lucide-react-native';
import { HeaderBar } from '../components/HeaderBar';
import { Screen } from '../components/Screen';
import { SearchPill } from '../components/SearchPill';
import { SectionHeader } from '../components/SectionHeader';
import { ServiceIntroCard } from '../components/ServiceIntroCard';

import { useAppTheme } from '../context/ThemeContext';
import { getApartments } from '../services/realEstate/realEstateService';
import { useRepositoryQuery } from '../hooks/useRepositoryQuery';
import { colors as appColors } from '../theme/colors';

const FILTERS = ['Tout', 'Appartement', 'Maison', 'Bureau'];

export function RealEstateScreen() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeFilter, setActiveFilter] = useState(0);
  const apartments = useRepositoryQuery(getApartments).data ?? [];

  return (
    <Screen edges={['left', 'right']} style={styles.screenContent}>
      <HeaderBar title="Immobilier" subtitle="Appartements, maisons et bureaux" back onBack={navigation.goBack} />
      <View style={styles.searchWrap}>
        <SearchPill placeholder="Rechercher un bien..." mode="filter" />
      </View>
      <ServiceIntroCard
        icon={Home}
        tint={colors.primary}
        title="Immobilier"
        text="Trouvez un logement, comparez les quartiers et sauvegardez vos favoris."
      />

      <View style={styles.filters}>
        {FILTERS.map((filter, index) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filter, activeFilter === index && styles.activeFilter]}
            onPress={() => setActiveFilter(index)}
          >
            <Text style={[styles.filterText, activeFilter === index && styles.activeFilterText]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionHeader title="Recommandés pour vous" />
      <View style={styles.grid}>
        {apartments.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.86}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
            <Text style={styles.district}>{item.district}</Text>
            <Text style={styles.price}>{item.price}/mois</Text>
            <Text style={styles.rating}>★ {item.rating}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionHeader title="Tous les biens" />
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.lightButton}>
          <Text style={styles.lightButtonText}>Filtrer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.lightButton}>
          <Text style={styles.lightButtonText}>Trier</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

function createStyles(colors: typeof appColors) {
  return StyleSheet.create({
    screenContent: {
      paddingTop: 12,
    },
    searchWrap: {
      marginTop: 8,
    },
    filters: {
      flexDirection: 'row',
      gap: 9,
      marginTop: 14,
    },
    filter: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 13,
      paddingVertical: 8,
    },
    activeFilter: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '400',
    },
    activeFilterText: {
      color: '#FFFFFF',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      overflow: 'hidden',
      paddingBottom: 12,
      width: '48%',
    },
    image: {
      height: 104,
      width: '100%',
    },
    title: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
      marginHorizontal: 10,
      marginTop: 10,
    },
    district: {
      color: colors.muted,
      fontSize: 11,
      marginHorizontal: 10,
      marginTop: 3,
    },
    price: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
      marginHorizontal: 10,
      marginTop: 9,
    },
    rating: {
      color: colors.warning,
      fontSize: 11,
      fontWeight: '500',
      marginHorizontal: 10,
      marginTop: 6,
    },
    buttons: {
      flexDirection: 'row',
      gap: 12,
    },
    lightButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 12,
      borderWidth: 1,
      flex: 1,
      paddingVertical: 15,
    },
    lightButtonText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '500',
    },
  });
}
