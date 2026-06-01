import { doctors, healthServices } from '../../data/mockData';
import { endpoints } from '../../config/api';
import { apiRequest } from '../api/client';
import { serviceConfig } from '../serviceConfig';

export type Doctor = { id: string; name: string; job: string; state: string };
export type HealthService = { id: string; label: string; icon: any; tint: string };
export type AppointmentPayload = { doctorId: string; date: string; reason: string };

/** Format renvoyé par GET /api/health/offers (Spring Boot). */
type BackendOffer = {
  id: string;
  kind: 'PHARMACY' | 'APPOINTMENT' | 'TELECONSULT';
  name: string;
  provider: string;
  location: string;
  specialty: string | null;
  price: number;
  currency: string;
  availableSlots: string[];
  ratingAvg: number;
};

function offerToDoctor(o: BackendOffer): Doctor {
  return {
    id: o.id,
    name: o.name,
    job: o.specialty ?? 'Médecin',
    state: o.location,
  };
}

function offerToHealthService(o: BackendOffer): HealthService {
  return {
    id: o.id,
    label: o.name,
    icon: null,
    tint: o.kind === 'PHARMACY' ? '#0EB56D' : o.kind === 'APPOINTMENT' ? '#3388F2' : '#A87E58',
  };
}

export async function getHealthServices(): Promise<HealthService[]> {
  if (serviceConfig.useMock) return healthServices;
  const offers = await apiRequest<BackendOffer[]>(`${endpoints.health.offers}?kind=PHARMACY`);
  return offers.map(offerToHealthService);
}

export async function getDoctors(): Promise<Doctor[]> {
  if (serviceConfig.useMock) return doctors;
  const offers = await apiRequest<BackendOffer[]>(`${endpoints.health.offers}?kind=APPOINTMENT`);
  return offers.map(offerToDoctor);
}

export async function bookAppointment(payload: AppointmentPayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest(endpoints.health.bookings, {
    method: 'POST',
    body: JSON.stringify({ offerId: payload.doctorId, slot: payload.date }),
  });
}
