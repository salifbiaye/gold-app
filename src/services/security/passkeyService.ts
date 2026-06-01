import { env } from '../../config/env';

function hasWebAuthn() {
  return typeof window !== 'undefined' && typeof window.PublicKeyCredential !== 'undefined';
}

export function supportsPasskeys() {
  return env.enableWebPasskeys && hasWebAuthn();
}

function disabledMessage() {
  return 'Les Passkeys seront disponibles lorsque les endpoints backend WebAuthn seront actives.';
}

export async function authenticateWithPasskey(): Promise<never> {
  throw new Error(disabledMessage());
}

export async function registerPasskey(): Promise<never> {
  throw new Error(disabledMessage());
}
