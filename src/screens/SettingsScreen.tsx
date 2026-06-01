import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Fingerprint,
  KeyRound,
  Lock,
  LogOut,
  Moon,
  Shield,
  Smartphone,
  Sun,
  UserPlus,
  Wallet,
} from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { ThemeMode, useAppTheme } from '../context/ThemeContext';
import { colors as appColors } from '../theme/colors';
import type { IconComponent } from '../types/icon';

type RowDef = { icon: IconComponent; label: string; id: string };
type SectionDef = { title: string; rows: RowDef[] };

const SECTIONS: SectionDef[] = [
  {
    title: 'Compte',
    rows: [
      { icon: UserPlus, label: 'Ajouter un autre compte', id: 'add_account' },
      { icon: Smartphone, label: 'Appareils connectés', id: 'devices' },
    ],
  },
  {
    title: 'Préférences',
    rows: [
      { icon: Bell, label: 'Notifications', id: 'notif' },
      { icon: Moon, label: 'Apparence', id: 'theme' },
      { icon: Wallet, label: 'Devise par défaut', id: 'currency' },
    ],
  },
  {
    title: 'Paiements',
    rows: [
      { icon: CreditCard, label: 'Moyens de paiement', id: 'payment_methods' },
      { icon: Shield, label: 'Vérifier mes limites', id: 'limits' },
    ],
  },
  {
    title: 'Sécurité',
    rows: [
      { icon: KeyRound, label: 'Changer le code PIN', id: 'pin' },
      { icon: Fingerprint, label: 'Authentification biométrique', id: 'biometric' },
      { icon: Lock, label: 'Changer le mot de passe', id: 'password' },
    ],
  },
];

const THEME_OPTIONS: { label: string; value: ThemeMode; icon: IconComponent }[] = [
  { label: 'Système', value: 'system', icon: Smartphone },
  { label: 'Clair', value: 'light', icon: Sun },
  { label: 'Sombre', value: 'dark', icon: Moon },
];

const CURRENCIES = ['FCFA (XOF)', 'EUR', 'USD'];

export function SettingsScreen() {
  const navigation = useNavigation();
  const { colors, mode, resolvedMode, setMode } = useAppTheme();
  const { logout } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [currency, setCurrency] = useState('FCFA (XOF)');

  const toggle = (id: string) => setExpanded((p) => (p === id ? null : id));

  const renderExpandable = (id: string) => {
    if (expanded !== id) return null;

    if (id === 'theme') {
      return (
        <View style={styles.expandedContent}>
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = mode === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionRow, selected && styles.optionRowActive]}
                activeOpacity={0.7}
                onPress={() => setMode(opt.value)}
              >
                <Icon color={selected ? colors.primary : colors.muted} size={21} strokeWidth={2.25} />
                <Text style={[styles.optionLabel, selected && { color: colors.primary, fontWeight: '700' }]}>
                  {opt.label}
                </Text>
                {selected && <Check color={colors.primary} size={20} strokeWidth={2.35} />}
              </TouchableOpacity>
            );
          })}
          <View style={styles.modeHint}>
            {resolvedMode === 'dark'
              ? <Moon color={colors.primary} size={15} />
              : <Sun color={colors.warning} size={15} />}
            <Text style={styles.modeHintText}>
              Actif : {resolvedMode === 'dark' ? 'Sombre' : 'Clair'}
            </Text>
          </View>
        </View>
      );
    }

    if (id === 'currency') {
      return (
        <View style={styles.expandedContent}>
          {CURRENCIES.map((c) => {
            const selected = currency === c;
            return (
              <TouchableOpacity
                key={c}
                style={[styles.optionRow, selected && styles.optionRowActive]}
                activeOpacity={0.7}
                onPress={() => setCurrency(c)}
              >
                <Text style={[styles.optionLabel, selected && { color: colors.primary, fontWeight: '700' }]}>
                  {c}
                </Text>
                {selected && <Check color={colors.primary} size={20} strokeWidth={2.35} />}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    return null;
  };

  const isExpandable = (id: string) => id === 'theme' || id === 'currency';
  const isToggle = (id: string) => id === 'notif' || id === 'biometric';

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={25} strokeWidth={2.4} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 36 }} />
      </View>

      {SECTIONS.map((section) => (
        <View key={section.title}>
          <Text style={styles.sectionLabel}>{section.title}</Text>
          <View style={styles.card}>
            {section.rows.map((row, i) => {
              const Icon = row.icon;
              const isLast = i === section.rows.length - 1;
              const isExp = isExpandable(row.id);
              const isOpen = expanded === row.id;
              const isTgl = isToggle(row.id);
              const Chevron = isOpen ? ChevronDown : ChevronRight;

              return (
                <View key={row.id}>
                  <TouchableOpacity
                    style={[styles.row, !isLast && !isOpen && styles.rowBorder]}
                    activeOpacity={0.7}
                    onPress={isExp ? () => toggle(row.id) : undefined}
                  >
                    <Icon color={colors.muted} size={23} strokeWidth={2.1} />
                    <Text style={styles.rowLabel}>{row.label}</Text>
                    {isTgl && row.id === 'notif' && (
                      <View style={styles.switchWrap}>
                        <Switch
                          value={notifEnabled}
                          onValueChange={setNotifEnabled}
                          trackColor={{ false: colors.border, true: colors.primary }}
                          thumbColor="#FFFFFF"
                          style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] } : undefined}
                        />
                      </View>
                    )}
                    {isTgl && row.id === 'biometric' && (
                      <View style={styles.switchWrap}>
                        <Switch
                          value={biometricEnabled}
                          onValueChange={setBiometricEnabled}
                          trackColor={{ false: colors.border, true: colors.primary }}
                          thumbColor="#FFFFFF"
                          style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] } : undefined}
                        />
                      </View>
                    )}
                    {isExp && <Chevron color={colors.muted} size={20} strokeWidth={2.25} />}
                    {!isExp && !isTgl && <ChevronRight color={colors.muted} size={20} strokeWidth={2.25} />}
                  </TouchableOpacity>
                  {renderExpandable(row.id)}
                  {isOpen && !isLast && <View style={styles.rowBorderFull} />}
                </View>
              );
            })}
          </View>
        </View>
      ))}

      <Text style={styles.sectionLabel}>Déconnexion</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.logoutRow} activeOpacity={0.8} onPress={logout}>
          <LogOut color={colors.muted} size={22} strokeWidth={2.1} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Gold App v1.0.0</Text>
    </Screen>
  );
}

function createStyles(colors: typeof appColors) {
  return StyleSheet.create({
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 12,
      paddingTop: 6,
    },
    backBtn: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 21,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '900',
    },
    sectionLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.3,
      marginBottom: 6,
      marginTop: 18,
      textTransform: 'uppercase',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      overflow: 'hidden',
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 14,
      minHeight: 58,
      paddingHorizontal: 18,
    },
    rowBorder: {
      borderBottomColor: colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    rowBorderFull: {
      backgroundColor: colors.border,
      height: StyleSheet.hairlineWidth,
      marginHorizontal: 16,
    },
    rowLabel: {
      color: colors.text,
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
    },
    switchWrap: {
      alignItems: 'center',
      height: 30,
      justifyContent: 'center',
    },
    expandedContent: {
      gap: 2,
      paddingBottom: 12,
      paddingHorizontal: 16,
    },
    optionRow: {
      alignItems: 'center',
      borderRadius: 8,
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 13,
    },
    optionRowActive: {
      backgroundColor: colors.primarySoft,
    },
    optionLabel: {
      color: colors.text,
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
    },
    modeHint: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 5,
      paddingHorizontal: 12,
      paddingTop: 4,
    },
    modeHintText: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '600',
    },
    logoutRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 14,
      minHeight: 58,
      paddingHorizontal: 18,
    },
    logoutText: {
      color: colors.muted,
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
    },
    version: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 16,
      textAlign: 'center',
    },
  });
}

