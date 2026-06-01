import { paymentMenu } from '../../data/mockData';
import { endpoints } from '../../config/api';
import { apiRequest } from '../api/client';
import { serviceConfig } from '../serviceConfig';

export type PaymentMenuItem = {
  id: string;
  label: string;
  meta: string;
  icon: any;
  color: string;
};

export type MerchantPayPayload = { merchantCode: string; amount: number };
export type BillPayPayload = { provider: string; reference: string; amount: number };
export type AirtimePayload = { operator: string; phone: string; amount: number };
export type P2PPayload = { recipient: string; amount: number; note?: string };
export type PaymentRequestPayload = { amount: number; description: string };

export async function getPaymentMenu(): Promise<PaymentMenuItem[]> {
  if (serviceConfig.useMock) return paymentMenu;
  return paymentMenu;
}

export async function payMerchant(payload: MerchantPayPayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest(endpoints.payments.merchant, { method: 'POST', body: JSON.stringify(payload) });
}

export async function payBill(payload: BillPayPayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest(endpoints.payments.bills, { method: 'POST', body: JSON.stringify(payload) });
}

export async function sendAirtime(payload: AirtimePayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest(endpoints.payments.airtime, { method: 'POST', body: JSON.stringify(payload) });
}

export async function transferP2P(payload: P2PPayload): Promise<void> {
  if (serviceConfig.useMock) return;
  await apiRequest(endpoints.payments.transfer, { method: 'POST', body: JSON.stringify(payload) });
}

export async function requestPayment(payload: PaymentRequestPayload): Promise<{ requestId: string }> {
  if (serviceConfig.useMock) return { requestId: `REQ-${Date.now()}` };
  return apiRequest(endpoints.payments.paymentRequest, { method: 'POST', body: JSON.stringify(payload) });
}
