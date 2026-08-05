import { serviceConfig } from '../serviceConfig';
import { pispiApiClient } from './pispiApiClient';
import { pispiMockClient } from './pispiMockClient';
import type { PiSpiClient } from './pispiTypes';

const client: PiSpiClient = serviceConfig.useMock ? pispiMockClient : pispiApiClient;

export const pispiService: PiSpiClient = {
  createReceiveQr: (input) => client.createReceiveQr(input),
  parseQr: (raw) => client.parseQr(raw),
  initiatePayment: (request) => client.initiatePayment(request),
  confirmPayment: (request) => client.confirmPayment(request),
  initiatePaymentRequest: (request) => client.initiatePaymentRequest(request),
  confirmPaymentRequest: (request) => client.confirmPaymentRequest(request),
  getLastNotification: (txId) => client.getLastNotification(txId),
  listTransactions: () => client.listTransactions(),
};

export * from './pispiTypes';
