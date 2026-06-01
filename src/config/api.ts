import { env } from './env';

export const apiConfig = {
  baseUrl: env.apiBaseUrl.replace(/\/$/, ''),
  timeoutMs: env.apiTimeoutMs,
};

/**
 * Mappage des endpoints exposés par le backend GoldApp (Spring Boot).
 *
 * Préfixe /api géré par server.servlet.context-path côté back —
 * env.apiBaseUrl doit donc se terminer par /api (ex: http://localhost:8080/api).
 */
export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    // Passkeys (WebAuthn) — non implémenté côté backend, stubs front uniquement
    passkeys: {
      authenticationOptions: '/auth/passkeys/authentication/options',
      authenticationVerify: '/auth/passkeys/authentication/verify',
      registrationOptions: '/auth/passkeys/registration/options',
      registrationVerify: '/auth/passkeys/registration/verify',
    },
  },

  // Module payments (PI-SPI + wallet)
  payments: {
    walletBalance: '/payments/wallet/balance',
    walletTransactions: '/payments/wallet/transactions',
    qr: '/payments/qr',
    transfer: '/payments/transfer',
    merchant: '/payments/merchant',
    bills: '/payments/bills',
    airtime: '/payments/airtime',
    cashout: '/payments/cashout',
    paymentRequest: '/payments/payment-requests',
  },

  orders: {
    list: '/orders',
    detail: (id: string) => `/orders/${id}`,
  },

  // Modules métier
  transport: {
    offers: '/transport/offers',
    bookings: '/transport/bookings',
  },
  realEstate: {
    properties: '/realestate/properties',
    detail: (id: string) => `/realestate/properties/${id}`,
  },
  health: {
    offers: '/health/offers',
    bookings: '/health/bookings',
  },
  food: {
    items: '/food/items',
  },
  tourism: {
    offers: '/tourism/offers',
  },
  education: {
    courses: '/education/courses',
  },
  marketplace: {
    products: '/marketplace/products',
    detail: (id: string) => `/marketplace/products/${id}`,
  },
  vendors: {
    apply: '/vendors/apply',
    me: '/vendors/me',
  },
  profile: {
    avatar: '/profile/avatar',
  },
  notifications: {
    list: '/notifications',
    unreadCount: '/notifications/unread-count',
    read: (id: string) => `/notifications/${id}/read`,
    readAll: '/notifications/read-all',
    deviceToken: '/notifications/device-token',
    stream: '/notifications/stream',
    test: '/notifications/test',
  },
  maps: {
    route: '/maps/route',
    places: '/maps/places',
    agencies: '/maps/agencies',
  },
  home: {
    dashboard: '/home/dashboard',
  },
  ai: {
    chercher: '/ai/chercher',
    chat: '/ai/chat',
  },
};
