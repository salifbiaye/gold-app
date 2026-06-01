import { endpoints } from '../../config/api';
import { apiRequest } from './client';

/**
 * Helpers de haut niveau pour les endpoints les plus fréquents.
 * Les services métier (walletService, ordersService…) sont préférables car ils
 * gèrent aussi le mode mock.
 */
export const api = {
  login: <T>(email: string, password: string) =>
    apiRequest<T>(endpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    }),
  getCurrentUser: <T>() => apiRequest<T>(endpoints.auth.me),
  getWalletBalance: <T>() => apiRequest<T>(endpoints.payments.walletBalance),
  getWalletTransactions: <T>() => apiRequest<T>(endpoints.payments.walletTransactions),
  getOrders: <T>() => apiRequest<T>(endpoints.orders.list),
  sendAiMessage: <T>(message: string) =>
    apiRequest<T>(endpoints.ai.chat, {
      method: 'POST',
      body: JSON.stringify({ query: message }),
    }),
};
