export type PiSpiQrKind = 'STATIC' | 'DYNAMIC' | 'TRANSFER';

export type PiSpiMerchantChannel = '000' | '400' | '731';

export type PiSpiApiStatus =
  | 'EN ATTENTE DE VERIFICATION'
  | 'ENVOYE A PI-SPI'
  | 'EN ATTENTE DE CONFIRMATION';

export type PiSpiNotificationStatus =
  | 'PAIEMENT_RECU'
  | 'PAIEMENT_ENVOYE'
  | 'PAIEMENT_REJETE'
  | 'RTP_RECU'
  | 'RTP_REJETE'
  | 'RTP_REPONSE_REJETE'
  | 'ANNULATION_DEMANDE'
  | 'ANNULATION_REPONSE_REJETE'
  | 'RETOUR_REJETE'
  | 'RETOUR_RECU'
  | 'ANNULATION_REJETE';

export type PiSpiTransactionStatus = PiSpiApiStatus | PiSpiNotificationStatus;

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

export type PiSpiQrPayload = PiSpiQrInput & {
  crc: string;
  currencyCode: '952';
  pointOfInitiationMethod: '11' | '12';
  raw: string;
  validCrc: boolean;
};

export type PiSpiPaymentInitRequest = {
  montant: number;
  motif?: string;
  payeAlias: string;
  payeurAlias: string;
  refInterne?: string;
  source: 'TRESORMONEY' | 'GOLDAPP';
};

export type PiSpiPaymentInitResult = {
  error: number;
  montant: number;
  message: string;
  payeurNom: string;
  statut: PiSpiApiStatus;
  txId: string;
};

export type PiSpiPaymentConfirmationRequest = {
  confirmation: boolean;
  txId: string;
};

export type PiSpiPaymentConfirmationResult = {
  error: number;
  montant: number;
  message: string;
  statut: PiSpiApiStatus | 'PAIEMENT_REJETE';
  txId: string;
};

export type PiSpiPaymentRequestInitRequest = {
  montant: number;
  categorie: 'FACTURE' | 'SERVICE' | 'AUTRE';
  dateLimitePaiement: string;
  motif?: string;
  payeAlias: string;
  payeurAlias: string;
  refDocNumero?: string;
  refDocType?: string;
  refInterne?: string;
  source: 'TRESORMONEY' | 'GOLDAPP';
};

export type PiSpiPaymentRequestInitResult = {
  error: number;
  montant: number;
  message: string;
  numero?: string | null;
  payeurNom: string;
  statut: PiSpiApiStatus;
  txId: string;
};

export type PiSpiPaymentRequestConfirmationRequest = {
  confirmation: boolean;
  txId: string;
};

export type PiSpiPaymentRequestConfirmationResult = {
  error: number;
  montant: number;
  message: string;
  statut: PiSpiApiStatus | 'RTP_REJETE';
  txId: string;
};

export type PiSpiStatusNotification = {
  aliasTresor?: string;
  dateIrrevocabilite?: string;
  montant: number;
  client?: string;
  createdAt: string;
  end2endId?: string;
  flow?: 'PAYMENT' | 'PAYMENT_REQUEST' | 'QR_INCOMING';
  motif?: string;
  payeAlias?: string;
  payeurAlias?: string;
  refInterne?: number | string | null;
  status: PiSpiTransactionStatus;
  txId: string;
};

export type PiSpiClient = {
  confirmPayment: (request: PiSpiPaymentConfirmationRequest) => Promise<PiSpiPaymentConfirmationResult>;
  confirmPaymentRequest: (request: PiSpiPaymentRequestConfirmationRequest) => Promise<PiSpiPaymentRequestConfirmationResult>;
  createReceiveQr: (input: PiSpiQrInput) => PiSpiQrPayload;
  getLastNotification: (txId: string) => Promise<PiSpiStatusNotification | null>;
  listTransactions: () => Promise<PiSpiStatusNotification[]>;
  initiatePayment: (request: PiSpiPaymentInitRequest) => Promise<PiSpiPaymentInitResult>;
  initiatePaymentRequest: (request: PiSpiPaymentRequestInitRequest) => Promise<PiSpiPaymentRequestInitResult>;
  parseQr: (raw: string) => PiSpiQrPayload;
};
