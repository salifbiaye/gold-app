import { useEffect, useRef, useState } from 'react';
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
import { Check, ChevronDown, Eye, EyeOff, Search, X } from 'lucide-react-native';
import { OperatorLogo } from './OperatorLogo';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useScanner } from '../context/ScannerContext';
import { useAppTheme } from '../context/ThemeContext';
import { PressScale } from './PressScale';
import { DeviceContact, useDeviceContacts } from '../hooks/useDeviceContacts';
import { requestBiometricAuth } from '../services/security/biometricService';
import { IconComponent } from '../types/icon';
import { materialCommunityIcon } from './AppIconSet';

type SheetType = 'topup' | 'transfer' | null;

const cardActionIcons = {
  more: materialCommunityIcon('dots-horizontal'),
  qrcode: materialCommunityIcon('qrcode-scan'),
  topup: materialCommunityIcon('plus'),
  transfer: materialCommunityIcon('send'),
};

const SHEET_CONFIG: Record<
  Exclude<SheetType, null>,
  { title: string; fields: string[]; submitLabel: string }
> = {
  topup: {
    title: 'Recharger le wallet',
    fields: ['Opérateur (Orange, Wave…)', 'Numéro de compte', 'Montant (FCFA)'],
    submitLabel: 'Recharger',
  },
  transfer: {
    title: 'Transférer',
    fields: ['Bénéficiaire (nom ou N° wallet)', 'Montant (FCFA)', 'Note (optionnel)'],
    submitLabel: 'Envoyer',
  },
};

export function WalletBalanceCard() {
  const { colors } = useAppTheme();
  const { contacts } = useDeviceContacts();
  const { openScanner } = useScanner();
  const navigation = useNavigation<any>();
  const [hidden, setHidden] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [submitted, setSubmitted] = useState(false);

  const openSheet = async (type: SheetType) => {
    if (type === 'transfer') {
      const allowed = await requestBiometricAuth('Confirmer le transfert Wallet');
      if (!allowed) return;
    }

    setSubmitted(false);
    setActiveSheet(type);
  };

  const closeSheet = () => setActiveSheet(null);

  const handleScan = async () => {
    const allowed = await requestBiometricAuth('Autoriser le scan QR');
    if (!allowed) return;

    openScanner({ onScanned: () => {}, onClose: () => {} });
  };

  return (
    <>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.label}>Solde Wallet</Text>
          <PressScale onPress={() => setHidden((v) => !v)} haptic="selection" scaleTo={0.85}>
            {hidden
              ? <EyeOff color="rgba(255,255,255,0.85)" size={20} />
              : <Eye color="rgba(255,255,255,0.85)" size={20} />}
          </PressScale>
        </View>

        <Text style={styles.amount}>
          {hidden ? '••••••' : '125 600 FCFA'}
        </Text>

        <View style={styles.actions}>
          <MiniAction icon={cardActionIcons.topup}    label="Recharger"  onPress={() => openSheet('topup')} />
          <MiniAction icon={cardActionIcons.transfer} label="Transférer" onPress={() => openSheet('transfer')} />
          <MiniAction icon={cardActionIcons.qrcode}   label="QR Code"    onPress={handleScan} />
          <MiniAction
            icon={cardActionIcons.more}
            label="Plus"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Wallet' })}
          />
        </View>
      </LinearGradient>

      <ActionSheet
        visible={activeSheet !== null}
        sheetType={activeSheet}
        onClose={closeSheet}
        submitted={submitted}
        onSubmit={() => setSubmitted(true)}
        colors={colors}
        contacts={contacts}
      />
    </>
  );
}

type ActionSheetProps = {
  visible: boolean;
  sheetType: SheetType;
  onClose: () => void;
  submitted: boolean;
  onSubmit: () => void;
  colors: any;
  contacts: DeviceContact[];
};

const INITIALS_COLORS = ['#FF6848', '#12C47F', '#6366F1', '#F59E0B', '#EC4899', '#14B8A6', '#8B5CF6', '#F97316'];

const OPERATORS = [
  { id: 'orange', label: 'Orange Money', color: '#FF6600' },
  { id: 'wave', label: 'Wave', color: '#1DC3E2' },
  { id: 'free', label: 'Free Money', color: '#FF0000' },
  { id: 'expresso', label: 'E-Money', color: '#009639' },
];

function ActionSheet({ visible, sheetType, onClose, submitted, onSubmit, colors, contacts }: ActionSheetProps) {
  const slideY = useRef(new Animated.Value(400)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 4 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideY, { toValue: 400, useNativeDriver: true, speed: 22, bounciness: 0 }),
        Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!sheetType) return null;

  const config = SHEET_CONFIG[sheetType];

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
                style={[styles.closeBtn, { backgroundColor: colors.primary }]}
                onPress={onClose}
              >
                <Text style={styles.closeBtnText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <SmartForm
              fields={config.fields}
              submitLabel={config.submitLabel}
              onSubmit={onSubmit}
              colors={colors}
              sheetType={sheetType}
              contacts={contacts}
            />
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type MiniActionProps = {
  icon: IconComponent;
  label: string;
  onPress: () => void;
};

function MiniAction({ icon: Icon, label, onPress }: MiniActionProps) {
  return (
    <PressScale style={styles.actionWrap} onPress={onPress} haptic="medium" scaleTo={0.9}>
      <View style={styles.actionButton}>
        <Icon color="#FFFFFF" size={25} strokeWidth={2.35} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </PressScale>
  );
}

function isOperatorField(field: string) {
  return field.toLowerCase().includes('opérateur');
}

function SmartForm({
  fields,
  submitLabel,
  onSubmit,
  colors,
  sheetType,
  contacts,
}: {
  fields: string[];
  submitLabel: string;
  onSubmit: () => void;
  colors: any;
  sheetType: Exclude<SheetType, null>;
  contacts: DeviceContact[];
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [selectedContact, setSelectedContact] = useState<DeviceContact | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [operatorOpen, setOperatorOpen] = useState(false);
  const isTransfer = sheetType === 'transfer';
  const contactFieldName = isTransfer ? fields[0] : null;
  const query = contactFieldName ? (values[contactFieldName] ?? '') : '';

  const filtered = contacts.filter(
    (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query),
  );

  const showSuggestions = isTransfer && !selectedContact && query.length === 0 && contacts.length > 0;
  const showFiltered = isTransfer && !selectedContact && query.length > 0 && filtered.length > 0;

  const pickContact = (contact: DeviceContact) => {
    setSelectedContact(contact);
    if (contactFieldName) setValues((v) => ({ ...v, [contactFieldName]: contact.name }));
  };

  const clearContact = () => {
    setSelectedContact(null);
    if (contactFieldName) setValues((v) => ({ ...v, [contactFieldName]: '' }));
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

        const isContact = field === contactFieldName;

        if (isContact && selectedContact) {
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

        return (
          <View key={field}>
            <View style={[styles.inputWrap, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
              {isContact && <Search color={colors.muted} size={16} style={{ marginLeft: 12 }} />}
              <TextInput
                placeholder={field}
                placeholderTextColor={colors.muted}
                value={values[field] ?? ''}
                onChangeText={(t) => setValues((v) => ({ ...v, [field]: t }))}
                style={[styles.inputInner, { color: colors.text }, isContact && { paddingLeft: 8 }]}
              />
            </View>

            {isContact && (showSuggestions || showFiltered) && (
              <View style={[styles.contactList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {showSuggestions && (
                  <Text style={[styles.contactsHeader, { color: colors.muted }]}>Contacts récents</Text>
                )}
                {(showSuggestions ? contacts.slice(0, 3) : filtered.slice(0, 3)).map((c, i) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.contactRow}
                    onPress={() => pickContact(c)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.contactAvatar, { backgroundColor: INITIALS_COLORS[i % INITIALS_COLORS.length] }]}>
                      <Text style={styles.contactInitials}>{c.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.contactName, { color: colors.text }]}>{c.name}</Text>
                      <Text style={[styles.contactPhone, { color: colors.muted }]}>{c.phone}</Text>
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

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginTop: 8,
    padding: 18,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    fontWeight: '500',
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  actionWrap: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 13,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Modal & sheet
  modalWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: 34,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sheetHandle: {
    alignSelf: 'center',
    borderRadius: 3,
    height: 4,
    marginBottom: 16,
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
    fontWeight: '400',
  },
  contactPhone: {
    fontSize: 11,
    fontWeight: '600',
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
    paddingVertical: 20,
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
    fontWeight: '600',
    textAlign: 'center',
  },
  closeBtn: {
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 13,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
