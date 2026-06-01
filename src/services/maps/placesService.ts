import type { LatLng } from '../../components/MapView/types';
import { endpoints } from '../../config/api';
import { apiRequest } from '../api/client';
import { serviceConfig } from '../serviceConfig';

export type PlaceCategory = 'restaurant' | 'pharmacy' | 'fuel' | 'atm' | 'hospital' | 'cafe' | 'transport' | 'delivery';

/** Source de la donnée — affichée dans l'UI pour que l'utilisateur sache d'où vient le résultat. */
export type PlaceSource = 'mock' | 'backend' | 'prototype';

export type Place = {
  id: string;
  name: string;
  position: LatLng;
  category: PlaceCategory;
  address?: string;
  source?: PlaceSource;
};

const OVERPASS_BASE = 'https://overpass-api.de/api/interpreter';

const CATEGORY_QUERY: Record<PlaceCategory, string> = {
  restaurant: 'amenity=restaurant',
  cafe: 'amenity=cafe',
  pharmacy: 'amenity=pharmacy',
  fuel: 'amenity=fuel',
  atm: 'amenity=atm',
  hospital: 'amenity=hospital',
  transport: 'highway=bus_stop',
  delivery: 'amenity=post_office',
};

const PROTOTYPE_PLACES: Record<
  PlaceCategory,
  Array<Omit<Place, 'category' | 'position'> & { offset: LatLng }>
> = {
  restaurant: [
    { id: 'demo-restaurant-1', name: 'Chez Fatou', offset: { lat: 0.0025, lng: 0.0056 }, address: 'Cuisine senegalaise' },
    { id: 'demo-restaurant-2', name: 'Restaurant Almadies', offset: { lat: 0.0068, lng: -0.0061 }, address: 'Almadies' },
  ],
  cafe: [
    { id: 'demo-cafe-1', name: 'Cafe Point E', offset: { lat: 0.0031, lng: 0.0023 }, address: 'Point E' },
  ],
  pharmacy: [
    { id: 'demo-pharmacy-1', name: 'Pharmacie Liberte', offset: { lat: 0.0030, lng: 0.0057 }, address: 'Liberte 6' },
    { id: 'demo-pharmacy-2', name: 'Pharmacie Mermoz', offset: { lat: -0.0042, lng: -0.0082 }, address: 'Mermoz' },
    { id: 'demo-pharmacy-3', name: 'Pharmacie Point E', offset: { lat: 0.0080, lng: 0.0020 }, address: 'Point E' },
  ],
  hospital: [
    { id: 'demo-hospital-1', name: 'Clinique Pasteur', offset: { lat: -0.0060, lng: 0.0045 }, address: 'Dakar Plateau' },
  ],
  transport: [
    { id: 'demo-transport-1', name: 'Taxi Yango', offset: { lat: -0.0030, lng: 0.0090 }, address: '3 min' },
    { id: 'demo-transport-2', name: 'Taxi Confort', offset: { lat: 0.0060, lng: -0.0040 }, address: '5 min' },
    { id: 'demo-transport-3', name: 'Bus DDD', offset: { lat: -0.0070, lng: -0.0020 }, address: 'Arret proche' },
  ],
  delivery: [
    { id: 'demo-delivery-1', name: 'Livreur Moussa', offset: { lat: 0.0040, lng: 0.0060 }, address: 'Disponible' },
    { id: 'demo-delivery-2', name: 'Livreur Awa', offset: { lat: 0.0020, lng: -0.0100 }, address: 'Disponible' },
    { id: 'demo-delivery-3', name: 'Livreur Ibra', offset: { lat: -0.0050, lng: 0.0030 }, address: 'En route' },
  ],
  fuel: [
    { id: 'demo-fuel-1', name: 'Station Service', offset: { lat: 0.0046, lng: -0.0035 }, address: 'Ouvert' },
  ],
  atm: [
    { id: 'demo-atm-1', name: 'Distributeur', offset: { lat: 0.0003, lng: 0.0027 }, address: 'Disponible' },
  ],
};

export function getPrototypePlaces(category: PlaceCategory, center?: LatLng): Place[] {
  const origin = center ?? { lat: 14.7167, lng: -17.4677 };
  return PROTOTYPE_PLACES[category].map(({ offset, ...place }) => ({
    ...place,
    category,
    position: { lat: origin.lat + offset.lat, lng: origin.lng + offset.lng },
    source: 'prototype',
  }));
}

/**
 * Stratégie identique à routingService :
 *   - useMock  → prototype local (déterministe, hors réseau)
 *   - !useMock → backend GoldApp /api/maps/places (qui appelle Overpass avec cache + circuit breaker)
 *
 * On n'appelle PLUS Overpass public directement depuis le front (cohérence + sécurité).
 */
export async function getMapPlaces(
  center: LatLng,
  category: PlaceCategory,
  radiusMeters = 2000,
): Promise<Place[]> {
  if (serviceConfig.useMock) {
    return generateMockPlaces(center, category);
  }

  try {
    const data = await apiRequest<Array<{ id: string; name: string; position: LatLng; category: string; address?: string }>>(
      `${endpoints.maps.places}?lat=${center.lat}&lng=${center.lng}&category=${category}&radius=${radiusMeters}`,
    );
    return data.map((p) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      category,
      address: p.address,
      source: 'backend' as PlaceSource,
    }));
  } catch {
    // Fallback prototype si le backend n'a rien (ex: Overpass tombé en panne en aval)
    return getPrototypePlaces(category, center);
  }
}

export async function getMapPlacesForCategories(
  center: LatLng,
  categories: PlaceCategory[],
  radiusMeters = 2000,
): Promise<Place[]> {
  const groups = await Promise.all(categories.map((category) => getMapPlaces(center, category, radiusMeters)));
  return groups.flat();
}

/**
 * Génère ~10-15 places mock plausibles autour du center, déterministes par catégorie.
 * Utilisé quand useMock=true pour avoir un volume réaliste de résultats (pas juste 2-3).
 */
function generateMockPlaces(center: LatLng, category: PlaceCategory): Place[] {
  const NAMES: Record<PlaceCategory, string[]> = {
    restaurant: ['Chez Fatou', 'Restaurant Almadies', 'Le Lagon', 'Khalys Resto', 'La Calebasse', 'Wakhinane', 'Le Méli-Mélo', 'Cap-Vert', 'Chez Loutcha', 'Restaurant Pikine', 'Aux 4 vents', 'La Galette'],
    cafe: ['Café Point E', 'Le Comptoir', 'Café de Rome', 'Le Patio', 'Café Touba Royal', 'L\'Atelier Café', 'Brioche Dorée'],
    pharmacy: ['Pharmacie Liberté', 'Pharmacie Mermoz', 'Pharmacie Point E', 'Pharmacie Plateau', 'Pharmacie Ouakam', 'Pharmacie Sacré-Coeur'],
    fuel: ['Total Mermoz', 'Shell Almadies', 'Oilibya Plateau', 'Total Liberté 6'],
    atm: ['DAB Société Générale', 'DAB BICIS', 'DAB CBAO', 'DAB Ecobank', 'DAB UBA'],
    hospital: ['Clinique Pasteur', 'Hôpital Principal', 'Clinique du Cap', 'Hôpital Fann'],
    transport: ['Arrêt DDD Plateau', 'Station Yango', 'Arrêt Bus Liberté', 'Taxi Confort Almadies', 'Station Heetch'],
    delivery: ['Yobante Express', 'Glovo Sénégal', 'Jumia Express', 'Livreur Moussa', 'Livreur Awa'],
  };
  const names = NAMES[category];
  // Génère un cercle de positions autour du center
  return names.map((name, i) => {
    const angle = (i / names.length) * 2 * Math.PI;
    const radius = 0.005 + (i % 3) * 0.003; // entre ~500m et ~1.5km
    return {
      id: `mock-${category}-${i}`,
      name,
      position: {
        lat: center.lat + radius * Math.cos(angle),
        lng: center.lng + radius * Math.sin(angle),
      },
      category,
      address: 'Adresse à confirmer',
      source: 'mock' as PlaceSource,
    };
  });
}

export function placeIconColor(category: PlaceCategory): string {
  return {
    restaurant: '#FF6848',
    cafe: '#A87E58',
    pharmacy: '#0EB56D',
    fuel: '#3388F2',
    atm: '#8C54D9',
    hospital: '#EF4444',
    transport: '#3388F2',
    delivery: '#F97316',
  }[category];
}
