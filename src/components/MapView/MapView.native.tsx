import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import NativeMapView, { Circle, Marker, Polyline, type MapPressEvent, type Region } from 'react-native-maps';
import type { LatLng, MapProps } from './types';

const LATITUDE_DELTA_BY_ZOOM: Record<number, number> = {
  10: 0.32,
  11: 0.22,
  12: 0.12,
  13: 0.07,
  14: 0.035,
  15: 0.018,
  16: 0.01,
};

function regionFromCenter(center: LatLng, zoom = 13): Region {
  const latitudeDelta = LATITUDE_DELTA_BY_ZOOM[Math.round(zoom)] ?? 0.07;
  return {
    latitude: center.lat,
    longitude: center.lng,
    latitudeDelta,
    longitudeDelta: latitudeDelta * 0.75,
  };
}

export function MapView({ borderRadius = 16, center, height = 480, markers, onMapClick, onMarkerPress, route, zoom = 13 }: MapProps) {
  const mapRef = useRef<NativeMapView | null>(null);
  const numericHeight = typeof height === 'string' ? 480 : height;

  useEffect(() => {
    mapRef.current?.animateToRegion(regionFromCenter(center, zoom), 450);
  }, [center.lat, center.lng, zoom]);

  const handlePress = (event: MapPressEvent) => {
    onMapClick?.({
      lat: event.nativeEvent.coordinate.latitude,
      lng: event.nativeEvent.coordinate.longitude,
    });
  };

  return (
    <View style={[styles.shell, { borderRadius, height: numericHeight }]}>
      <NativeMapView
        ref={mapRef}
        initialRegion={regionFromCenter(center, zoom)}
        onPress={handlePress}
        showsCompass={false}
        showsMyLocationButton
        showsUserLocation
        style={StyleSheet.absoluteFill}
      >
        {markers?.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.position.lat, longitude: marker.position.lng }}
            description={marker.caption}
            onPress={() => onMarkerPress?.(marker.id)}
            pinColor={marker.color ?? '#0EB56D'}
            title={marker.label}
          />
        ))}

        {route && route.points.length > 1 && (
          <>
            <Polyline
              coordinates={route.points.map((point) => ({ latitude: point.lat, longitude: point.lng }))}
              strokeColor={route.color ?? '#0EB56D'}
              strokeWidth={route.width ?? 5}
            />
            <Circle
              center={{ latitude: route.points[0].lat, longitude: route.points[0].lng }}
              fillColor="#FFFFFF"
              radius={12}
              strokeColor="#0A0F14"
              strokeWidth={3}
            />
            <Circle
              center={{
                latitude: route.points[route.points.length - 1].lat,
                longitude: route.points[route.points.length - 1].lng,
              }}
              fillColor="#0EB56D"
              radius={12}
              strokeColor="#0EB56D"
              strokeWidth={3}
            />
          </>
        )}
      </NativeMapView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    width: '100%',
  },
});

export type { MapProps } from './types';
