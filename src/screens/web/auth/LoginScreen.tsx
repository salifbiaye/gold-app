import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Fingerprint, Lock, Phone, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
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

const MONO = Platform.select({
  web: 'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, monospace',
  default: undefined,
});
const SANS = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", system-ui, sans-serif',
  default: undefined,
});

function sx(...items: Array<object | false | null | undefined>) {
  return StyleSheet.flatten(items.filter(Boolean));
}

export function LoginScreen() {
  const { login, status } = useWebSession();
  const [identifier, setIdentifier] = useState(authConfig.defaultCredentials.identifier);
  const [password, setPassword] = useState(authConfig.defaultCredentials.password);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const passkeysEnabled = supportsPasskeys();
  const width = useWindowDimensions().width;
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const compact = hydrated && width < 920;

  const submit = async () => {
    setError('');
    try {
      await login({ identifier, password });
      router.replace('/app');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Connexion impossible.');
    }
  };

  return (
    <>
      <WebSeoHead metadata={privateRouteMetadata.connexion} />
      <View style={sx(styles.page, compact && styles.pageCompact)}>
        {/* LEFT — brand side */}
        <View style={sx(styles.brandSide, compact && styles.brandSideCompact)}>
          <View style={styles.brandMesh} />
          <View style={styles.brandGrid} />

          <View style={styles.brandHeader}>
            <Pressable onPress={() => router.push('/')} style={styles.brand}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>G</Text>
              </View>
              <Text style={styles.brandText}>
                Gold<Text style={styles.green}>.</Text>
              </Text>
            </Pressable>
            <Pressable onPress={() => router.push('/')} style={styles.backLink}>
              <ArrowLeft color="#8DA0AE" size={14} strokeWidth={2.4} />
              <Text style={styles.backText}>Retour à l'accueil</Text>
            </Pressable>
          </View>

          {!compact && (
            <View style={styles.brandBody}>
              <View style={styles.brandKickerWrap}>
                <Text style={styles.brandKicker}>ESPACE SÉCURISÉ</Text>
              </View>
              <Text style={styles.brandTitle}>
                Votre espace,{'\n'}
                <Text style={styles.brandTitleItalic}>sur tous vos écrans.</Text>
              </Text>
              <Text style={styles.brandCopy}>
                Gérez le wallet, les commandes et les services depuis une interface web sobre.
                La version mobile conserve Face ID et l'empreinte digitale.
              </Text>

              <View style={styles.brandFeatures}>
                <Feature icon={ShieldCheck} title="Session web durcie" text="Cookies HttpOnly, expiration courte." />
                <Feature icon={Fingerprint} title="Biométrie mobile" text="Validation Face ID & empreinte." />
                <Feature icon={Sparkles} title="Passkeys" text="Bientôt disponible côté web." />
              </View>
            </View>
          )}

          {!compact && (
            <View style={styles.brandFooter}>
              <Text style={styles.brandFooterText}>© 2026 Gold App · Dakar, Sénégal</Text>
            </View>
          )}
        </View>

        {/* RIGHT — form side */}
        <View style={sx(styles.formSide, compact && styles.formSideCompact)}>
          <View style={styles.formWrap}>
            <View style={styles.formHeader}>
              <Text style={styles.formEyebrow}>CONNEXION</Text>
              <Text style={styles.formTitle}>Heureux de vous revoir.</Text>
              <Text style={styles.formSubtitle}>
                Entrez vos identifiants pour accéder à votre espace.
              </Text>
            </View>

            <View style={styles.formBody}>
              <Field
                icon={Phone}
                label="Numéro de téléphone"
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="+221 77 000 00 00"
              />

              <View style={styles.fieldWrap}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <Text style={styles.labelLink}>Mot de passe oublié ?</Text>
                </View>
                <View style={styles.inputRow}>
                  <Lock color="#64736B" size={20} strokeWidth={2.25} />
                  <TextInput
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#C2CAD2"
                    secureTextEntry={!visible}
                    style={styles.input}
                    value={password}
                  />
                  <Pressable onPress={() => setVisible((c) => !c)} style={styles.eyeButton}>
                    {visible ? <EyeOff color="#64736B" size={20} /> : <Eye color="#64736B" size={20} />}
                  </Pressable>
                </View>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <View style={styles.errorDot} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable
                disabled={status === 'authenticating'}
                onPress={() => void submit()}
                style={styles.submit}
              >
                <Text style={styles.submitText}>
                  {status === 'authenticating' ? 'Connexion…' : 'Se connecter'}
                </Text>
                {status === 'authenticating' ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <ArrowRight color="#FFFFFF" size={18} strokeWidth={2.4} />
                )}
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OU</Text>
                <View style={styles.dividerLine} />
              </View>

              {passkeysEnabled ? (
                <Pressable style={styles.passkey}>
                  <Fingerprint color="#0A0F14" size={20} strokeWidth={2.25} />
                  <Text style={styles.passkeyText}>Continuer avec une Passkey</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.passkeyDisabled} disabled>
                  <Fingerprint color="#9CA3AF" size={20} strokeWidth={2.25} />
                  <Text style={styles.passkeyTextDisabled}>Passkeys bientôt disponibles</Text>
                </Pressable>
              )}

              <Text style={styles.note}>
                Vous n'avez pas de compte ?{' '}
                <Text style={styles.noteLink}>Créer un compte</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

function Field({
  icon: Icon,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  icon: typeof Phone;
  label: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Icon color="#64736B" size={20} strokeWidth={2.25} />
        <TextInput
          autoCapitalize="none"
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#C2CAD2"
          style={styles.input}
          value={value}
        />
      </View>
    </View>
  );
}

function Feature({ icon: Icon, text, title }: { icon: typeof ShieldCheck; text: string; title: string }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <Icon color="#12C47F" size={20} strokeWidth={2.25} />
      </View>
      <View style={styles.featureCopy}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: '#EAF8EF', flex: 1, flexDirection: 'row', fontFamily: SANS as any, minHeight: '100vh' as never },
  pageCompact: { flexDirection: 'column' },

  /* Brand side (dark) */
  brandSide: {
    backgroundColor: '#0A0F14',
    flex: 1,
    overflow: 'hidden',
    paddingHorizontal: 56,
    paddingVertical: 48,
    position: 'relative',
  },
  brandSideCompact: { flex: 0, paddingHorizontal: 24, paddingVertical: 22 },
  brandMesh: {
    backgroundColor: '#0EB56D',
    borderRadius: 999,
    height: 480,
    opacity: 0.12,
    position: 'absolute',
    right: -180,
    top: -180,
    width: 480,
  },
  brandGrid: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  brandHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', zIndex: 2 },
  brand: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  brandMark: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, height: 30, justifyContent: 'center', width: 30 },
  brandMarkText: { color: '#0A0F14', fontSize: 16, fontWeight: '900', letterSpacing: 0 },
  brandText: { color: '#FFFFFF', fontSize: 19, fontWeight: '800', letterSpacing: 0 },
  green: { color: '#12C47F' },
  backLink: { alignItems: 'center', flexDirection: 'row', gap: 6, paddingHorizontal: 8, paddingVertical: 6 },
  backText: { color: '#8DA0AE', fontSize: 12, fontWeight: '600' },

  brandBody: { flex: 1, justifyContent: 'center', maxWidth: 480, zIndex: 2 },
  brandKickerWrap: { alignSelf: 'flex-start', marginBottom: 22 },
  brandKicker: { color: '#12C47F', fontFamily: MONO as any, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  brandTitle: { color: '#FFFFFF', fontSize: 48, fontWeight: '800', letterSpacing: 0, lineHeight: 54 },
  brandTitleItalic: { color: '#8DA0AE', fontStyle: 'italic', fontWeight: '300' },
  brandCopy: { color: '#A8B3BD', fontSize: 16, fontWeight: '400', lineHeight: 26, marginTop: 22, maxWidth: 460 },

  brandFeatures: { gap: 4, marginTop: 40 },
  feature: { alignItems: 'flex-start', flexDirection: 'row', gap: 14, paddingVertical: 10 },
  featureIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(18,196,127,0.12)',
    borderColor: 'rgba(18,196,127,0.25)',
    borderRadius: 9,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  featureCopy: { flex: 1 },
  featureTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  featureText: { color: '#8DA0AE', fontSize: 13, lineHeight: 20, marginTop: 3 },

  brandFooter: { zIndex: 2 },
  brandFooterText: { color: '#5C6B76', fontFamily: MONO as any, fontSize: 11, fontWeight: '500' },

  /* Form side (light) */
  formSide: { alignItems: 'center', backgroundColor: '#EAF8EF', flex: 1, justifyContent: 'center', padding: 56 },
  formSideCompact: { justifyContent: 'flex-start', padding: 22 },
  formWrap: { maxWidth: 420, width: '100%' },

  formHeader: { marginBottom: 36 },
  formEyebrow: { color: '#0EB56D', fontFamily: MONO as any, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 14 },
  formTitle: { color: '#0A0F14', fontSize: 40, fontWeight: '900', letterSpacing: 0, lineHeight: 46 },
  formSubtitle: { color: '#52635A', fontSize: 17, fontWeight: '500', lineHeight: 25, marginTop: 12 },

  formBody: { gap: 18 },
  fieldWrap: { gap: 8 },
  labelRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: '#1F2A33', fontSize: 15, fontWeight: '700' },
  labelLink: { color: '#0EB56D', fontSize: 13, fontWeight: '800' },
  inputRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#CFEADD',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    height: 60,
    paddingHorizontal: 16,
  },
  input: { color: '#0A0F14', flex: 1, fontFamily: SANS as any, fontSize: 16, outlineStyle: 'none' as never },
  eyeButton: { padding: 4 },

  errorBox: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorDot: { backgroundColor: '#DC2626', borderRadius: 999, height: 6, width: 6 },
  errorText: { color: '#991B1B', flex: 1, fontSize: 13, fontWeight: '600' },

  submit: {
    alignItems: 'center',
    backgroundColor: '#0A0F14',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    height: 60,
    justifyContent: 'center',
    marginTop: 6,
  },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },

  divider: { alignItems: 'center', flexDirection: 'row', gap: 12, marginVertical: 6 },
  dividerLine: { backgroundColor: '#CFEADD', flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: { color: '#9CA3AF', fontFamily: MONO as any, fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  passkey: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#CFEADD',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    height: 58,
    justifyContent: 'center',
  },
  passkeyText: { color: '#0A0F14', fontSize: 16, fontWeight: '800' },
  passkeyDisabled: {
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    borderColor: '#CFEADD',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    height: 58,
    justifyContent: 'center',
  },
  passkeyTextDisabled: { color: '#9CA3AF', fontSize: 15, fontWeight: '700' },

  note: { color: '#52635A', fontSize: 15, marginTop: 12, textAlign: 'center' },
  noteLink: { color: '#0EB56D', fontWeight: '700' },
});
