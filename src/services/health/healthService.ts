import { doctors, healthServices } from '../../data/mockData';
import { apiRequest } from '../api/client';
import { serviceConfig } from '../serviceConfig';

export type Doctor = { id: string; name: string; job: string; state: string };
export type HealthService = { id: string; label: string; icon: any; tint: string };
export type AppointmentPayload = { doctorId: string; date: string; reason: string };

export async function getHealthServices(): Promise<HealthService[]> {
  if (serviceConfig.useMock) return healthServices;
  return apiRequest<HealthService[]>('/health/services');
}

export async function getDoctors(): Promise<Doctor[]> {
  if (serviceConfig.useMock) return doctors;
  return apiRequest<Doctor[]>('/health/doctors');
}

export async function bookAppointment(payload: AppointmentPayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest('/health/appointments', { method: 'POST', body: JSON.stringify(payload) });
}
