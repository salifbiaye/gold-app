import { buildPiSpiQrPayload, parsePiSpiQrPayload } from './pispiQr';
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

const notifications = new Map<string, PiSpiStatusNotification>();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function txId() {
  return `PIMOCK${Date.now().toString(36).toUpperCase()}`;
}

export const pispiMockClient: PiSpiClient = {
  createReceiveQr(input: PiSpiQrInput) {
    return buildPiSpiQrPayload(input);
  },

  parseQr(raw: string) {
    return parsePiSpiQrPayload(raw);
  },

  async initiatePayment(request: PiSpiPaymentInitRequest): Promise<PiSpiPaymentInitResult> {
    await delay(450);
    return {
      error: 0,
      montant: request.montant,
      message: 'Alias verifie avec succes dans PI-SPI',
      payeurNom: 'Client PI-SPI Demo',
      statut: 'EN ATTENTE DE VERIFICATION',
      txId: txId(),
    };
  },

  async confirmPayment(request: PiSpiPaymentConfirmationRequest): Promise<PiSpiPaymentConfirmationResult> {
    await delay(650);
    const montant = 8500;
    const statut = request.confirmation ? 'ENVOYE A PI-SPI' : 'PAIEMENT_REJETE';
    const result = {
      error: 0,
      montant,
      message: request.confirmation ? 'Paiement envoye a PI-SPI' : 'Paiement rejete par utilisateur',
      statut,
      txId: request.txId,
    } satisfies PiSpiPaymentConfirmationResult;

    notifications.set(request.txId, {
      aliasTresor: 'ff7057a6-1c70-4d2e-b068-49bb4745697a',
      montant,
      client: 'Client PI-SPI Demo',
      createdAt: new Date().toISOString(),
      end2endId: `E2E-${request.txId}`,
      motif: 'Paiement QR PI-SPI mock',
      status: request.confirmation ? 'PAIEMENT_ENVOYE' : 'PAIEMENT_REJETE',
      txId: request.txId,
    });

    return result;
  },

  async initiatePaymentRequest(request: PiSpiPaymentRequestInitRequest): Promise<PiSpiPaymentRequestInitResult> {
    await delay(450);
    return {
      error: 0,
      montant: request.montant,
      message: 'Alias verifie avec succes dans PI-SPI',
      numero: null,
      payeurNom: 'Client PI-SPI Demo',
      statut: 'EN ATTENTE DE VERIFICATION',
      txId: txId(),
    };
  },

  async confirmPaymentRequest(request: PiSpiPaymentRequestConfirmationRequest): Promise<PiSpiPaymentRequestConfirmationResult> {
    await delay(650);
    const montant = 12900;
    const statut = request.confirmation ? 'EN ATTENTE DE CONFIRMATION' : 'RTP_REJETE';
    const result = {
      error: 0,
      montant,
      message: request.confirmation ? 'Demande de paiement envoyee avec succes' : 'Demande de paiement rejetee',
      statut,
      txId: request.txId,
    } satisfies PiSpiPaymentRequestConfirmationResult;

    notifications.set(request.txId, {
      aliasTresor: 'ff7057a6-1c70-4d2e-b068-49bb4745697a',
      montant,
      client: 'Client PI-SPI Demo',
      createdAt: new Date().toISOString(),
      end2endId: `RTP-${request.txId}`,
      motif: 'Demande de paiement PI-SPI mock',
      refInterne: request.txId,
      status: request.confirmation ? 'PAIEMENT_RECU' : 'RTP_REJETE',
      txId: request.txId,
    });

    return result;
  },

  async getLastNotification(txId: string): Promise<PiSpiStatusNotification | null> {
    await delay(300);
    return notifications.get(txId) ?? null;
  },

  async listTransactions(): Promise<PiSpiStatusNotification[]> {
    await delay(300);
    return Array.from(notifications.values()).reverse();
  },
};
