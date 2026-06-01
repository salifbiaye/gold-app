import { transactions, walletActions } from '../../data/mockData';
import { endpoints } from '../../config/api';
import type { ServiceId } from '../../types/service';
import { apiRequest } from '../api/client';
import {
  displayCurrency,
  formatTransactionAmount,
  formatTransactionTime,
  transactionLabel,
  type BackendTransaction,
} from '../payments/types';
import { serviceConfig } from '../serviceConfig';

export type WalletBalance = {
  balance: number;
  locked: number;
  currency: string;
  walletId: string;
  status: string;
  lastOperation: string;
};

export type WalletTransaction = {
  id: string;
  label: string;
  meta: string;
  amount: string;
  icon: any;
  color: string;
};

export type WalletAction = {
  id: string;
  label: string;
  icon: any;
};

export type WalletOverview = {
  balance: number;
  currency: string;
  transactions: Array<{ amount: string; id: string; label: string; time: string; type: ServiceId }>;
};

export type TransferPayload = { beneficiary: string; amount: number; note?: string };
export type PayPayload = { merchantCode: string; amount: number };
export type WithdrawPayload = { agent: string; amount: number };
export type TopupPayload = { operator: string; account: string; amount: number };
export type BillPayload = { provider: string; reference: string; amount: number };
export type CreditPayload = { operator: string; phone: string; amount: number };

// ---------- Mocks ----------

const MOCK_BALANCE: WalletBalance = {
  balance: 125600,
  locked: 0,
  currency: 'FCFA',
  walletId: 'GLD-0012-7745',
  status: 'Actif · Vérifié',
  lastOperation: "Aujourd'hui 12:45",
};

const MOCK_OVERVIEW: WalletOverview = {
  balance: 125600,
  currency: 'FCFA',
  transactions: [
    { id: 't1', label: 'Paiement restaurant', time: "Aujourd'hui, 12:45", amount: '- 8 500 FCFA', type: 'alimentation' },
    { id: 't2', label: 'Transfert a O. Diop', time: 'Hier, 18:30', amount: '- 25 000 FCFA', type: 'paiements' },
    { id: 't3', label: 'Recharge Orange', time: 'Hier, 10:15', amount: '- 2 000 FCFA', type: 'paiements' },
    { id: 't4', label: 'Livraison Chez Fatou', time: '20 mai, 14:22', amount: '- 15 500 FCFA', type: 'livraison' },
  ],
};

// ---------- Mapping backend ↔ front ----------

/** Backend renvoie { userId, balance: BigDecimal, currency: "XOF" } */
type BackendWallet = { userId: string; balance: number; currency: string };

function backendToWalletBalance(b: BackendWallet): WalletBalance {
  return {
    balance: b.balance,
    locked: 0,
    currency: displayCurrency(b.currency),
    walletId: `GLD-${b.userId.slice(0, 8).toUpperCase()}`,
    status: 'Actif',
    lastOperation: '',
  };
}

function backendToWalletTransactions(rows: BackendTransaction[]): WalletTransaction[] {
  return rows.map((t) => ({
    id: t.id,
    label: transactionLabel(t),
    meta: formatTransactionTime(t.createdAt),
    amount: formatTransactionAmount(t),
    icon: null,
    color: t.type === 'CREDIT' ? '#0EB56D' : '#FF6848',
  }));
}

// ---------- Reads ----------

export async function getWalletBalance(): Promise<WalletBalance> {
  if (serviceConfig.useMock) return MOCK_BALANCE;
  const raw = await apiRequest<BackendWallet>(endpoints.payments.walletBalance);
  return backendToWalletBalance(raw);
}

export async function getWalletTransactions(): Promise<WalletTransaction[]> {
  if (serviceConfig.useMock) return transactions;
  const raw = await apiRequest<BackendTransaction[]>(endpoints.payments.walletTransactions);
  return backendToWalletTransactions(raw);
}

export async function getWalletActions(): Promise<WalletAction[]> {
  // Toujours mock — pas d'endpoint backend (les "actions" sont des raccourcis UI, pas des données serveur)
  return walletActions;
}

export async function getWalletOverview(): Promise<WalletOverview> {
  if (serviceConfig.useMock) return MOCK_OVERVIEW;
  const [balance, txs] = await Promise.all([
    apiRequest<BackendWallet>(endpoints.payments.walletBalance),
    apiRequest<BackendTransaction[]>(endpoints.payments.walletTransactions),
  ]);
  return {
    balance: balance.balance,
    currency: displayCurrency(balance.currency),
    transactions: txs.slice(0, 6).map((t) => ({
      id: t.id,
      label: transactionLabel(t),
      time: formatTransactionTime(t.createdAt),
      amount: formatTransactionAmount(t),
      type: 'paiements' as ServiceId,
    })),
  };
}

// ---------- Writes ----------

export async function transfer(payload: TransferPayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest(endpoints.payments.transfer, {
    method: 'POST',
    body: JSON.stringify({
      toAlias: payload.beneficiary,
      amount: payload.amount,
      label: payload.note,
    }),
  });
}

export async function payMerchant(payload: PayPayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest(endpoints.payments.merchant, {
    method: 'POST',
    body: JSON.stringify({
      merchantId: payload.merchantCode,
      amount: payload.amount,
    }),
  });
}

export async function withdraw(payload: WithdrawPayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest(endpoints.payments.cashout, {
    method: 'POST',
    body: JSON.stringify({
      amount: payload.amount,
      agencyCode: payload.agent,
    }),
  });
}

export async function topup(payload: TopupPayload): Promise<void> {
  // Pas d'endpoint backend dédié pour le moment — no-op en LIVE
  if (serviceConfig.useMock) return;
  return;
}

export async function payBill(payload: BillPayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest(endpoints.payments.bills, {
    method: 'POST',
    body: JSON.stringify({
      billerCode: payload.provider,
      reference: payload.reference,
      amount: payload.amount,
    }),
  });
}

export async function rechargeCredit(payload: CreditPayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest(endpoints.payments.airtime, {
    method: 'POST',
    body: JSON.stringify({
      phone: payload.phone,
      amount: payload.amount,
    }),
  });
}
