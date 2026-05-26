export const authConfig = {
  splashDurationMs: 1600,
  useMockAuth: true,
  defaultCredentials: {
    identifier: process.env.EXPO_PUBLIC_AUTH_IDENTIFIER ?? '+221771234567',
    password: process.env.EXPO_PUBLIC_AUTH_PASSWORD ?? '123456',
  },
  demoUser: {
    id: 'user-salif',
    fullName: 'Salif Biaye',
    phone: '+221 77 123 45 67',
    email: 'salif@goldapp.sn',
    token: 'mock-gold-app-token',
  },
};
