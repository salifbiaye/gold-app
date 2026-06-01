import { transportOptions } from '../../data/mockData';
import { endpoints } from '../../config/api';
import { apiRequest } from '../api/client';
import { displayCurrency } from '../payments/types';
import { serviceConfig } from '../serviceConfig';

export type TransportOption = {
  id: string;
  label: string;
  time: string;
  price: string;
  icon: any;
};

export type BookingPayload = {
  optionId: string;
  origin: { lat: number; lng: number; address: string };
  destination: string;
};

/** Format renvoyé par GET /api/transport/offers (Spring Boot). */
type BackendTransportOffer = {
  id: string;
  category: 'VEHICLE_RENTAL' | 'VEHICLE_PURCHASE' | 'COURIER' | 'GP' | 'PARKING';
  title: string;
  provider: string;
  location: string;
  price: number;
  priceUnit: string;
  imageUrl: string;
  ratingAvg: number;
  ratingCount: number;
};

function offerToOption(o: BackendTransportOffer): TransportOption {
  return {
    id: o.id,
    label: o.title,
    time: o.priceUnit,
    // Le backend ne renvoie pas de currency sur l'offer — on assume XOF
    price: `${o.price.toLocaleString('fr-FR')} ${displayCurrency('XOF')}`,
    icon: null,
  };
}

export async function getTransportOptions(): Promise<TransportOption[]> {
  if (serviceConfig.useMock) return transportOptions;
  const offers = await apiRequest<BackendTransportOffer[]>(endpoints.transport.offers);
  return offers.map(offerToOption);
}

export async function bookRide(payload: BookingPayload): Promise<{ bookingId: string }> {
  if (serviceConfig.useMock) return { bookingId: `RIDE-${Date.now()}` };
  const booking = await apiRequest<{ id: string }>(endpoints.transport.bookings, {
    method: 'POST',
    body: JSON.stringify({ offerId: payload.optionId, startAt: new Date().toISOString() }),
  });
  return { bookingId: booking.id };
}
