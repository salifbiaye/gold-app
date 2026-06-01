import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, ChevronDown, Eye, EyeOff, Search, X } from 'lucide-react-native';
import { OperatorLogo } from '../components/OperatorLogo';
import { DeviceContact, useDeviceContacts } from '../hooks/useDeviceContacts';
import QRCode from 'react-native-qrcode-svg';
import { HeaderBar } from '../components/HeaderBar';
import { PressScale } from '../components/PressScale';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { securityConfig } from '../config/security';
import { useScanner } from '../context/ScannerContext';
import { useAppTheme } from '../context/ThemeContext';
import { requestBiometricAuth } from '../services/security/biometricService';
import { getWalletActions, getWalletTransactions } from '../services/wallet/walletService';
import { useRepositoryQuery } from '../hooks/useRepositoryQuery';

type ActionId = 'transfer' | 'pay' | 'withdraw' | 'topup' | 'details' | 'bills' | 'credit' | null;

const ACTION_CONFIG: Record<
  Exclude<ActionId, null>,
  { title: string; fields?: string[]; submitLabel?: string }
> = {
  transfer: {
    title: 'Transférer',
    fields: ['Bénéficiaire', 'Montant (FCFA)', 'Note (optionnel)'],
    submitLabel: 'Envoyer',
  },
  pay: {
    title: 'Paiement marchand',
    fields: ['Code marchand', 'Montant (FCFA)'],
    submitLabel: 'Payer',
  },
  withdraw: {
    title: 'Retrait cash',
    fields: ['Agent ou point retrait', 'Montant (FCFA)'],
    submitLabel: 'Retirer',
  },
  topup: {
    title: 'Recharger',
    fields: ['Opérateur (Orange, Wave…)', 'Montant (FCFA)'],
    submitLabel: 'Recharger',
  },
  bills: {
    title: 'Paiement de factures',
    fields: ['Fournisseur (SENELEC, SDE…)', 'Référence contrat', 'Montant (FCFA)'],
    submitLabel: 'Payer la facture',
  },
  credit: {
    title: 'Crédit téléphonique',
    fields: ['Opérateur (Orange, Free…)', 'Numéro de téléphone', 'Montant (FCFA)'],
    submitLabel: 'Envoyer le crédit',
  },
  details: {
    title: 'Détails Wallet',
  },
};

export function WalletScreen() {
  const { colors, resolvedMode } = useAppTheme();
  const { contacts } = useDeviceContacts();
  const { openScanner } = useScanner();
  const [selectedAction, setSelectedAction] = useState<ActionId>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const transactions = useRepositoryQuery(getWalletTransactions).data ?? [];
  const walletActions = useRepositoryQuery(getWalletActions).data ?? [];

  const visibleTransactions = showAllHistory ? transactions : transactions.slice(0, 4);
  const cardTone = resolvedMode === 'dark'
    ? {
      gradient: ['#2E8C66', '#08744C'] as const,
      border: 'rgba(218,255,235,0.46)',
      stage: '#10202B',
      shadowOpacity: 0.24,
    }
    : {
      gradient: ['#77C996', colors.primaryDark] as const,
      border: 'rgba(255,255,255,0.72)',
      stage: '#d7ede9',
      shadowOpacity: 0.16,
    };

  const handleOpenScanner = useCallback(async () => {
    const allowed = await requestBiometricAuth('Autoriser le scan QR');
    if (!allowed) return;

    openScanner({
      onScanned: (data) => setScanResult(data),
      onClose: () => {},
    });
  }, [openScanner]);

  const openAction = async (id: string) => {
    if (id === 'scan') { await handleOpenScanner(); return; }
    if (id === 'more') return;

    if (securityConfig.biometric.protectedWalletActions.includes(id)) {
      const allowed = await requestBiometricAuth('Confirmer cette action Wallet');
      if (!allowed) return;
    }

    setSubmitted(false);
    setSelectedAction(id as ActionId);
  };

  const closeSheet = () => setSelectedAction(null);

  return (
    <Screen>
      <HeaderBar title="Wallet" />

      <View style={[styles.cardStage, { backgroundColor: cardTone.stage }]}>
        <LinearGradient
          colors={cardTone.gradient}
          style={[
            styles.balanceCard,
            { borderColor: cardTone.border, shadowOpacity: cardTone.shadowOpacity },
          ]}
        >
          <View style={styles.cardTopRow}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <PressScale onPress={() => setBalanceHidden((v) => !v)} haptic="selection" scaleTo={0.82}>
              <View style={styles.eyeButton}>
                {balanceHidden
                  ? <EyeOff color="#FFFFFF" size={16} />
                  : <Eye color="#FFFFFF" size={16} />}
              </View>
            </PressScale>
          </View>

          <Text style={styles.balance}>
            {balanceHidden ? '......' : '125 600 FCFA'}
          </Text>

          <View style={styles.cardBottomRow}>
            <PressScale onPress={() => openAction('details')} haptic="light" scaleTo={0.94}>
              <Text style={styles.details}>Voir details</Text>
            </PressScale>

            <PressScale onPress={handleOpenScanner} haptic="medium" scaleTo={0.93}>
              <View style={styles.qrBox}>
                <QRCode value="GOLDAPP-WALLET-1607" size={58} backgroundColor="#FFFFFF" color="#111827" />
              </View>
            </PressScale>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.actionsHeader}>
        <Text style={[styles.actionsTitle, { color: colors.text }]}>Actions rapides</Text>
      </View>
      <View style={styles.actionsGrid}>
        {walletActions.map((action) => {
          const Icon = action.icon;
          const iconColor = '#00a86b';
          return (
            <TouchableOpacity
              key={action.id}
              style={styles.actionWrap}
              activeOpacity={0.82}
              onPress={() => openAction(action.id)}
            >
              <View style={[styles.actionTile, { backgroundColor: '#d7ede9' }]}>
                <Icon
                  color={iconColor}
                  fill={action.id === 'transfer' ? iconColor : 'none'}
                  size={24}
                  strokeWidth={2.1}
                />
              </View>
              <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.actionText, { color: colors.text }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {scanResult ? (
        <View style={[styles.scanResult, { backgroundColor: colors.surface }]}>
          <Text style={[styles.panelTitle, { color: colors.text }]}>QR détecté</Text>
          <Text style={[styles.panelText, { color: colors.muted }]} numberOfLines={2}>
            {scanResult}
          </Text>
        </View>
      ) : null}

      <SectionHeader
        title="Historique"
        action={showAllHistory ? 'Réduire' : 'Voir tout'}
        onAction={() => setShowAllHistory((v) => !v)}
      />
      <View style={styles.list}>
        {visibleTransactions.map((item) => {
          const Icon = item.icon;
          return (
            <View key={item.id} style={[styles.transaction, { backgroundColor: colors.surface }]}>
              <View style={[styles.transactionIcon, { backgroundColor: `${item.color}22` }]}>
                <Icon color={item.color} size={18} />
              </View>
              <View style={styles.transactionText}>
                <Text style={[styles.transactionTitle, { color: colors.text }]}>{item.label}</Text>
                <Text style={[styles.transactionMeta, { color: colors.muted }]}>{item.meta}</Text>
              </View>
              <Text style={[styles.amount, { color: colors.text }]}>{item.amount}</Text>
            </View>
          );
        })}
      </View>

      <WalletSheet
        visible={selectedAction !== null}
        actionId={selectedAction}
        submitted={submitted}
        onSubmit={() => setSubmitted(true)}
        onClose={closeSheet}
        colors={colors}
        contacts={contacts}
      />

    </Screen>
  );
}

// ─── Bottom Sheet ────────────────────────────────────────────────────────────

type WalletSheetProps = {
  visible: boolean;
  actionId: ActionId;
  submitted: boolean;
  onSubmit: () => void;
  onClose: () => void;
  colors: any;
  contacts: DeviceContact[];
};

function WalletSheet({ visible, actionId, submitted, onSubmit, onClose, colors, contacts }: WalletSheetProps) {
  const slideY = useRef(new Animated.Value(500)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 4 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideY, { toValue: 500, useNativeDriver: true, speed: 22, bounciness: 0 }),
        Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!actionId) return null;

  const config = ACTION_CONFIG[actionId];

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.backdrop, { opacity }]}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, transform: [{ translateY: slideY }] },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{config.title}</Text>
            <TouchableOpacity
              style={[styles.sheetClose, { backgroundColor: colors.background }]}
              onPress={onClose}
            >
              <X color={colors.muted} size={18} />
            </TouchableOpacity>
          </View>

          {submitted ? (
            <View style={styles.successWrap}>
              <Text style={styles.successEmoji}>✅</Text>
              <Text style={[styles.successTitle, { color: colors.text }]}>Demande enregistrée</Text>
              <Text style={[styles.successSub, { color: colors.muted }]}>
                La validation backend sera branchée via src/services.
              </Text>
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary, marginTop: 12 }]}
                onPress={onClose}
              >
                <Text style={styles.submitText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          ) : actionId === 'details' ? (
            <DetailsContent colors={colors} />
          ) : config.fields ? (
            <WalletForm
              fields={config.fields}
              submitLabel={config.submitLabel ?? 'Continuer'}
              onSubmit={onSubmit}
              colors={colors}
              actionId={actionId}
              contacts={contacts}
            />
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function DetailsContent({ colors }: { colors: any }) {
  const rows = [
    { label: 'Solde disponible', value: '125 600 FCFA', accent: true },
    { label: 'Solde bloqué', value: '0 FCFA', accent: false },
    { label: 'N° Wallet', value: '\u2022\u2022 1607', accent: false },
    { label: 'Statut', value: 'Actif · Vérifié ✓', accent: false },
    { label: 'Dernière opération', value: "Aujourd'hui 12:45", accent: false },
  ];

  return (
    <View style={styles.detailsGrid}>
      {rows.map((row) => (
        <View key={row.label} style={[styles.detailsRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.detailLabel, { color: colors.muted }]}>{row.label}</Text>
          <Text style={[styles.detailValue, { color: row.accent ? colors.primary : colors.text }]}>
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const INITIALS_COLORS = ['#FF6848', '#12C47F', '#6366F1', '#F59E0B', '#EC4899', '#14B8A6', '#8B5CF6', '#F97316'];

const OPERATORS = [
  { id: 'orange', label: 'Orange Money', color: '#FF6600' },
  { id: 'wave', label: 'Wave', color: '#1DC3E2' },
  { id: 'free', label: 'Free Money', color: '#FF0000' },
  { id: 'expresso', label: 'E-Money', color: '#009639' },
];

function isOperatorField(field: string) {
  return field.toLowerCase().includes('opérateur');
}

function isContactField(field: string, actionId: string) {
  if (actionId === 'transfer') return field.toLowerCase().includes('bénéficiaire');
  if (actionId === 'credit') return field.toLowerCase().includes('numéro');
  return false;
}

function WalletForm({
  fields,
  submitLabel,
  onSubmit,
  colors,
  actionId,
  contacts,
}: {
  fields: string[];
  submitLabel: string;
  onSubmit: () => void;
  colors: any;
  actionId: string;
  contacts: DeviceContact[];
}) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [selectedContact, setSelectedContact] = useState<DeviceContact | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [operatorOpen, setOperatorOpen] = useState(false);

  const contactFieldName = fields.find((f) => isContactField(f, actionId)) ?? null;
  const query = contactFieldName ? (fieldValues[contactFieldName] ?? '') : '';

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query),
  );

  const showSuggestions = contactFieldName && !selectedContact && query.length === 0 && contacts.length > 0;
  const showFiltered = contactFieldName && !selectedContact && query.length > 0 && filtered.length > 0;

  const pickContact = (contact: DeviceContact) => {
    setSelectedContact(contact);
    if (contactFieldName) setFieldValues((v) => ({ ...v, [contactFieldName]: contact.name }));
  };

  const clearContact = () => {
    setSelectedContact(null);
    if (contactFieldName) setFieldValues((v) => ({ ...v, [contactFieldName]: '' }));
  };

  return (
    <View style={styles.form}>
      {fields.map((field) => {
        if (isOperatorField(field)) {
          const op = OPERATORS.find((o) => o.id === selectedOperator);
          return (
            <View key={field}>
              <TouchableOpacity
                style={[styles.selectBtn, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}
                onPress={() => setOperatorOpen((v) => !v)}
                activeOpacity={0.7}
              >
                {op ? (
                  <View style={styles.selectRow}>
                    <OperatorLogo operator={op.id} size={28} />
                    <Text style={[styles.selectText, { color: colors.text }]}>{op.label}</Text>
                  </View>
                ) : (
                  <Text style={[styles.selectText, { color: colors.muted }]}>{field}</Text>
                )}
                <ChevronDown color={colors.muted} size={18} />
              </TouchableOpacity>
              {operatorOpen && (
                <View style={[styles.contactList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {OPERATORS.map((o) => (
                    <TouchableOpacity
                      key={o.id}
                      style={styles.contactRow}
                      onPress={() => { setSelectedOperator(o.id); setOperatorOpen(false); }}
                      activeOpacity={0.7}
                    >
                      <OperatorLogo operator={o.id} size={28} />
                      <Text style={[styles.contactName, { color: colors.text, flex: 1 }]}>{o.label}</Text>
                      {selectedOperator === o.id && <Check color={colors.primary} size={16} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        }

        if (isContactField(field, actionId) && selectedContact) {
          return (
            <TouchableOpacity
              key={field}
              style={[styles.selectedContact, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}
              onPress={clearContact}
              activeOpacity={0.7}
            >
              <View style={[styles.contactAvatar, { backgroundColor: INITIALS_COLORS[0] }]}>
                <Text style={styles.contactInitials}>{selectedContact.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactName, { color: colors.text }]}>{selectedContact.name}</Text>
                <Text style={[styles.contactPhone, { color: colors.muted }]}>{selectedContact.phone}</Text>
              </View>
              <Check color={colors.primary} size={18} />
            </TouchableOpacity>
          );
        }

        const isContact = isContactField(field, actionId);

        return (
          <View key={field}>
            <View style={[styles.inputWrap, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
              {isContact && <Search color={colors.muted} size={16} style={{ marginLeft: 12 }} />}
              <TextInput
                placeholder={field}
                placeholderTextColor={colors.muted}
                value={fieldValues[field] ?? ''}
                onChangeText={(t) => setFieldValues((v) => ({ ...v, [field]: t }))}
                style={[styles.inputInner, { color: colors.text }, isContact && { paddingLeft: 8 }]}
              />
            </View>

            {isContact && (showSuggestions || showFiltered) && (
              <View style={[styles.contactList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {showSuggestions && (
                  <Text style={[styles.contactsHeader, { color: colors.muted }]}>Contacts récents</Text>
                )}
                {(showSuggestions ? contacts.slice(0, 5) : filtered.slice(0, 5)).map((contact, i) => (
                  <TouchableOpacity
                    key={contact.id}
                    style={styles.contactRow}
                    onPress={() => pickContact(contact)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.contactAvatar, { backgroundColor: INITIALS_COLORS[i % INITIALS_COLORS.length] }]}>
                      <Text style={styles.contactInitials}>{contact.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
                      <Text style={[styles.contactPhone, { color: colors.muted }]}>{contact.phone}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: colors.primary }]}
        activeOpacity={0.86}
        onPress={onSubmit}
      >
        <Text style={styles.submitText}>{submitLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  cardStage: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginHorizontal: -18,
    marginTop: 10,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  balanceCard: {
    borderRadius: 10,
    borderWidth: 0,
    justifyContent: 'space-between',
    minHeight: 185,
    overflow: 'hidden',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 8,
  },
  cardTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  eyeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    fontWeight: '500',
  },
  balance: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 16,
    zIndex: 1,
  },
  cardBottomRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 34,
    zIndex: 1,
  },
  details: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    fontWeight: '500',
  },
  qrBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(17,24,39,0.08)',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    padding: 6,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
  },
  actionsHeader: {
    marginBottom: 10,
    marginTop: 14,
  },
  actionsTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  actionWrap: {
    alignItems: 'center',
    gap: 8,
    width: '23%',
  },
  actionTile: {
    alignItems: 'center',
    borderRadius: 20,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    maxWidth: '95%',
    textAlign: 'center',
  },
  list: {
    gap: 10,
  },
  scanResult: {
    borderRadius: 12,
    marginTop: 12,
    padding: 14,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  panelText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    marginTop: 10,
  },
  transaction: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    padding: 12,
  },
  transactionIcon: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  transactionText: {
    flex: 1,
    marginLeft: 10,
  },
  transactionTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  transactionMeta: {
    fontSize: 11,
    marginTop: 3,
  },
  amount: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal & sheet
  modalWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sheetHandle: {
    alignSelf: 'center',
    borderRadius: 3,
    height: 4,
    marginBottom: 18,
    width: 40,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sheetClose: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  form: {
    gap: 12,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 13,
    fontWeight: '400',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  submitBtn: {
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 4,
    paddingVertical: 14,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  successWrap: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  successEmoji: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  successSub: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
  inputWrap: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
  },
  inputInner: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  contactList: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
    overflow: 'hidden',
  },
  contactsHeader: {
    fontSize: 11,
    fontWeight: '500',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  contactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  contactAvatar: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  contactInitials: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  contactName: {
    fontSize: 13,
    fontWeight: '500',
  },
  contactPhone: {
    fontSize: 11,
    fontWeight: '400',
    marginTop: 1,
  },
  selectedContact: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selectBtn: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  selectRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  selectText: {
    fontSize: 13,
    fontWeight: '600',
  },
  operatorDot: {
    borderRadius: 8,
    height: 16,
    width: 16,
  },
  detailsGrid: {
    gap: 2,
  },
  detailsRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
  },
});
