/**
 * Types et helpers partagés autour des transactions PI-SPI.
 *
 * Utilisés à la fois par `walletService` (page Wallet) et `homeService`
 * (dashboard agrégé) pour éviter la duplication du mapping XOF → FCFA et du
 * formatage des montants.
 */

/** DTO renvoyé par le backend (cf. modules/payments/domain/model/Transaction). */
export type BackendTransaction = {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  currency: string;
  counterparty: string | null;
  label: string | null;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
};

/** Convertit le code ISO interne (`XOF`) en libellé d'affichage (`FCFA`). */
export function displayCurrency(iso: string): string {
  return iso === 'XOF' ? 'FCFA' : iso;
}

/** Formate un montant signé : `+ 5 000 FCFA` / `- 8 500 FCFA`. */
export function formatTransactionAmount(t: BackendTransaction): string {
  const sign = t.type === 'CREDIT' ? '+' : '-';
  return `${sign} ${t.amount.toLocaleString('fr-FR')} ${displayCurrency(t.currency)}`;
}

/** Formate `createdAt` en date/heure courte localisée (ex: "27/05/2026 12:45"). */
export function formatTransactionTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

/** Libellé lisible (label métier > contrepartie > fallback). */
export function transactionLabel(t: BackendTransaction): string {
  return t.label ?? t.counterparty ?? 'Opération';
}
