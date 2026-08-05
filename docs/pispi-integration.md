# PI-SPI / TRESORMONEY integration

## Objectif

Cette premiere tranche met en place le parcours mobile PI-SPI sans exposer de secret dans l'application.

Flux disponible actuellement dans l'ecran `PI-SPI` :

```text
1. Recevoir via QR
   Generer QR -> autre SI scanne -> webhook mock PAIEMENT_RECU

2. Payer un QR
   Scanner/Parser QR -> init paiement mock -> confirmation paiement mock -> webhook mock

3. Demander un paiement
   init demande mock -> confirmation demande mock -> webhook mock
```

Le vrai debit PI-SPI/TRESORMONEY n'est pas appele depuis le mobile. C'est volontaire.

## Pourquoi le mobile ne parle pas directement a TRESORMONEY

La documentation TRESORMONEY impose deux protections pour les APIs :

- `Authorization: Bearer <access_token>` obtenu via Keycloak
- `x-api-key`

Le token Keycloak est obtenu avec `client_id` et `client_secret`. Ces informations ne doivent jamais etre embarquees dans un APK ou bundle web, car elles peuvent etre extraites.

Architecture actuelle :

```text
React Native app
  -> pispiService
  -> pispiMockClient
```

Architecture future correcte :

```text
React Native app
  -> pispiService
  -> pispiApiClient
  -> API securisee intermediaire
  -> TRESORMONEY / PI-SPI
```

## Fichiers ajoutes

```text
src/services/pispi/pispiTypes.ts
src/services/pispi/pispiQr.ts
src/services/pispi/pispiMockClient.ts
src/services/pispi/pispiApiClient.ts
src/services/pispi/pispiService.ts
src/screens/PiSpiScreen.tsx
docs/pispi-integration.md
```

## Types principaux

Les types sont dans `src/services/pispi/pispiTypes.ts`.

```ts
export type PiSpiQrKind = 'STATIC' | 'DYNAMIC' | 'TRANSFER';
export type PiSpiMerchantChannel = '000' | '400' | '731';
```

Statuts geres :

```ts
export type PiSpiTransactionStatus =
  | 'EN ATTENTE DE VERIFICATION'
  | 'ENVOYE A PI-SPI'
  | 'EN ATTENTE DE CONFIRMATION'
  | 'PAIEMENT_RECU'
  | 'PAIEMENT_ENVOYE'
  | 'PAIEMENT_REJETE'
  | 'RTP_RECU'
  | 'RTP_REJETE';
```

Payload metier QR :

```ts
export type PiSpiQrInput = {
  alias: string;
  amount?: number;
  beneficiaryName: string;
  city?: string;
  countryCode: string;
  merchantChannel: PiSpiMerchantChannel;
  qrKind: PiSpiQrKind;
  referenceLabel: string;
};
```

## Generation du QR

Le fichier `src/services/pispi/pispiQr.ts` genere une payload TLV de type EMV :

- `00` : payload format indicator
- `01` : point of initiation method
- `36` : merchant account information PI-SPI
- `52` : merchant category code
- `53` : devise XOF, code EMV `952`
- `54` : montant, optionnel
- `58` : pays, ex `SN`
- `59` : nom beneficiaire
- `60` : ville
- `62/05` : `Reference Label`
- `63` : CRC16-CCITT

Important : le MVP genere une payload EMV compatible avec notre flux mock. Avant production, le mapping exact des sous-tags PI-SPI doit etre valide avec le kit officiel BCEAO/participant.

## Cas TRESORMONEY

D'apres la documentation TRESORMONEY :

- un seul alias TRESORMONEY peut etre utilise ;
- le champ montant du QR peut rester vide ;
- `Reference Label` identifie le client ;
- en webhook, `txId` peut correspondre au `Reference Label` pour identifier le beneficiaire quand `refInterne` est null.

Dans l'app, l'ecran PI-SPI permet donc :

- d'editer l'alias beneficiaire ;
- de choisir un `Reference Label` ;
- de laisser le montant vide ;
- de generer le QR ;
- de tester le QR genere comme si on venait de le scanner.

## Scan et confirmation

`PiSpiScreen` expose trois parcours alignes sur la documentation TRESORMONEY :

### 1. Recevoir via QR

Ce parcours couvre le cas QR de la documentation :

```text
Generation QR avec Reference Label
-> le client externe scanne et paie
-> webhook status = PAIEMENT_RECU
```

Dans le mock, le bouton `Simuler webhook PAIEMENT_RECU` produit une notification locale.

### 2. Payer un QR

Ce parcours couvre le cash-out :

```text
POST /paiements
-> EN ATTENTE DE VERIFICATION
POST /paiements/confirmations
-> ENVOYE A PI-SPI
webhook
-> PAIEMENT_ENVOYE ou PAIEMENT_REJETE
```

### 3. Demander un paiement

Ce parcours couvre le cash-in / RTP :

```text
POST /demandes-paiements
-> EN ATTENTE DE VERIFICATION
POST /demandes-paiements/confirmations
-> EN ATTENTE DE CONFIRMATION
webhook
-> PAIEMENT_RECU ou RTP_REJETE
```

## Appels utilises par l'ecran

`PiSpiScreen` utilise :

```ts
pispiService.parseQr(rawPayload)
pispiService.initiatePayment(...)
pispiService.confirmPayment(...)
pispiService.initiatePaymentRequest(...)
pispiService.confirmPaymentRequest(...)
pispiService.getLastNotification(txId)
```

Le scanner camera existant est reutilise via `useScanner()`.

Si le QR ne contient pas de montant, l'ecran demande un montant avant confirmation.

## Mock actuel

`pispiMockClient.ts` simule :

### Paiement

```text
EN ATTENTE DE VERIFICATION
```

2. Confirmation :

```text
ENVOYE A PI-SPI
```

3. Notification mock :

```text
PAIEMENT_ENVOYE
```

### Demande de paiement

```text
EN ATTENTE DE VERIFICATION
EN ATTENTE DE CONFIRMATION
PAIEMENT_RECU
```

Ce mock ne touche aucun backend et ne fait aucun vrai debit.

## Comment retirer le mock plus tard

Les ecrans ne doivent pas changer.

Aujourd'hui :

```ts
const client = serviceConfig.useMock ? pispiMockClient : pispiApiClient;
```

Plus tard :

1. creer une API securisee intermediaire ;
2. implementer `pispiApiClient.ts` avec les endpoints de cette API ;
3. passer `EXPO_PUBLIC_USE_MOCK_API=false` ;
4. garder les memes types et les memes methodes de `pispiService`.

Endpoints intermediaires recommandes :

```text
POST /api/pispi/payments/init
POST /api/pispi/payments/confirm
POST /api/pispi/payment-requests/init
POST /api/pispi/payment-requests/confirm
GET  /api/pispi/transactions/:txId
POST /api/pispi/webhook/status
```

## A ne jamais mettre dans le mobile

- `client_secret` Keycloak
- `x-api-key`
- credentials serveur
- endpoint webhook
- logique de signature serveur

## Limites actuelles

- le paiement est mocke ;
- la notification est mockee ;
- la payload QR doit etre validee contre la specification finale BCEAO/participant avant production ;
- aucun webhook reel n'est traite dans l'app mobile.
