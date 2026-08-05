import type {
  PiSpiClient,
  PiSpiPaymentConfirmationRequest,
  PiSpiPaymentConfirmationResult,
  PiSpiPaymentInitRequest,
  PiSpiPaymentInitResult,
  PiSpiPaymentRequestConfirmationRequest,
  PiSpiPaymentRequestConfirmationResult,
  PiSpiPaymentRequestInitRequest,
  PiSpiPaymentRequestInitResult,
  PiSpiQrInput,
  PiSpiStatusNotification,
} from './pispiTypes';
import { buildPiSpiQrPayload, parsePiSpiQrPayload } from './pispiQr';
import { endpoints } from '../../config/api';
import { apiRequest } from '../api/client';

type BackendPiSpiOperationResponse = {
  error: number;
  localId?: string;
  message: string;
  montant: number;
  numero?: string | null;
  payeurNom: string | null;
  statut: string;
  txId: string;
};

type BackendPiSpiStatusResponse = {
  aliasTresor?: string | null;
  client?: string | null;
  createdAt?: string | null;
  flow?: 'PAYMENT' | 'PAYMENT_REQUEST' | 'QR_INCOMING' | null;
  localId?: string;
  montant?: number | null;
  motif?: string | null;
  payeAlias?: string | null;
  payeurAlias?: string | null;
  refInterne?: string | null;
  status: string;
  txId?: string | null;
  updatedAt?: string | null;
  webhookReceivedAt?: string | null;
};

function ensureOperationSuccess(response: BackendPiSpiOperationResponse) {
  if (response.error !== 0) {
    throw new Error(response.message || 'Donnees invalides.');
  }

  if (!response.txId) {
    throw new Error('Transaction PI-SPI sans identifiant. Verification impossible.');
  }
}

function toPaymentInitResult(response: BackendPiSpiOperationResponse): PiSpiPaymentInitResult {
  ensureOperationSuccess(response);
  return {
    error: response.error,
    message: response.message,
    montant: response.montant,
    payeurNom: response.payeurNom ?? '',
    statut: response.statut as PiSpiPaymentInitResult['statut'],
    txId: response.txId,
  };
}

function toPaymentConfirmationResult(response: BackendPiSpiOperationResponse): PiSpiPaymentConfirmationResult {
  ensureOperationSuccess(response);
  return {
    error: response.error,
    message: response.message,
    montant: response.montant,
    statut: response.statut as PiSpiPaymentConfirmationResult['statut'],
    txId: response.txId,
  };
}

function toPaymentRequestInitResult(response: BackendPiSpiOperationResponse): PiSpiPaymentRequestInitResult {
  ensureOperationSuccess(response);
  return {
    error: response.error,
    message: response.message,
    montant: response.montant,
    numero: response.numero,
    payeurNom: response.payeurNom ?? '',
    statut: response.statut as PiSpiPaymentRequestInitResult['statut'],
    txId: response.txId,
  };
}

function toPaymentRequestConfirmationResult(response: BackendPiSpiOperationResponse): PiSpiPaymentRequestConfirmationResult {
  ensureOperationSuccess(response);
  return {
    error: response.error,
    message: response.message,
    montant: response.montant,
    statut: response.statut as PiSpiPaymentRequestConfirmationResult['statut'],
    txId: response.txId,
  };
}

function toStatusNotification(response: BackendPiSpiStatusResponse): PiSpiStatusNotification {
  return {
    aliasTresor: response.aliasTresor ?? '',
    client: response.client ?? '',
    createdAt: response.webhookReceivedAt ?? response.updatedAt ?? response.createdAt ?? new Date().toISOString(),
    flow: response.flow ?? undefined,
    montant: response.montant ?? 0,
    motif: response.motif ?? undefined,
    payeAlias: response.payeAlias ?? undefined,
    payeurAlias: response.payeurAlias ?? undefined,
    refInterne: response.refInterne ?? undefined,
    status: response.status as PiSpiStatusNotification['status'],
    txId: response.txId ?? response.refInterne ?? '',
  };
}

export const pispiApiClient: PiSpiClient = {
  createReceiveQr(input: PiSpiQrInput) {
    return buildPiSpiQrPayload(input);
  },

  parseQr(raw: string) {
    return parsePiSpiQrPayload(raw);
  },

  async initiatePayment(request: PiSpiPaymentInitRequest) {
    const response = await apiRequest<BackendPiSpiOperationResponse>(endpoints.payments.pispi.paymentInit, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return toPaymentInitResult(response);
  },

  async confirmPayment(request: PiSpiPaymentConfirmationRequest) {
    const response = await apiRequest<BackendPiSpiOperationResponse>(endpoints.payments.pispi.paymentConfirm, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return toPaymentConfirmationResult(response);
  },

  async initiatePaymentRequest(request: PiSpiPaymentRequestInitRequest) {
    const response = await apiRequest<BackendPiSpiOperationResponse>(endpoints.payments.pispi.paymentRequestInit, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return toPaymentRequestInitResult(response);
  },

  async confirmPaymentRequest(request: PiSpiPaymentRequestConfirmationRequest) {
    const response = await apiRequest<BackendPiSpiOperationResponse>(endpoints.payments.pispi.paymentRequestConfirm, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return toPaymentRequestConfirmationResult(response);
  },

  async getLastNotification(txId: string) {
    const response = await apiRequest<BackendPiSpiStatusResponse>(endpoints.payments.pispi.transactionStatus(txId), {
      method: 'GET',
    });
    return toStatusNotification(response);
  },

  async listTransactions() {
    const response = await apiRequest<BackendPiSpiStatusResponse[]>(endpoints.payments.pispi.transactions, {
      method: 'GET',
    });
    return response.map(toStatusNotification);
  },
};
