import { popularServices } from '../../data/mockData';
import { endpoints } from '../../config/api';
import type { ServiceId } from '../../types/service';
import { apiRequest } from '../api/client';
import {
  formatTransactionAmount,
  formatTransactionTime,
  transactionLabel,
  type BackendTransaction,
} from '../payments/types';
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

export type DashboardData = {
  activities: Array<{ amount: string; id: string; label: string; time: string }>;
  services: ServiceId[];
  walletBalance: number;
};

const POPULAR_SERVICES: ServiceId[] = [
  'transport', 'livraison', 'immobilier', 'sante',
  'alimentation', 'education', 'tourisme', 'paiements',
];

const MOCK_BANNERS: PromoBanner[] = [
  { id: 'b1', title: '0% de frais', subtitle: 'Sur les transferts ce weekend', cta: 'Transférer' },
  { id: 'b2', title: 'Cashback 5%', subtitle: 'Paiement chez les marchands partenaires', cta: 'Découvrir' },
];

const MOCK_DASHBOARD: DashboardData = {
  walletBalance: 125600,
  services: POPULAR_SERVICES,
  activities: [
    { id: 'a1', label: 'Paiement restaurant', time: "Aujourd'hui, 12:45", amount: '- 8 500 FCFA' },
    { id: 'a2', label: 'Course confirmée',    time: 'Hier, 18:30',         amount: '- 3 500 FCFA' },
    { id: 'a3', label: 'Recharge Orange',     time: 'Hier, 10:15',         amount: '- 2 000 FCFA' },
  ],
};

/** Format renvoyé par GET /api/home/dashboard (Spring Boot HomeService.build()). */
type BackendDashboard = {
  wallet: { userId: string; balance: number; currency: string };
  recentTransactions: BackendTransaction[];
  activeOrders: unknown[];
  quickActions: unknown[];
  promos: Array<{ id: string; title: string; subtitle: string; imageUrl: string; ctaRoute: string }>;
};

export async function getPopularServices(): Promise<HomeService[]> {
  // Catalogue statique côté UI — pas d'endpoint backend dédié
  return popularServices;
}

export async function getPromoBanners(): Promise<PromoBanner[]> {
  // Promos viennent du payload /home/dashboard, on garde un mock pour l'UI legacy
  return MOCK_BANNERS;
}

export async function getDashboard(): Promise<DashboardData> {
  if (serviceConfig.useMock) return MOCK_DASHBOARD;

  const data = await apiRequest<BackendDashboard>(endpoints.home.dashboard);
  return {
    walletBalance: data.wallet.balance,
    services: POPULAR_SERVICES,
    activities: data.recentTransactions.slice(0, 5).map((t) => ({
      id: t.id,
      label: transactionLabel(t),
      time: formatTransactionTime(t.createdAt),
      amount: formatTransactionAmount(t),
    })),
  };
}
