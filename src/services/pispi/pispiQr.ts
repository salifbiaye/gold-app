import type { PiSpiMerchantChannel, PiSpiQrInput, PiSpiQrKind, PiSpiQrPayload } from './pispiTypes';

type TlvMap = Record<string, string>;

const GUI = 'PI-SPI';
const CURRENCY_XOF = '952' as const;

function sanitize(value: string, max = 99) {
  return value.trim().replace(/\s+/g, ' ').slice(0, max);
}

function tlv(tag: string, value: string) {
  const clean = value ?? '';
  const length = clean.length.toString().padStart(2, '0');
  if (clean.length > 99) {
    throw new Error(`PI-SPI TLV value too long for tag ${tag}`);
  }
  return `${tag}${length}${clean}`;
}

function parseTlv(value: string): TlvMap {
  const result: TlvMap = {};
  let index = 0;

  while (index + 4 <= value.length) {
    const tag = value.slice(index, index + 2);
    const length = Number(value.slice(index + 2, index + 4));
    if (!Number.isFinite(length) || length < 0) break;
    const start = index + 4;
    const end = start + length;
    if (end > value.length) break;
    result[tag] = value.slice(start, end);
    index = end;
  }

  return result;
}

function pointOfInitiation(qrKind: PiSpiQrKind): '11' | '12' {
  return qrKind === 'STATIC' ? '11' : '12';
}

function kindFromPointOfInitiation(value: string | undefined, amount?: number): PiSpiQrKind {
  if (value === '11') return 'STATIC';
  if (amount != null) return 'DYNAMIC';
  return 'TRANSFER';
}

function merchantChannelForKind(qrKind: PiSpiQrKind): PiSpiMerchantChannel {
  if (qrKind === 'DYNAMIC') return '400';
  if (qrKind === 'TRANSFER') return '731';
  return '000';
}

function formatAmount(amount: number) {
  return amount.toFixed(0);
}

export function crc16Ccitt(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function buildPiSpiQrPayload(input: PiSpiQrInput): PiSpiQrPayload {
  const alias = sanitize(input.alias);
  const beneficiaryName = sanitize(input.beneficiaryName, 25);
  const city = sanitize(input.city ?? 'Dakar', 15);
  const countryCode = sanitize(input.countryCode.toUpperCase(), 2);
  const referenceLabel = sanitize(input.referenceLabel, 99);
  const merchantChannel = input.merchantChannel ?? merchantChannelForKind(input.qrKind);

  if (!alias) throw new Error('PI-SPI alias is required');
  if (!referenceLabel) throw new Error('PI-SPI referenceLabel is required');
  if (!countryCode) throw new Error('PI-SPI countryCode is required');

  const merchantAccountInfo = [
    tlv('00', GUI),
    tlv('01', alias),
    tlv('02', merchantChannel),
    tlv('03', countryCode),
  ].join('');

  const additionalData = tlv('05', referenceLabel);

  const parts = [
    tlv('00', '01'),
    tlv('01', pointOfInitiation(input.qrKind)),
    tlv('36', merchantAccountInfo),
    tlv('52', '0000'),
    tlv('53', CURRENCY_XOF),
    input.amount != null ? tlv('54', formatAmount(input.amount)) : '',
    tlv('58', countryCode),
    tlv('59', beneficiaryName),
    tlv('60', city),
    tlv('62', additionalData),
  ].join('');

  const crcInput = `${parts}6304`;
  const crc = crc16Ccitt(crcInput);
  const raw = `${crcInput}${crc}`;

  return {
    ...input,
    alias,
    beneficiaryName,
    city,
    countryCode,
    crc,
    currencyCode: CURRENCY_XOF,
    merchantChannel,
    pointOfInitiationMethod: pointOfInitiation(input.qrKind),
    raw,
    referenceLabel,
    validCrc: true,
  };
}

export function parsePiSpiQrPayload(raw: string): PiSpiQrPayload {
  const payload = raw.trim();
  if (!payload) throw new Error('QR vide');

  const top = parseTlv(payload);
  const merchantAccountInfo = top['36'] ? parseTlv(top['36']) : {};
  const additionalData = top['62'] ? parseTlv(top['62']) : {};
  const gui = merchantAccountInfo['00'];

  if (gui !== GUI) {
    throw new Error('QR non reconnu comme PI-SPI');
  }

  const crc = top['63'] ?? '';
  const crcIndex = payload.lastIndexOf('6304');
  const validCrc = crcIndex >= 0 && crc16Ccitt(payload.slice(0, crcIndex + 4)) === crc.toUpperCase();
  const amount = top['54'] ? Number(top['54']) : undefined;
  const qrKind = kindFromPointOfInitiation(top['01'], amount);

  return {
    alias: merchantAccountInfo['01'] ?? '',
    amount: Number.isFinite(amount) ? amount : undefined,
    beneficiaryName: top['59'] ?? '',
    city: top['60'] ?? '',
    countryCode: top['58'] ?? merchantAccountInfo['03'] ?? '',
    crc,
    currencyCode: CURRENCY_XOF,
    merchantChannel: (merchantAccountInfo['02'] as PiSpiMerchantChannel | undefined) ?? merchantChannelForKind(qrKind),
    pointOfInitiationMethod: top['01'] === '11' ? '11' : '12',
    qrKind,
    raw: payload,
    referenceLabel: additionalData['05'] ?? '',
    validCrc,
  };
}
