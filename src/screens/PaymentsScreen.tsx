import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown, ChevronRight, WalletCards } from 'lucide-react-native';
import { HeaderBar } from '../components/HeaderBar';
import { SearchPill } from '../components/SearchPill';
import { Screen } from '../components/Screen';
import { ServiceIntroCard } from '../components/ServiceIntroCard';
import { securityConfig } from '../config/security';

import { useAppTheme } from '../context/ThemeContext';
import { paymentMenu } from '../data/mockData';
import { requestBiometricAuth } from '../services/security/biometricService';
import { colors as appColors } from '../theme/colors';

type DrawerFields = Record<string, string[]>;

const DRAWER_FIELDS: DrawerFields = {
  merchant: ['Code ou numéro marchand', 'Montant (FCFA)'],
  bill: ['Fournisseur (ex: Senelec)', 'Numéro de compte', 'Montant (FCFA)'],
  airtime: ['Numéro de téléphone', 'Opérateur', 'Montant (FCFA)'],
  transfer: ['Numéro ou compte bénéficiaire', 'Banque / Wallet', 'Montant (FCFA)', 'Note (optionnel)'],
  request: ['Montant à demander (FCFA)', 'Description'],
  history: [],
};

export function PaymentsScreen() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenItem((prev) => (prev === id ? null : id));
    setSubmitted(null);
  };

  const handleSubmit = async (id: string) => {
    if (securityConfig.biometric.protectedPaymentActions.includes(id)) {
      const allowed = await requestBiometricAuth('Confirmer le paiement avec Face ID');
      if (!allowed) return;
    }

    setSubmitted(id);
    setFormValues({});
    setTimeout(() => {
      setOpenItem(null);
      setSubmitted(null);
    }, 1800);
  };

  return (
    <Screen edges={['left', 'right']}>
      <HeaderBar title="Paiements" subtitle="Marchands, factures et transferts" back onBack={navigation.goBack} />
      <View style={styles.searchWrap}>
        <SearchPill placeholder="Rechercher un paiement..." mode="filter" />
      </View>
      <ServiceIntroCard
        icon={WalletCards}
        tint={colors.primary}
        title="Paiements"
        text="Payez un marchand, réglez une facture ou envoyez de l’argent rapidement."
      />
      <View style={styles.menu}>
        {paymentMenu.map((item, index) => {
          const Icon = item.icon;
          const isOpen = openItem === item.id;
          const fields = DRAWER_FIELDS[item.id] ?? [];
          const isLast = index === paymentMenu.length - 1;

          return (
            <View key={item.id}>
              <TouchableOpacity
                style={[styles.row, (isLast && !isOpen) && styles.rowLast]}
                activeOpacity={0.82}
                onPress={() => toggle(item.id)}
              >
                <View style={[styles.iconBox, { backgroundColor: `${item.color}18` }]}>
                  <Icon color={item.color} size={22} />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.title}>{item.label}</Text>
                  <Text style={styles.meta}>{item.meta}</Text>
                </View>
                {isOpen
                  ? <ChevronDown color={colors.muted} size={18} />
                  : <ChevronRight color={colors.muted} size={18} />
                }
              </TouchableOpacity>

              {isOpen && (
                <View style={[styles.drawer, (isLast) && styles.drawerLast]}>
                  {item.id === 'history' ? (
                    <TouchableOpacity
                      style={styles.submitBtn}
                      activeOpacity={0.86}
                      onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Wallet' })}
                    >
                      <Text style={styles.submitText}>Voir dans Wallet →</Text>
                    </TouchableOpacity>
                  ) : submitted === item.id ? (
                    <View style={styles.successRow}>
                      <Text style={styles.successText}>✓ Demande enregistrée — backend à brancher</Text>
                    </View>
                  ) : (
                    <>
                      {fields.map((field) => (
                        <TextInput
                          key={field}
                          placeholder={field}
                          placeholderTextColor={colors.muted}
                          value={formValues[field] ?? ''}
                          onChangeText={(v) => setFormValues((prev) => ({ ...prev, [field]: v }))}
                          style={styles.input}
                          keyboardType={field.toLowerCase().includes('montant') || field.toLowerCase().includes('numéro') ? 'numeric' : 'default'}
                        />
                      ))}
                      <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: item.color }]}
                        activeOpacity={0.86}
                        onPress={() => handleSubmit(item.id)}
                      >
                        <Text style={styles.submitText}>Confirmer</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

function createStyles(colors: typeof appColors) {
  return StyleSheet.create({
    searchWrap: {
      marginTop: 8,
    },
    menu: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginTop: 14,
      overflow: 'hidden',
    },
    row: {
      alignItems: 'center',
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      minHeight: 68,
      paddingHorizontal: 14,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    iconBox: {
      alignItems: 'center',
      borderRadius: 10,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    copy: {
      flex: 1,
      marginLeft: 12,
    },
    title: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '900',
    },
    meta: {
      color: colors.muted,
      fontSize: 11,
      marginTop: 4,
    },
    drawer: {
      backgroundColor: colors.surfaceMuted,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      gap: 10,
      padding: 14,
    },
    drawerLast: {
      borderBottomWidth: 0,
    },
    input: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 10,
      borderWidth: 1,
      color: colors.text,
      fontSize: 13,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    submitBtn: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 13,
    },
    submitText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '900',
    },
    successRow: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    successText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '800',
    },
  });
}
