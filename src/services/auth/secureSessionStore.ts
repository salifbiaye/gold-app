import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { securityConfig } from '../../config/security';
import type { AuthResult } from '../../types/auth';

const BIOMETRIC_SESSION_KEY = 'goldapp.biometric.session';

function canPersistBiometricSession() {
  return Platform.OS !== 'web' && securityConfig.biometric.enabled;
}

function secureOptions(promptMessage: string): SecureStore.SecureStoreOptions {
  return {
    authenticationPrompt: promptMessage,
    keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    requireAuthentication: true,
  };
}

export async function saveBiometricSession(auth: AuthResult) {
  if (!canPersistBiometricSession() || !(await SecureStore.isAvailableAsync())) {
    return;
  }

  await SecureStore.setItemAsync(
    BIOMETRIC_SESSION_KEY,
    JSON.stringify(auth),
    secureOptions('Activer la connexion biometrique'),
  );
}

export async function restoreBiometricSession(promptMessage: string): Promise<AuthResult | null> {
  if (!canPersistBiometricSession() || !(await SecureStore.isAvailableAsync())) {
    return null;
  }

  const serialized = await SecureStore.getItemAsync(
    BIOMETRIC_SESSION_KEY,
    secureOptions(promptMessage),
  );

  if (!serialized) {
    return null;
  }

  try {
    return JSON.parse(serialized) as AuthResult;
  } catch {
    await clearBiometricSession();
    return null;
  }
}

export async function clearBiometricSession() {
  if (Platform.OS === 'web' || !(await SecureStore.isAvailableAsync())) {
    return;
  }

  await SecureStore.deleteItemAsync(BIOMETRIC_SESSION_KEY);
}
