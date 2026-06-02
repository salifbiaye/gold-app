import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bus, ChevronDown, MapPin } from 'lucide-react-native';
import { HeaderBar } from '../components/HeaderBar';
import { HtmlMapView } from '../components/HtmlMapView';
import { SearchPill } from '../components/SearchPill';
import { Screen } from '../components/Screen';
import { ServiceIntroCard } from '../components/ServiceIntroCard';

import { useAppTheme } from '../context/ThemeContext';
import { getTransportOptions } from '../services/transport/transportService';
import { useRepositoryQuery } from '../hooks/useRepositoryQuery';
import { colors as appColors } from '../theme/colors';

const ORIGIN = { lat: 14.7452, lng: -17.5131, label: 'Almadies' };
const DEST = { lat: 14.6694, lng: -17.0729, label: 'Aéroport AIBD' };

function buildRouteMapHTML(isDark: boolean) {
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const midLat = (ORIGIN.lat + DEST.lat) / 2;
  const midLng = (ORIGIN.lng + DEST.lng) / 2;

  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box}html,body,#map{width:100%;height:100%}.leaflet-control-attribution,.leaflet-control-zoom{display:none}</style>
</head><body>
<div id="map"></div>
<script>
var map=L.map('map',{zoomControl:false,attributionControl:false}).setView([${midLat},${midLng}],10);
L.tileLayer('${tileUrl}',{maxZoom:19}).addTo(map);

var originIcon=L.divIcon({className:'',html:'<div style="background:#0EB56D;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px rgba(14,181,109,0.4)"></div>',iconSize:[14,14],iconAnchor:[7,7]});
var destIcon=L.divIcon({className:'',html:'<div style="background:#EF4444;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px rgba(239,68,68,0.4)"></div>',iconSize:[14,14],iconAnchor:[7,7]});

L.marker([${ORIGIN.lat},${ORIGIN.lng}],{icon:originIcon}).addTo(map).bindPopup('<b>${ORIGIN.label}</b>');
L.marker([${DEST.lat},${DEST.lng}],{icon:destIcon}).addTo(map).bindPopup('<b>${DEST.label}</b>');

L.polyline([[${ORIGIN.lat},${ORIGIN.lng}],[14.73,-17.38],[14.71,-17.25],[${DEST.lat},${DEST.lng}]],{color:'#0EB56D',weight:3,opacity:0.8,dashArray:'8,6'}).addTo(map);

map.fitBounds([[${ORIGIN.lat},${ORIGIN.lng}],[${DEST.lat},${DEST.lng}]],{padding:[20,20]});
</script></body></html>`;
}

export function TransportScreen() {
  const navigation = useNavigation<any>();
  const { colors, resolvedMode } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedOption, setSelectedOption] = useState(0);
  const isDark = resolvedMode === 'dark';
  const transportOptions = useRepositoryQuery(getTransportOptions).data ?? [];

  const selected = transportOptions[selectedOption];
  const routeMapHTML = buildRouteMapHTML(isDark);

  return (
    <Screen edges={['left', 'right']} style={styles.screenContent}>
      <HeaderBar title="Transport" subtitle="Taxis, motos et trajets proches de vous" back onBack={navigation.goBack} />
      <View style={styles.searchWrap}>
        <SearchPill placeholder="Rechercher un trajet, une adresse..." mode="filter" />
      </View>
      <ServiceIntroCard
        icon={Bus}
        tint={colors.orange}
        title="Transport"
        text="Choisissez un véhicule, comparez les prix et confirmez votre trajet."
      />

      <View style={styles.miniMapContainer}>
        <HtmlMapView
          style={styles.miniMap}
          html={routeMapHTML}
          scrollEnabled={false}
        />
        <View style={styles.mapOverlay}>
          <View style={styles.mapBadge}>
            <MapPin color="#FFFFFF" size={10} />
            <Text style={styles.mapBadgeText}>52 km · ~45 min</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.mapLink} activeOpacity={0.86} onPress={() => navigation.navigate('Map')}>
          <Text style={styles.mapLinkText}>Voir carte</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.routeCard}>
        <LocationRow styles={styles} title="Position actuelle" value="Almadies, Dakar" color={colors.primary} />
        <View style={styles.divider} />
        <LocationRow styles={styles} title="Destination" value="Aéroport Blaise Diagne" color={colors.danger} />
        <View style={styles.divider} />
        <View style={styles.typeRow}>
          <View>
            <Text style={styles.label}>Type de service</Text>
            <Text style={styles.value}>Choisir un service</Text>
          </View>
          <ChevronDown color={colors.muted} size={20} />
        </View>
      </View>

      <View style={styles.options}>
        {transportOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = index === selectedOption;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.option, isSelected && styles.selectedOption]}
              activeOpacity={0.84}
              onPress={() => setSelectedOption(index)}
            >
              <View style={styles.carIcon}>
                <Icon color={isSelected ? colors.primary : colors.muted} size={24} />
              </View>
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>{option.label}</Text>
                <Text style={styles.optionTime}>{option.time}</Text>
              </View>
              <Text style={[styles.optionPrice, isSelected && styles.selectedPrice]}>{option.price}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selected ? (
        <TouchableOpacity style={styles.confirm} activeOpacity={0.86}>
          <Text style={styles.confirmText}>Confirmer · {selected.price}</Text>
        </TouchableOpacity>
      ) : null}
    </Screen>
  );
}

type LocationRowProps = {
  styles: ReturnType<typeof createStyles>;
  title: string;
  value: string;
  color: string;
};

function LocationRow({ styles, title, value, color }: LocationRowProps) {
  return (
    <View style={styles.locationRow}>
      <MapPin color={color} size={20} />
      <View>
        <Text style={styles.label}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
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
    miniMapContainer: {
      borderRadius: 12,
      height: 160,
      marginTop: 14,
      overflow: 'hidden',
      position: 'relative',
    },
    miniMap: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    mapOverlay: {
      bottom: 10,
      left: 10,
      position: 'absolute',
    },
    mapLink: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 7,
      position: 'absolute',
      right: 10,
      top: 10,
    },
    mapLinkText: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: '600',
    },
    mapBadge: {
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.65)',
      borderRadius: 8,
      flexDirection: 'row',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    mapBadgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '400',
    },
    routeCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginTop: 12,
      padding: 16,
    },
    locationRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      minHeight: 46,
    },
    label: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: '400',
    },
    value: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
      marginTop: 4,
    },
    divider: {
      backgroundColor: colors.border,
      height: 1,
      marginVertical: 8,
    },
    typeRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: 46,
    },
    options: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      gap: 6,
      marginTop: 18,
      padding: 8,
    },
    option: {
      alignItems: 'center',
      borderRadius: 10,
      flexDirection: 'row',
      minHeight: 66,
      padding: 10,
    },
    selectedOption: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary,
      borderWidth: 1,
    },
    carIcon: {
      alignItems: 'center',
      backgroundColor: colors.surfaceMuted,
      borderRadius: 10,
      height: 46,
      justifyContent: 'center',
      width: 56,
    },
    optionCopy: {
      flex: 1,
      marginLeft: 12,
    },
    optionTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    optionTime: {
      color: colors.muted,
      fontSize: 11,
      marginTop: 3,
    },
    optionPrice: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    selectedPrice: {
      color: colors.primary,
    },
    confirm: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 14,
      marginTop: 22,
      paddingVertical: 16,
    },
    confirmText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });
}
