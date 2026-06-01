import type { LatLng } from '../../components/MapView/types';
import { endpoints } from '../../config/api';
import { apiRequest } from '../api/client';
import { serviceConfig } from '../serviceConfig';

export type TravelMode = 'driving' | 'cycling' | 'walking';

/** Source de la donnée — affichée dans l'UI pour que l'utilisateur sache d'où vient le calcul. */
export type RouteSource = 'mock' | 'backend';

export type RouteResult = {
  distanceMeters: number;
  durationSeconds: number;
  geometry: LatLng[];
  source: RouteSource;
};

/**
 * Stratégie :
 *   - useMock = true  → calcul Haversine local (instantané, hors réseau)
 *   - useMock = false → backend GoldApp /api/maps/route (qui appelle OSRM avec
 *                        circuit breaker + cache Caffeine)
 *
 * On n'appelle JAMAIS OSRM public directement depuis le front :
 *   - quota 1 req/s/IP → l'API peut nous bannir en charge
 *   - pas de cache → coût latence à chaque navigation
 *   - pas de circuit breaker → cascade d'erreurs si OSRM tombe
 *   - incohérent avec le flag mock/live
 */
export async function getRoute(from: LatLng, to: LatLng, mode: TravelMode = 'driving'): Promise<RouteResult> {
  if (serviceConfig.useMock) return mockRoute(from, to, mode);

  const data = await apiRequest<{
    distanceMeters: number;
    durationSeconds: number;
    geometry: LatLng[];
  }>(
    `${endpoints.maps.route}?fromLat=${from.lat}&fromLng=${from.lng}&toLat=${to.lat}&toLng=${to.lng}&mode=${mode.toUpperCase()}`,
  );

  return { ...data, source: 'backend' };
}

/* ============================================================
   Calcul local (mock) — Haversine + vitesse moyenne
   ============================================================ */

const AVG_SPEED_KMH: Record<TravelMode, number> = {
  driving: 35,   // Dakar urbain : trafic moyen
  cycling: 14,
  walking: 4.8,
};

function mockRoute(from: LatLng, to: LatLng, mode: TravelMode): RouteResult {
  const distanceMeters = haversineMeters(from, to);
  const speedMs = (AVG_SPEED_KMH[mode] * 1000) / 3600;
  // +20 % de pénalité pour les détours réels (les routes ne sont pas droites)
  const durationSeconds = (distanceMeters / speedMs) * 1.2;

  return {
    distanceMeters,
    durationSeconds,
    // Ligne droite — le mode mock ne peut pas tracer les vraies rues
    geometry: [from, to],
    source: 'mock',
  };
}

function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/* ============================================================
   Formatters
   ============================================================ */

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}min` : `${hours}h`;
}

/** Pour l'affichage d'un badge dans l'UI. */
export function sourceLabel(source: RouteSource): string {
  switch (source) {
    case 'mock':    return 'Estimation locale';
    case 'backend': return 'Calcul réel · OSRM';
  }
}
