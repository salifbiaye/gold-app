import { createElement, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import type { LatLng, MapMarker, MapProps, MapRoute } from './types';

/**
 * MapView.web — Leaflet dans un iframe.
 *
 * IMPORTANT : l'HTML est construit UNE SEULE FOIS au montage. Les changements de markers,
 * route, center, zoom, theme passent par postMessage → l'iframe applique les modifs en
 * place sans recharger. C'est ce qui évite le clignotement à chaque clic sur un résultat.
 */

function cleanDomStyle(style: object) {
  return Object.fromEntries(Object.entries(style).filter(([key]) => Number.isNaN(Number(key))));
}

function buildInitialHtml(initialCenter: LatLng, initialZoom: number, initialTheme: 'light' | 'dark') {
  return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; }
    body { background: #edf3f0; font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif; transition: background 200ms; }
    body.dark { background: #171717; }
    .leaflet-control-attribution { display: none; }
    .gold-popup-title { color: #0a0f14; font-size: 13px; font-weight: 800; }
    .gold-popup-caption { color: #687484; font-size: 12px; margin-top: 4px; }
    .leaflet-bar a { background: #ffffff; color: #0a0f14; }
    body.dark .leaflet-bar a { background: #171717; border-bottom-color: #333; color: #f5f5f5; }
    body.dark .leaflet-bar a:hover { background: #222; }
    body.dark .leaflet-bar { border-color: rgba(255,255,255,.12); box-shadow: 0 12px 28px rgba(0,0,0,.3); }
  </style>
</head>
<body class="${initialTheme === 'dark' ? 'dark' : ''}">
  <div id="map"></div>
  <script>
    (function () {
      var TILE_LIGHT = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      var TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

      var map = L.map('map', { attributionControl: false, zoomControl: false })
                  .setView([${initialCenter.lat}, ${initialCenter.lng}], ${initialZoom});
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      var tileLayer = L.tileLayer(${initialTheme === 'dark' ? 'TILE_DARK' : 'TILE_LIGHT'}, { maxZoom: 19 }).addTo(map);

      // Layers groups pour pouvoir clearLayers() sans toucher au tile layer
      var markersLayer = L.layerGroup().addTo(map);
      var routeLayer = L.layerGroup().addTo(map);

      function pin(color) {
        return L.divIcon({
          html: '<div style="width:26px;height:26px;border-radius:999px;background:' + color
              + ';border:3px solid #fff;box-shadow:0 6px 14px rgba(0,0,0,.18);"></div>',
          className: 'gold-map-pin',
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });
      }

      function applyMarkers(markers) {
        markersLayer.clearLayers();
        (markers || []).forEach(function (marker) {
          var m = L.marker([marker.position.lat, marker.position.lng], { icon: pin(marker.color || '#0EB56D') }).addTo(markersLayer);
          if (marker.label || marker.caption) {
            m.bindPopup(
              '<div>' +
              (marker.label ? '<div class="gold-popup-title">' + marker.label + '</div>' : '') +
              (marker.caption ? '<div class="gold-popup-caption">' + marker.caption + '</div>' : '') +
              '</div>'
            );
          }
          m.on('click', function (ev) {
            // Empêche la propagation au map.on('click') — sinon le parent reçoit
            // ET 'marker' ET 'map-click' au même clic.
            if (ev && ev.originalEvent) L.DomEvent.stopPropagation(ev);
            window.parent.postMessage({ source: 'gold-map', type: 'marker', id: marker.id }, '*');
          });
        });
      }

      function applyRoute(route) {
        routeLayer.clearLayers();
        if (!route || !route.points || route.points.length < 2) return;
        L.polyline(route.points.map(function (p) { return [p.lat, p.lng]; }), {
          color: route.color || '#0EB56D',
          weight: route.width || 5,
          opacity: 0.85
        }).addTo(routeLayer);
        L.circleMarker([route.points[0].lat, route.points[0].lng], {
          radius: 7, color: '#0A0F14', fillColor: '#FFFFFF', fillOpacity: 1, weight: 3
        }).addTo(routeLayer);
        var last = route.points[route.points.length - 1];
        L.circleMarker([last.lat, last.lng], {
          radius: 7, color: '#0EB56D', fillColor: '#0EB56D', fillOpacity: 1, weight: 3
        }).addTo(routeLayer);
      }

      function applyTheme(theme) {
        document.body.classList.toggle('dark', theme === 'dark');
        map.removeLayer(tileLayer);
        tileLayer = L.tileLayer(theme === 'dark' ? TILE_DARK : TILE_LIGHT, { maxZoom: 19 }).addTo(map);
      }

      function applyCenter(center, zoom) {
        if (!center) return;
        map.setView([center.lat, center.lng], zoom != null ? zoom : map.getZoom(), { animate: true });
      }

      // Click sur la map = signal au parent (peut servir au picker de position)
      map.on('click', function (event) {
        window.parent.postMessage({
          source: 'gold-map',
          type: 'map-click',
          position: { lat: event.latlng.lat, lng: event.latlng.lng }
        }, '*');
      });

      // Écoute les updates du host
      window.addEventListener('message', function (event) {
        var msg = event.data;
        if (!msg || msg.source !== 'gold-map-host') return;
        if (msg.type === 'updateMarkers') applyMarkers(msg.markers);
        if (msg.type === 'updateRoute') applyRoute(msg.route);
        if (msg.type === 'updateTheme') applyTheme(msg.theme);
        if (msg.type === 'updateCenter') applyCenter(msg.center, msg.zoom);
        if (msg.type === 'bulk') {
          if (msg.markers !== undefined) applyMarkers(msg.markers);
          if (msg.route !== undefined) applyRoute(msg.route);
          if (msg.theme !== undefined) applyTheme(msg.theme);
          if (msg.center !== undefined) applyCenter(msg.center, msg.zoom);
        }
      });

      // Signale au parent qu'on est prêt à recevoir des updates
      window.parent.postMessage({ source: 'gold-map', type: 'ready' }, '*');
    })();
  </script>
</body>
</html>`;
}

export function MapView({
  borderRadius = 16,
  center,
  height = 480,
  markers,
  onMapClick,
  onMarkerPress,
  route,
  theme = 'light',
  zoom = 13,
}: MapProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const readyRef = useRef(false);
  // Cache du dernier état envoyé pour replay si l'iframe annonce "ready" après les premiers props
  const pendingRef = useRef<{
    markers?: MapMarker[];
    route?: MapRoute;
    theme?: 'light' | 'dark';
    center?: LatLng;
    zoom?: number;
  }>({});

  // HTML construit UNE SEULE FOIS — la map n'est jamais détruite ensuite.
  // On utilise un useRef pour la stocker (et non useMemo qui peut être réévalué).
  const htmlRef = useRef<string | null>(null);
  if (htmlRef.current === null) {
    htmlRef.current = buildInitialHtml(center, zoom, theme);
  }

  // Listener pour messages venant de l'iframe (marker click, map click, ready)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.source !== 'gold-map') return;
      if (event.data.type === 'ready') {
        readyRef.current = true;
        // Replay le dernier état
        const p = pendingRef.current;
        if (Object.keys(p).length > 0) postBulk(p);
        return;
      }
      if (event.data.type === 'marker') onMarkerPress?.(event.data.id);
      if (event.data.type === 'map-click') onMapClick?.(event.data.position as LatLng);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onMapClick, onMarkerPress]);

  function postBulk(payload: typeof pendingRef.current) {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ source: 'gold-map-host', type: 'bulk', ...payload }, '*');
  }

  // Push markers when they change
  useEffect(() => {
    pendingRef.current.markers = markers ?? [];
    if (readyRef.current) postBulk({ markers: markers ?? [] });
  }, [markers]);

  // Push route when it changes
  useEffect(() => {
    pendingRef.current.route = route;
    if (readyRef.current) postBulk({ route });
  }, [route]);

  // Push theme
  useEffect(() => {
    pendingRef.current.theme = theme;
    if (readyRef.current) postBulk({ theme });
  }, [theme]);

  // Push center/zoom
  useEffect(() => {
    pendingRef.current.center = center;
    pendingRef.current.zoom = zoom;
    if (readyRef.current) postBulk({ center, zoom });
  }, [center.lat, center.lng, zoom]);

  const flatStyle = cleanDomStyle(StyleSheet.flatten({ borderRadius, height, overflow: 'hidden', width: '100%' }) ?? {});

  return createElement('iframe', {
    ref: iframeRef,
    srcDoc: htmlRef.current,
    style: {
      ...flatStyle,
      border: 0,
      display: 'block',
    },
  });
}

export type { MapProps } from './types';
