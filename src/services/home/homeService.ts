import { popularServices } from '../../data/mockData';
import { apiRequest } from '../api/client';
import { serviceConfig } from '../serviceConfig';

export type HomeService = {
  id: string;
  label: string;
  icon: any;
  tint: string;
  route?: string;
};

export type PromoBanner = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
};

const MOCK_BANNERS: PromoBanner[] = [
  { id: 'b1', title: '0% de frais', subtitle: 'Sur les transferts ce weekend', cta: 'Transférer' },
  { id: 'b2', title: 'Cashback 5%', subtitle: 'Paiement chez les marchands partenaires', cta: 'Découvrir' },
];

export async function getPopularServices(): Promise<HomeService[]> {
  if (serviceConfig.useMock) return popularServices;
  return apiRequest<HomeService[]>('/home/services');
}

export async function getPromoBanners(): Promise<PromoBanner[]> {
  if (serviceConfig.useMock) return MOCK_BANNERS;
  return apiRequest<PromoBanner[]>('/home/banners');
}
