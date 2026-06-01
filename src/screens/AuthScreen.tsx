import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FingerprintPattern, Lock, Phone, ScanFace, ShieldCheck } from 'lucide-react-native';
import { authConfig } from '../config/auth';
import { useAppTheme } from '../context/ThemeContext';
import { loginWithBiometricSession, loginWithCredentials } from '../services/auth/authService';
import { biometricLabel, BiometricType, getBiometricCapability } from '../services/security/biometricService';
import { colors as appColors } from '../theme/colors';
import { AuthResult } from '../types/auth';

type AuthScreenProps = {
  onAuthenticated: (result: AuthResult) => void;
};

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const { colors, resolvedMode } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, resolvedMode), [colors, resolvedMode]);
  const [identifier, setIdentifier] = useState(authConfig.defaultCredentials.identifier);
  const [password, setPassword] = useState(authConfig.defaultCredentials.password);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricType, setBiometricType] = useState<BiometricType | null>(null);

  useEffect(() => {
    getBiometricCapability()
      .then((capability) => setBiometricType(capability.type))
      .catch(() => setBiometricType(null));
  }, []);

  const submit = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await loginWithCredentials({ identifier, password });
      onAuthenticated(result);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Connexion impossible');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithBiometrics = async () => {
    setError(null);
    const label = biometricLabel(biometricType);

    try {
      setIsLoading(true);
      const authResult = await loginWithBiometricSession(`Connexion avec ${label}`);
      if (authResult) {
        onAuthenticated(authResult);
      } else {
        setError('Connectez-vous une premiere fois pour activer la biometrie');
      }
    } catch {
      setError(`${label} indisponible pour le moment`);
    } finally {
      setIsLoading(false);
    }
  };

  const BioIcon = biometricType === 'faceid' ? ScanFace : FingerprintPattern;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.topBlock}>
            <View style={styles.logoMark}>
              <Text style={styles.logoGhost}>G</Text>
              <Text style={styles.logoMain}>A</Text>
            </View>
            <Text style={styles.brand}>Gold App</Text>
            <Text style={styles.title}>Connexion securisee</Text>
            <Text style={styles.subtitle}>Accedez a votre wallet, vos services et votre assistant IA.</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <View style={styles.inputWrap}>
                <Phone color={colors.muted} size={21} strokeWidth={2.3} />
                <TextInput
                  autoCapitalize="none"
                  keyboardType="phone-pad"
                  onChangeText={setIdentifier}
                  placeholder="Telephone ou identifiant"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={identifier}
                />
              </View>

              <View style={styles.inputWrap}>
                <Lock color={colors.muted} size={21} strokeWidth={2.3} />
                <TextInput
                  onChangeText={setPassword}
                  placeholder="Mot de passe"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  style={styles.input}
                  value={password}
                />
              </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity disabled={isLoading} style={styles.button} activeOpacity={0.86} onPress={submit}>
              {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Se connecter</Text>}
            </TouchableOpacity>

            {biometricType ? (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>ou</Text>
                  <View style={styles.divider} />
                </View>

                <TouchableOpacity
                  disabled={isLoading}
                  style={styles.bioButton}
                  activeOpacity={0.86}
                  onPress={loginWithBiometrics}
                >
                  <BioIcon color={colors.primary} size={25} strokeWidth={2.3} />
                  <Text style={styles.bioButtonText}>
                    {biometricType === 'faceid' ? 'Utiliser Face ID' : 'Utiliser empreinte'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>

          <View style={styles.footer}>
            <ShieldCheck color={colors.primary} size={18} strokeWidth={2.3} />
            <Text style={styles.footerText}>Connexion chiffree - API et credentials centralises dans config</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: typeof appColors, resolvedMode: 'light' | 'dark') {
  const dark = resolvedMode === 'dark';

  return StyleSheet.create({
    safeArea: {
      backgroundColor: colors.background,
      flex: 1,
    },
    keyboard: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
    },
    topBlock: {
      alignItems: 'center',
      marginBottom: 28,
    },
    logoMark: {
      alignItems: 'center',
      backgroundColor: dark ? colors.surface : colors.primary,
      borderColor: dark ? colors.border : 'rgba(255,255,255,0.52)',
      borderRadius: 22,
      borderWidth: 1,
      height: 74,
      justifyContent: 'center',
      marginBottom: 20,
      overflow: 'hidden',
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: dark ? 0.24 : 0.14,
      shadowRadius: 22,
      width: 74,
    },
    logoGhost: {
      color: dark ? 'rgba(14,181,109,0.18)' : 'rgba(255,255,255,0.32)',
      fontSize: 56,
      fontWeight: '900',
      left: 13,
      position: 'absolute',
      top: 7,
    },
    logoMain: {
      color: dark ? colors.primary : '#FFFFFF',
      fontSize: 34,
      fontWeight: '900',
      marginTop: 3,
    },
    brand: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    title: {
      color: colors.text,
      fontSize: 31,
      fontWeight: '900',
      marginTop: 14,
      textAlign: 'center',
    },
    subtitle: {
      color: colors.muted,
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 21,
      marginTop: 8,
      maxWidth: 300,
      textAlign: 'center',
    },
    formCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 24,
      borderWidth: 1,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: dark ? 0.2 : 0.07,
      shadowRadius: 24,
      elevation: 5,
    },
    inputGroup: {
      gap: 12,
    },
    inputWrap: {
      alignItems: 'center',
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
      borderRadius: 15,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 10,
      minHeight: 62,
      paddingHorizontal: 16,
    },
    input: {
      color: colors.text,
      flex: 1,
      fontSize: 16,
      fontWeight: '800',
    },
    error: {
      color: colors.danger,
      fontSize: 13,
      fontWeight: '800',
      marginTop: 12,
    },
    button: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 15,
      justifyContent: 'center',
      marginTop: 16,
      minHeight: 60,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '900',
    },
    dividerRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
      marginVertical: 15,
    },
    divider: {
      backgroundColor: colors.border,
      flex: 1,
      height: StyleSheet.hairlineWidth,
    },
    dividerText: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '800',
    },
    bioButton: {
      alignItems: 'center',
      backgroundColor: dark ? colors.surfaceMuted : '#FFFFFF',
      borderColor: colors.border,
      borderRadius: 15,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'center',
      minHeight: 60,
      paddingHorizontal: 18,
    },
    bioButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '900',
    },
    footer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 7,
      justifyContent: 'center',
      marginTop: 18,
      paddingHorizontal: 6,
    },
    footerText: {
      color: colors.muted,
      flexShrink: 1,
      fontSize: 12,
      fontWeight: '800',
      textAlign: 'center',
    },
  });
}

