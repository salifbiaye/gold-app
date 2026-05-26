import * as LocalAuthentication from 'expo-local-authentication';
import { securityConfig } from '../../config/security';

export async function requestBiometricAuth(promptMessage = 'Confirmer avec Face ID') {
  if (!securityConfig.biometric.enabled) return true;

  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;

  if (!hasHardware || !isEnrolled) {
    return securityConfig.biometric.allowWhenUnavailable;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Annuler',
    disableDeviceFallback: true,
  });

  return result.success;
}
