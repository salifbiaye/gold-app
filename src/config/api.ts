import { env } from './env';

export const apiConfig = {
  baseUrl: env.apiBaseUrl.replace(/\/$/, ''),
  timeoutMs: env.apiTimeoutMs,
};

export const endpoints = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
  },
  wallet: {
    balance: '/wallet/balance',
    transactions: '/wallet/transactions',
    transfer: '/wallet/transfer',
  },
  services: {
    all: '/services',
    transport: '/services/transport',
    realEstate: '/services/real-estate',
    health: '/services/health',
    payments: '/services/payments',
  },
  orders: {
    list: '/orders',
    detail: (id: string) => `/orders/${id}`,
  },
  ai: {
    chat: '/ai/chat',
  },
};
