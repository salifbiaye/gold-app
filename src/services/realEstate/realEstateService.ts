import { apartments } from '../../data/mockData';
import { endpoints } from '../../config/api';
import { apiRequest } from '../api/client';
import { displayCurrency } from '../payments/types';
import { serviceConfig } from '../serviceConfig';

export type Apartment = {
  district: string;
  id: string;
  image: string;
  price: string;
  rating: string;
  title: string;
};

/** Format renvoyé par GET /api/realestate/properties (Spring Boot). */
type BackendProperty = {
  id: string;
  listing: 'RENT' | 'BUY';
  title: string;
  city: string;
  neighborhood: string;
  rooms: number;
  bathrooms: number;
  surfaceSqm: number;
  price: number;
  currency: string;
  priceUnit: string;
  photos: string[];
  description: string;
  furnished: boolean;
};

function propertyToApartment(p: BackendProperty): Apartment {
  return {
    id: p.id,
    title: p.title,
    district: `${p.neighborhood ? p.neighborhood + ', ' : ''}${p.city}`,
    image: p.photos[0] ?? '',
    price: `${p.price.toLocaleString('fr-FR')} ${displayCurrency(p.currency)}${p.priceUnit ? ' ' + p.priceUnit : ''}`,
    rating: p.rooms ? `${p.rooms} pièces · ${Math.round(p.surfaceSqm)} m²` : `${Math.round(p.surfaceSqm)} m²`,
  };
}

export async function getApartments(): Promise<Apartment[]> {
  if (serviceConfig.useMock) return apartments;
  const properties = await apiRequest<BackendProperty[]>(endpoints.realEstate.properties);
  return properties.map(propertyToApartment);
}
