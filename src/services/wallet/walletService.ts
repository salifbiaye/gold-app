import { transactions } from '../../data/mockData';
import { endpoints } from '../../config/api';
import { apiRequest } from '../api/client';
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

export type TransferPayload = { beneficiary: string; amount: number; note?: string };
export type PayPayload = { merchantCode: string; amount: number };
export type WithdrawPayload = { agent: string; amount: number };
export type TopupPayload = { operator: string; account: string; amount: number };
export type BillPayload = { provider: string; reference: string; amount: number };
export type CreditPayload = { operator: string; phone: string; amount: number };

const MOCK_BALANCE: WalletBalance = {
  balance: 125600,
  locked: 0,
  currency: 'FCFA',
  walletId: 'GLD-0012-7745',
  status: 'Actif · Vérifié',
  lastOperation: "Aujourd'hui 12:45",
};

export async function getWalletBalance(): Promise<WalletBalance> {
  if (serviceConfig.useMock) return MOCK_BALANCE;
  return apiRequest<WalletBalance>(endpoints.wallet.balance);
}

export async function getWalletTransactions(): Promise<WalletTransaction[]> {
  if (serviceConfig.useMock) return transactions;
  return apiRequest<WalletTransaction[]>(endpoints.wallet.transactions);
}

export async function transfer(payload: TransferPayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest(endpoints.wallet.transfer ?? '/wallet/transfer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function payMerchant(payload: PayPayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest('/wallet/pay', { method: 'POST', body: JSON.stringify(payload) });
}

export async function withdraw(payload: WithdrawPayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest('/wallet/withdraw', { method: 'POST', body: JSON.stringify(payload) });
}

export async function topup(payload: TopupPayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest('/wallet/topup', { method: 'POST', body: JSON.stringify(payload) });
}

export async function payBill(payload: BillPayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest('/wallet/bill', { method: 'POST', body: JSON.stringify(payload) });
}

export async function rechargeCredit(payload: CreditPayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest('/wallet/credit', { method: 'POST', body: JSON.stringify(payload) });
}
