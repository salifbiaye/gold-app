export const securityConfig = {
  biometric: {
    enabled: true,
    allowWhenUnavailable: true,
    protectedWalletActions: ['transfer', 'pay', 'withdraw', 'bills', 'credit', 'scan'],
    protectedPaymentActions: ['merchant', 'bill', 'airtime', 'transfer'],
  },
};
