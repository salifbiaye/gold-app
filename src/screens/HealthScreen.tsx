import { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HeartPulse, MessageCircle, Phone } from 'lucide-react-native';
import { HeaderBar } from '../components/HeaderBar';
import { HtmlMapView } from '../components/HtmlMapView';
import { SearchPill } from '../components/SearchPill';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { ServiceIntroCard } from '../components/ServiceIntroCard';

import { useAppTheme } from '../context/ThemeContext';
import { getDoctors, getHealthServices } from '../services/health/healthService';
import { useRepositoryQuery } from '../hooks/useRepositoryQuery';
import { colors as appColors } from '../theme/colors';

const PHARMACIES = [
  { lat: 14.7190, lng: -17.4620, label: 'Pharmacie Liberté', emoji: '💊' },
  { lat: 14.7230, lng: -17.4710, label: 'Pharmacie Mermoz', emoji: '🏥' },
  { lat: 14.7260, lng: -17.4560, label: 'Pharmacie Point E', emoji: '💊' },
  { lat: 14.7140, lng: -17.4680, label: 'Clinique Pasteur', emoji: '🏥' },
];

function buildHealthMapHTML(isDark: boolean) {
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const center = { lat: 14.7200, lng: -17.4650 };

  const markersJS = PHARMACIES.map(
    (p) => `L.marker([${p.lat},${p.lng}],{icon:L.divIcon({className:'',html:'<div style="background:#EF4444;width:30px;height:30px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${p.emoji}</div>',iconSize:[30,30],iconAnchor:[15,15]})}).addTo(map).bindPopup('<b>${p.label}</b>');`
  ).join('\n');

  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box}html,body,#map{width:100%;height:100%}.leaflet-control-attribution,.leaflet-control-zoom{display:none}</style>
</head><body>
<div id="map"></div>
<script>
var map=L.map('map',{zoomControl:false,attributionControl:false}).setView([${center.lat},${center.lng}],15);
L.tileLayer('${tileUrl}',{maxZoom:19}).addTo(map);

L.marker([${center.lat},${center.lng}],{icon:L.divIcon({className:'',html:'<div style="background:#3388F2;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(51,136,242,0.4)"></div>',iconSize:[16,16],iconAnchor:[8,8]})}).addTo(map);
L.circle([${center.lat},${center.lng}],{radius:80,color:'#3388F2',fillColor:'#3388F2',fillOpacity:0.08,weight:1}).addTo(map);

${markersJS}
</script></body></html>`;
}

export function HealthScreen() {
  const navigation = useNavigation<any>();
  const { colors, resolvedMode } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDark = resolvedMode === 'dark';
  const healthMapHTML = buildHealthMapHTML(isDark);
  const doctors = useRepositoryQuery(getDoctors).data ?? [];
  const healthServices = useRepositoryQuery(getHealthServices).data ?? [];

  return (
    <Screen edges={['left', 'right']}>
      <HeaderBar title="Santé" subtitle="Médecins, pharmacies et rendez-vous" back onBack={navigation.goBack} />
      <View style={styles.searchWrap}>
        <SearchPill placeholder="Rechercher un médecin, une pharmacie..." mode="filter" />
      </View>
      <ServiceIntroCard
        icon={HeartPulse}
        tint={colors.blue}
        title="Santé"
        text="Consultez les médecins disponibles et localisez les pharmacies proches."
      />

      <View style={styles.services}>
        {healthServices.map((service) => {
          const Icon = service.icon;
          return (
            <TouchableOpacity key={service.id} style={styles.service} activeOpacity={0.84}>
              <View style={[styles.serviceIcon, { backgroundColor: `${service.tint}18` }]}>
                <Icon color={service.tint} size={22} />
              </View>
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.serviceText}>{service.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <SectionHeader title="Pharmacies & Cliniques proches" action="Voir carte" onAction={() => navigation.navigate('Map')} />
      <View style={styles.miniMapContainer}>
        <HtmlMapView
          style={styles.miniMap}
          html={healthMapHTML}
          scrollEnabled={false}
        />
        <View style={styles.mapOverlay}>
          <View style={styles.mapBadge}>
            <Text style={styles.mapBadgeText}>4 établissements à proximité</Text>
          </View>
        </View>
      </View>

      <SectionHeader title="Médecins disponibles" action="Voir tout" />
      <View style={styles.list}>
        {doctors.map((doctor, index) => (
          <View key={doctor.id} style={styles.doctor}>
            <Image
              source={{
                uri: index === 0
                  ? 'https://randomuser.me/api/portraits/men/46.jpg'
                  : 'https://randomuser.me/api/portraits/women/44.jpg',
              }}
              style={styles.avatar}
            />
            <View style={styles.doctorText}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorJob}>{doctor.job}</Text>
              <Text style={styles.online}>{doctor.state}</Text>
            </View>
            <TouchableOpacity style={styles.circleButton}>
              <Phone color={colors.primary} size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleButton}>
              <MessageCircle color={colors.primary} size={18} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <SectionHeader title="Pharmacies proches" action="Voir tout" />
      <View style={styles.pharmacy}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400' }}
          style={styles.pharmacyImage}
        />
        <View style={styles.doctorText}>
          <Text style={styles.doctorName}>Pharmacie Liberté</Text>
          <Text style={styles.doctorJob}>0.8 km · Ouvert</Text>
        </View>
        <TouchableOpacity style={styles.circleButton}>
          <Phone color={colors.primary} size={18} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

function createStyles(colors: typeof appColors) {
  return StyleSheet.create({
    searchWrap: {
      marginTop: 8,
    },
    miniMapContainer: {
      borderRadius: 12,
      height: 170,
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
    services: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
    },
    service: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 10,
      flex: 1,
      gap: 8,
      height: 80,
      justifyContent: 'center',
    },
    serviceIcon: {
      alignItems: 'center',
      borderRadius: 18,
      height: 36,
      justifyContent: 'center',
      width: 36,
    },
    serviceText: {
      color: colors.text,
      fontSize: 8,
      fontWeight: '500',
      maxWidth: '92%',
    },
    list: {
      gap: 10,
    },
    doctor: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      flexDirection: 'row',
      padding: 12,
    },
    avatar: {
      borderRadius: 25,
      height: 50,
      width: 50,
    },
    doctorText: {
      flex: 1,
      marginLeft: 12,
    },
    doctorName: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    doctorJob: {
      color: colors.muted,
      fontSize: 11,
      marginTop: 3,
    },
    online: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: '500',
      marginTop: 3,
    },
    circleButton: {
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 19,
      height: 38,
      justifyContent: 'center',
      marginLeft: 8,
      width: 38,
    },
    pharmacy: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      flexDirection: 'row',
      padding: 12,
    },
    pharmacyImage: {
      borderRadius: 24,
      height: 48,
      width: 48,
    },
  });
}

