import { transportOptions } from '../../data/mockData';
import { apiRequest } from '../api/client';
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

export async function getTransportOptions(): Promise<TransportOption[]> {
  if (serviceConfig.useMock) return transportOptions;
  return apiRequest<TransportOption[]>('/transport/options');
}

export async function bookRide(payload: BookingPayload): Promise<{ bookingId: string }> {
  if (serviceConfig.useMock) return { bookingId: `RIDE-${Date.now()}` };
  return apiRequest('/transport/book', { method: 'POST', body: JSON.stringify(payload) });
}
