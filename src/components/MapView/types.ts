export type LatLng = { lat: number; lng: number };

export type MapMarker = {
  id: string;
  position: LatLng;
  label?: string;
  caption?: string;
  color?: string;
};

export type MapRoute = {
  points: LatLng[];
  color?: string;
  width?: number;
};

export type MapProps = {
  center: LatLng;
  zoom?: number;
  markers?: MapMarker[];
  route?: MapRoute;
  onMarkerPress?: (markerId: string) => void;
  onMapClick?: (position: LatLng) => void;
  height?: number | string;
  borderRadius?: number;
  theme?: 'light' | 'dark';
};

export const DAKAR: LatLng = { lat: 14.6928, lng: -17.4467 };
