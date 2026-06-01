import { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BookOpen, Compass, MapPin, PackageCheck, Star, Utensils } from 'lucide-react-native';
import { HeaderBar } from '../components/HeaderBar';
import { Screen } from '../components/Screen';
import { SearchPill } from '../components/SearchPill';
import { SectionHeader } from '../components/SectionHeader';
import { useAppTheme } from '../context/ThemeContext';
import { colors as appColors } from '../theme/colors';
import { IconComponent } from '../types/icon';

type ServiceCard = {
  id: string;
  title: string;
  meta: string;
  price: string;
  image: string;
};

type ServiceConfig = {
  actionLabel: string;
  cards: ServiceCard[];
  chips: string[];
  emptyHint: string;
  hero: string;
  icon: IconComponent;
  subtitle: string;
  tint: string;
  title: string;
};

const configs = {
  delivery: {
    title: 'Livraison',
    subtitle: 'Coursiers, courses et colis autour de vous',
    hero: 'Suivez vos livreurs et commandez en quelques secondes.',
    tint: '#FF6848',
    icon: PackageCheck,
    actionLabel: 'Suivre sur la carte',
    emptyHint: 'Les livreurs proches et le suivi temps réel seront branchés au backend.',
    chips: ['Tout', 'Courses', 'Repas', 'Colis'],
    cards: [
      { id: 'd1', title: 'Livraison express', meta: 'Coursier disponible · 2 min', price: '1 500 FCFA', image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600' },
      { id: 'd2', title: 'Courses à domicile', meta: 'Supermarché partenaire', price: 'Dès 900 FCFA', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600' },
    ],
  },
  food: {
    title: 'Alimentation',
    subtitle: 'Restaurants, marchés et paniers du jour',
    hero: 'Commandez vos repas et produits frais sans quitter l’app.',
    tint: '#61C454',
    icon: Utensils,
    actionLabel: 'Voir restaurants sur la carte',
    emptyHint: 'Les restaurants et stocks seront synchronisés avec votre backend.',
    chips: ['Tout', 'Repas', 'Marché', 'Promo'],
    cards: [
      { id: 'f1', title: 'Chez Fatou', meta: 'Cuisine sénégalaise · 4.8', price: 'Dès 2 500 FCFA', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600' },
      { id: 'f2', title: 'Panier frais', meta: 'Fruits et légumes', price: '8 000 FCFA', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600' },
    ],
  },
  education: {
    title: 'Education',
    subtitle: 'Cours, formations et accompagnement',
    hero: 'Trouvez un cours ou un coach adapté à votre niveau.',
    tint: '#8C54D9',
    icon: BookOpen,
    actionLabel: 'Voir cours proches',
    emptyHint: 'Les inscriptions et profils formateurs seront branchés au backend.',
    chips: ['Tout', 'Cours', 'Langues', 'Coaching'],
    cards: [
      { id: 'e1', title: 'Cours de français', meta: 'Prof en ligne · 18h00', price: '5 000 FCFA', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600' },
      { id: 'e2', title: 'Soutien maths', meta: 'Collège & lycée', price: '7 500 FCFA', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600' },
    ],
  },
  tourism: {
    title: 'Tourisme',
    subtitle: 'Activités, guides et visites locales',
    hero: 'Explorez Dakar avec des expériences vérifiées.',
    tint: '#F97316',
    icon: Compass,
    actionLabel: 'Voir sur la carte',
    emptyHint: 'Les réservations et disponibilités seront branchées au backend.',
    chips: ['Tout', 'Visites', 'Mer', 'Culture'],
    cards: [
      { id: 't1', title: 'Île de Gorée', meta: 'Guide disponible · 4.9', price: '12 000 FCFA', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600' },
      { id: 't2', title: 'Sortie plage', meta: 'Demi-journée', price: '9 000 FCFA', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600' },
    ],
  },
} satisfies Record<string, ServiceConfig>;

type CategoryKey = keyof typeof configs;

function CategoryScreen({ type }: { type: CategoryKey }) {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeChip, setActiveChip] = useState(0);
  const config = configs[type];
  const HeroIcon = config.icon;

  return (
    <Screen edges={['left', 'right']} style={styles.screenContent}>
      <HeaderBar title={config.title} subtitle={config.subtitle} back onBack={navigation.goBack} />
      <View style={styles.searchWrap}>
        <SearchPill placeholder={`Rechercher dans ${config.title.toLowerCase()}...`} mode="filter" />
      </View>

      <View style={[styles.heroCard, { backgroundColor: `${config.tint}16`, borderColor: `${config.tint}33` }]}>
        <View style={[styles.heroIcon, { backgroundColor: `${config.tint}20` }]}>
          <HeroIcon color={config.tint} size={24} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{config.title}</Text>
          <Text style={styles.heroText}>{config.hero}</Text>
        </View>
      </View>

      <View style={styles.chips}>
        {config.chips.map((chip, index) => {
          const isActive = activeChip === index;
          return (
            <TouchableOpacity
              key={chip}
              style={[styles.chip, isActive && { backgroundColor: config.tint, borderColor: config.tint }]}
              activeOpacity={0.82}
              onPress={() => setActiveChip(index)}
            >
              <Text style={[styles.chipText, isActive && styles.activeChipText]}>{chip}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <SectionHeader title="Recommandés pour vous" />
      <View style={styles.grid}>
        {config.cards.map((card) => (
          <TouchableOpacity key={card.id} style={styles.card} activeOpacity={0.86}>
            <Image source={{ uri: card.image }} style={styles.image} />
            <View style={styles.cardBody}>
              <Text numberOfLines={1} style={styles.cardTitle}>{card.title}</Text>
              <Text numberOfLines={1} style={styles.cardMeta}>{card.meta}</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.price, { color: config.tint }]}>{card.price}</Text>
                <View style={styles.rating}>
                  <Star color={colors.warning} fill={colors.warning} size={11} />
                  <Text style={styles.ratingText}>4.8</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoBox}>
        <MapPin color={config.tint} size={18} />
        <Text style={styles.infoText}>{config.emptyHint}</Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: config.tint }]}
        activeOpacity={0.86}
        onPress={() => navigation.navigate('Map')}
      >
        <Text style={styles.primaryButtonText}>{config.actionLabel}</Text>
      </TouchableOpacity>
    </Screen>
  );
}

export function DeliveryScreen() {
  return <CategoryScreen type="delivery" />;
}

export function FoodScreen() {
  return <CategoryScreen type="food" />;
}

export function EducationScreen() {
  return <CategoryScreen type="education" />;
}

export function TourismScreen() {
  return <CategoryScreen type="tourism" />;
}

function createStyles(colors: typeof appColors) {
  return StyleSheet.create({
    screenContent: {
      paddingBottom: 88,
    },
    searchWrap: {
      marginTop: 8,
    },
    heroCard: {
      alignItems: 'center',
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      marginTop: 14,
      padding: 14,
    },
    heroIcon: {
      alignItems: 'center',
      borderRadius: 14,
      height: 52,
      justifyContent: 'center',
      width: 52,
    },
    heroCopy: {
      flex: 1,
    },
    heroTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    heroText: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 18,
      marginTop: 4,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 14,
    },
    chip: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 13,
      paddingVertical: 8,
    },
    chipText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '500',
    },
    activeChipText: {
      color: '#FFFFFF',
    },
    grid: {
      gap: 12,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    image: {
      height: 104,
      width: 112,
    },
    cardBody: {
      flex: 1,
      padding: 12,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    cardMeta: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: '400',
      marginTop: 4,
    },
    cardFooter: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 'auto',
    },
    price: {
      fontSize: 12,
      fontWeight: '600',
    },
    rating: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 3,
    },
    ratingText: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: '500',
    },
    infoBox: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 12,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
      padding: 12,
    },
    infoText: {
      color: colors.muted,
      flex: 1,
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 18,
    },
    primaryButton: {
      alignItems: 'center',
      borderRadius: 14,
      marginTop: 18,
      paddingVertical: 15,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });
}

