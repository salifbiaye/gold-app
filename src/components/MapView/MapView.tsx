// This file exists for TypeScript module resolution. At bundle time
// Metro replaces this with MapView.web.tsx on web and MapView.native.tsx
// on native. We re-export the native stub here so type-checking works.
export { MapView } from './MapView.native';
export type { MapProps } from './types';
