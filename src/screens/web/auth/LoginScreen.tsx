import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Fingerprint, Lock, Phone, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { authConfig } from '../../../config/auth';
import { privateRouteMetadata } from '../../../config/routes';
import { useWebSession } from '../../../context/WebSessionContext';
import { supportsPasskeys } from '../../../services/security/passkeyService';
import { WebSeoHead } from '../public/WebSeoHead';

const SANS = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", system-ui, sans-serif',
  default: undefined,
});

export function LoginScreen() {
  const { login, status } = useWebSession();
  const [identifier, setIdentifier] = useState(authConfig.defaultCredentials.identifier);
  const [password, setPassword] = useState(authConfig.defaultCredentials.password);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const passkeysEnabled = supportsPasskeys();
  const compact = useWindowDimensions().width < 520;

  const submit = async () => {
    setError('');
    try {
      await login({ identifier, password });
      router.replace('/app');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Connexion impossible.');
    }
  };

  const contentStyle = { ...styles.content, ...(compact ? styles.contentCompact : null) };
  const titleStyle = { ...styles.title, ...(compact ? styles.titleCompact : null) };

  return (
    <>
      <WebSeoHead metadata={privateRouteMetadata.connexion} />
      <View style={styles.page}>
        <ScrollView contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.push('/')} style={styles.backLink}>
            <ArrowLeft color="#7A8490" size={18} strokeWidth={2.4} />
            <Text style={styles.backText}>Retour</Text>
          </Pressable>

          <View style={styles.topBlock}>
            <View style={styles.logoMark}>
              <Text style={styles.logoGhost}>G</Text>
              <Text style={styles.logoMain}>A</Text>
            </View>
            <Text style={styles.brand}>Gold App</Text>
            <Text style={titleStyle}>Connexion sécurisée</Text>
            <Text style={styles.subtitle}>Accédez à votre wallet, vos services et votre assistant IA.</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <View style={styles.inputWrap}>
                <Phone color="#7A8490" size={21} strokeWidth={2.3} />
                <TextInput
                  autoCapitalize="none"
                  onChangeText={setIdentifier}
                  placeholder="Téléphone ou identifiant"
                  placeholderTextColor="#7A8490"
                  style={styles.input}
                  value={identifier}
                />
              </View>

              <View style={styles.inputWrap}>
                <Lock color="#7A8490" size={21} strokeWidth={2.3} />
                <TextInput
                  onChangeText={setPassword}
                  placeholder="Mot de passe"
                  placeholderTextColor="#7A8490"
                  secureTextEntry={!visible}
                  style={styles.input}
                  value={password}
                />
                <Pressable onPress={() => setVisible((current) => !current)} style={styles.eyeButton}>
                  {visible ? <EyeOff color="#7A8490" size={20} /> : <Eye color="#7A8490" size={20} />}
                </Pressable>
              </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable disabled={status === 'authenticating'} onPress={() => void submit()} style={styles.button}>
              {status === 'authenticating' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Se connecter</Text>
              )}
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.divider} />
            </View>

            <Pressable disabled={!passkeysEnabled} style={passkeysEnabled ? styles.bioButton : styles.bioButtonDisabled}>
              <Fingerprint color={passkeysEnabled ? '#0EB56D' : '#9CA3AF'} size={25} strokeWidth={2.3} />
              <Text style={passkeysEnabled ? styles.bioButtonText : styles.bioButtonTextDisabled}>
                {passkeysEnabled ? 'Continuer avec une Passkey' : 'Passkeys bientôt disponibles'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <ShieldCheck color="#0EB56D" size={18} strokeWidth={2.3} />
            <Text style={styles.footerText}>Connexion chiffrée - API et credentials centralisés dans config</Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#F4F7FA',
    flex: 1,
    fontFamily: SANS as any,
    minHeight: '100vh' as any,
  },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    maxWidth: 430,
    padding: 24,
    width: '100%',
  },
  contentCompact: {
    justifyContent: 'flex-start',
    paddingTop: 22,
  },
  backLink: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 18,
    paddingVertical: 6,
  },
  backText: {
    color: '#7A8490',
    fontSize: 13,
    fontWeight: '700',
  },
  topBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: '#0EB56D',
    borderColor: 'rgba(255,255,255,0.52)',
    borderRadius: 22,
    borderWidth: 1,
    height: 74,
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    width: 74,
  },
  logoGhost: {
    color: 'rgba(255,255,255,0.32)',
    fontSize: 56,
    fontWeight: '900',
    left: 13,
    position: 'absolute',
    top: 7,
  },
  logoMain: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 3,
  },
  brand: {
    color: '#1F2933',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#1F2933',
    fontSize: 31,
    fontWeight: '900',
    marginTop: 14,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 29,
  },
  subtitle: {
    color: '#7A8490',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 310,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E9EF',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
  },
  inputGroup: {
    gap: 12,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: '#F6F8FA',
    borderColor: '#E4E9EF',
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 62,
    paddingHorizontal: 16,
  },
  input: {
    color: '#1F2933',
    flex: 1,
    fontFamily: SANS as any,
    fontSize: 16,
    fontWeight: '800',
    outlineStyle: 'none' as never,
  },
  eyeButton: {
    padding: 4,
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 12,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#0EB56D',
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
    backgroundColor: '#E4E9EF',
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    color: '#7A8490',
    fontSize: 12,
    fontWeight: '800',
  },
  bioButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E9EF',
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 60,
    paddingHorizontal: 18,
  },
  bioButtonDisabled: {
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    borderColor: '#E4E9EF',
    borderRadius: 15,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 60,
    paddingHorizontal: 18,
  },
  bioButtonText: {
    color: '#1F2933',
    fontSize: 15,
    fontWeight: '900',
  },
  bioButtonTextDisabled: {
    color: '#9CA3AF',
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
    color: '#7A8490',
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});
