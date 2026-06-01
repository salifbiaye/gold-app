import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { securityConfig } from '../../config/security';

export type BiometricType = 'faceid' | 'fingerprint';

export type BiometricCapability = {
  available: boolean;
  type: BiometricType | null;
};

/**
 * Détecte la capacité biométrique du device.
 *
 * Toutes les API natives sont wrappées dans try/catch : sur Expo Go sans dev client
 * ou en simulateur, certains appels peuvent hang ou throw — on retombe alors sur
 * "indisponible" plutôt que de bloquer l'app.
 */
export async function getBiometricCapability(): Promise<BiometricCapability> {
  if (Platform.OS === 'web' || !securityConfig.biometric.enabled) {
    return { available: false, type: null };
  }

  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return { available: false, type: null };

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) return { available: false, type: null };

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return { available: true, type: 'faceid' };
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return { available: true, type: 'fingerprint' };
    }
    return { available: false, type: null };
  } catch {
    // Module natif absent / hang / permission OS denied → on déclare indisponible
    return { available: false, type: null };
  }
}

export function biometricLabel(type: BiometricType | null) {
  return type === 'faceid' ? 'Face ID' : 'empreinte digitale';
}

/**
 * Demande une authentification biométrique. Garantit de **toujours résoudre**
 * (pas de hang) — si la pop-up ou la détection échoue silencieusement on retombe
 * sur la valeur configurée par {@code securityConfig.biometric.allowWhenUnavailable}.
 *
 * En mode dev (Expo Go ne supporte pas toujours la pop-up native selon les devices),
 * la biométrie est bypassée pour permettre de tester les flows. Build un dev client
 * ou un build prod pour avoir la vraie protection.
 */
export async function requestBiometricAuth(promptMessage = 'Confirmer avec la biometrie'): Promise<boolean> {
  if (!securityConfig.biometric.enabled) return true;

  // Dev mode bypass — Expo Go a un support partiel de authenticateAsync
  if (__DEV__) return true;

  const capability = await getBiometricCapability();
  if (!capability.available) {
    return securityConfig.biometric.allowWhenUnavailable;
  }

  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Annuler',
      disableDeviceFallback: true,
    });
    return result.success;
  } catch {
    // authenticateAsync n'est pas dispo (Expo Go sans dev client, etc.)
    return securityConfig.biometric.allowWhenUnavailable;
  }
}
