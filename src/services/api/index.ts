import { endpoints } from '../../config/api';
import { apiRequest } from './client';

export const api = {
  login: <T>(identifier: string, password: string) =>
    apiRequest<T>(endpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),
  getCurrentUser: <T>() => apiRequest<T>(endpoints.auth.me),
  getWalletBalance: <T>() => apiRequest<T>(endpoints.wallet.balance),
  getWalletTransactions: <T>() => apiRequest<T>(endpoints.wallet.transactions),
  getOrders: <T>() => apiRequest<T>(endpoints.orders.list),
  sendAiMessage: <T>(message: string) =>
    apiRequest<T>(endpoints.ai.chat, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};
