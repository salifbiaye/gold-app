import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, MapPin, Navigation, Phone } from 'lucide-react-native';

import { Screen } from '../components/Screen';
import { HtmlMapView } from '../components/HtmlMapView';
import { useAppTheme } from '../context/ThemeContext';
import {
  getMapPlaces,
  getMapPlacesForCategories,
  placeIconColor,
  type Place,
  type PlaceCategory,
} from '../services/maps/placesService';
import { colors as appColors } from '../theme/colors';

const DEFAULT_LAT = 14.7167;
const DEFAULT_LNG = -17.4677;

type MobileMapCategory = 'all' | 'transport' | 'delivery' | 'pharmacy';
type Marker = { lat: number; lng: number; color: string; emoji: string; label: string; category: PlaceCategory };

const CHIPS: Array<{ label: string; category: MobileMapCategory }> = [
  { label: 'Tout', category: 'all' },
  { label: 'Transport', category: 'transport' },
  { label: 'Livreurs', category: 'delivery' },
  { label: 'Pharmacies', category: 'pharmacy' },
];

const CHIP_CATEGORIES: Record<MobileMapCategory, PlaceCategory[]> = {
  all: ['delivery', 'transport', 'pharmacy'],
  transport: ['transport'],
  delivery: ['delivery'],
  pharmacy: ['pharmacy'],
};

function markerEmoji(category: PlaceCategory) {
  return {
    restaurant: '🍽️',
    cafe: '☕',
    pharmacy: '💊',
    fuel: '⛽',
    atm: '💳',
    hospital: '🏥',
    transport: '🚗',
    delivery: '🚴',
  }[category];
}

function placeToMarker(place: Place): Marker {
  return {
    lat: place.position.lat,
    lng: place.position.lng,
    color: placeIconColor(place.category),
    emoji: markerEmoji(place.category),
    label: place.name,
    category: place.category,
  };
}

function escapePopupText(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char] ?? char));
}

function getBottomCard(category: MobileMapCategory, place?: Place, loading?: boolean) {
  if (loading) {
    return {
      status: 'Recherche en cours',
      name: 'Services proches',
      rating: 'Synchronisation carte...',
      img: category === 'pharmacy' ? 0 : 14,
    };
  }

  if (place) {
    const statusByCategory: Record<PlaceCategory, string> = {
      restaurant: 'Restaurant disponible',
      cafe: 'Cafe proche',
      pharmacy: 'Pharmacie ouverte',
      fuel: 'Station disponible',
      atm: 'Service disponible',
      hospital: 'Sante disponible',
      transport: 'Chauffeur disponible',
      delivery: 'Livreur disponible',
    };

    return {
      status: statusByCategory[place.category],
      name: place.name,
      rating: place.address ?? (place.source === 'backend' ? 'Source OSM' : 'Disponible'),
      img: place.category === 'pharmacy' || place.category === 'hospital' ? 0 : 14,
    };
  }

  const fallback = {
    transport: { status: 'Transport proche', name: 'Aucun chauffeur affiche', rating: 'Essaie de rafraichir', img: 14 },
    delivery: { status: 'Livreur proche', name: 'Aucun livreur affiche', rating: 'Essaie de rafraichir', img: 14 },
    pharmacy: { status: 'Pharmacie proche', name: 'Aucune pharmacie affichee', rating: 'Essaie de rafraichir', img: 0 },
    all: { status: 'Services proches', name: 'Aucun service affiche', rating: 'Essaie de rafraichir', img: 14 },
  };

  return fallback[category];
}

function buildMapHTML(lat: number, lng: number, isDark: boolean, markers: Marker[]) {
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const markersJS = markers
    .map(
      (m) => `
    L.marker([${m.lat}, ${m.lng}], {
      icon: L.divIcon({
        className: '',
        html: '<div style="background:${m.color};width:36px;height:36px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${m.emoji}</div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })
    }).addTo(map).bindPopup('<b>${escapePopupText(m.label)}</b>');`,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .leaflet-control-attribution { display: none; }
    .leaflet-control-zoom { display: none; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${lat}, ${lng}], 14);
  L.tileLayer('${tileUrl}', { maxZoom: 19 }).addTo(map);

  L.marker([${lat}, ${lng}], {
    icon: L.divIcon({
      className: '',
      html: '<div style="background:#3388F2;width:22px;height:22px;border-radius:50%;border:4px solid white;box-shadow:0 0 0 3px rgba(51,136,242,0.4)"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    })
  }).addTo(map);

  L.circle([${lat}, ${lng}], { radius: 120, color: '#3388F2', fillColor: '#3388F2', fillOpacity: 0.08, weight: 1 }).addTo(map);

  ${markersJS}
</script>
</body>
</html>`;
}

export function MapScreen() {
  const navigation = useNavigation<any>();
  const { colors, resolvedMode } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDark = resolvedMode === 'dark';

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('Localisation en cours...');
  const [locationLoading, setLocationLoading] = useState(true);
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [activeChip, setActiveChip] = useState(0);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
        setAddress('Dakar, Sénégal');
        setLocationLoading(false);
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = loc.coords;
        setCoords({ lat: latitude, lng: longitude });
        const [result] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (result) {
          const city = result.city ?? result.subregion ?? result.region ?? '';
          const country = result.country ?? '';
          setAddress(city && country ? `${city}, ${country}` : city || country || 'Position trouvée');
        }
      } catch {
        setCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
        setAddress('Dakar, Sénégal');
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  const mapLat = coords?.lat ?? DEFAULT_LAT;
  const mapLng = coords?.lng ?? DEFAULT_LNG;
  const activeCat = CHIPS[activeChip].category;
  const filtered = places;
  const mapMarkers = useMemo(() => filtered.map(placeToMarker), [filtered]);
  const mapHTML = useMemo(() => buildMapHTML(mapLat, mapLng, isDark, mapMarkers), [isDark, mapLat, mapLng, mapMarkers]);

  useEffect(() => {
    if (!coords) return;

    let cancelled = false;
    const center = { lat: coords.lat, lng: coords.lng };
    const categories = CHIP_CATEGORIES[activeCat];

    setPlacesLoading(true);
    const request =
      activeCat === 'all'
        ? getMapPlacesForCategories(center, categories, 2500)
        : getMapPlaces(center, categories[0], 2500);

    request
      .then((results) => {
        if (!cancelled) setPlaces(results);
      })
      .catch(() => {
        if (!cancelled) setPlaces([]);
      })
      .finally(() => {
        if (!cancelled) setPlacesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCat, coords]);

  const primaryPlace = filtered[0];
  const card = getBottomCard(activeCat, primaryPlace, placesLoading);

  return (
    <Screen scroll={false} padded={false} edges={['left', 'right']}>
      <View style={styles.mapContainer}>
        <HtmlMapView
          ref={webViewRef}
          key={`${activeChip}-${isDark}`}
          style={styles.webview}
          html={mapHTML}
          scrollEnabled={false}
          onError={() => setAddress('Carte indisponible')}
        />

        <View style={styles.headerOverlay}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.84} onPress={navigation.goBack}>
            <ChevronLeft color={colors.text} size={22} />
          </TouchableOpacity>
          <View style={styles.headerPill}>
            <Text style={styles.headerTitle}>Carte</Text>
            <Text style={styles.headerSubtitle}>Services proches</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.chipsOverlay}>
          {CHIPS.map((chip, index) => (
            <TouchableOpacity
              key={chip.label}
              style={[styles.chip, activeChip === index && styles.activeChip]}
              onPress={() => setActiveChip(index)}
            >
              <Text style={[styles.chipText, activeChip === index && styles.activeChipText]}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.centerBtn} onPress={() => {
          if (Platform.OS !== 'web') {
            webViewRef.current?.injectJavaScript(`map.setView([${mapLat}, ${mapLng}], 14); true;`);
          }
        }}>
          <Navigation color={colors.primary} size={18} />
        </TouchableOpacity>
      </View>

      <View style={styles.driverCard}>
        {card.img > 0 ? (
          <Image source={require('../../assets/images/avatar-salif.jpg')} style={styles.driver} />
        ) : (
          <View style={[styles.driver, styles.pharmacyIcon]}>
            <Text style={{ fontSize: 22 }}>💊</Text>
          </View>
        )}
        <View style={styles.driverCopy}>
          <Text style={styles.available}>{card.status}</Text>
          <Text style={styles.driverName}>{card.name}</Text>
          <Text style={styles.ratingText}>★ {card.rating}</Text>
          <View style={styles.locationRow}>
            {locationLoading ? (
              <ActivityIndicator size={10} color={colors.muted} />
            ) : (
              <MapPin size={11} color={colors.primary} />
            )}
            <Text style={styles.distanceText}>{locationLoading ? 'Localisation...' : address}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.callButton}>
          <Phone color={colors.primary} size={21} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

function createStyles(colors: typeof appColors) {
  return StyleSheet.create({
    mapContainer: { flex: 1, position: 'relative' },
    webview: { flex: 1, backgroundColor: 'transparent' },
    headerOverlay: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
      left: 16,
      position: 'absolute',
      right: 16,
      top: 12,
    },
    backButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 18,
      elevation: 3,
      height: 36,
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 5,
      width: 36,
    },
    headerPill: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 18,
      elevation: 3,
      flex: 1,
      paddingVertical: 7,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 5,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    headerSubtitle: {
      color: colors.muted,
      fontSize: 10,
      fontWeight: '400',
      marginTop: 1,
    },
    headerSpacer: {
      width: 36,
    },
    chipsOverlay: {
      flexDirection: 'row',
      gap: 9,
      left: 16,
      position: 'absolute',
      right: 16,
      top: 68,
    },
    chip: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 3,
    },
    activeChip: { backgroundColor: colors.primary },
    chipText: { color: colors.text, fontSize: 12, fontWeight: '500' },
    activeChipText: { color: '#FFFFFF' },
    centerBtn: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 24,
      bottom: 16,
      elevation: 4,
      height: 46,
      justifyContent: 'center',
      position: 'absolute',
      right: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      width: 46,
    },
    driverCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      borderTopWidth: 1,
      flexDirection: 'row',
      padding: 14,
    },
    driver: { borderRadius: 28, height: 52, width: 52 },
    pharmacyIcon: {
      alignItems: 'center',
      backgroundColor: '#EF444418',
      justifyContent: 'center',
    },
    driverCopy: { flex: 1, marginLeft: 12 },
    available: { color: colors.primary, fontSize: 11, fontWeight: '500' },
    driverName: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 2 },
    ratingText: { color: colors.warning, fontSize: 12, fontWeight: '400', marginTop: 2 },
    locationRow: { alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 3 },
    distanceText: { color: colors.muted, fontSize: 11 },
    callButton: {
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 23,
      height: 46,
      justifyContent: 'center',
      width: 46,
    },
  });
}

