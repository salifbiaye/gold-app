import { Redirect } from 'expo-router';
import { Platform } from 'react-native';
import { SeoHead } from '../src/components/seo/SeoHead';
import { LoginScreen } from '../src/screens/web/auth/LoginScreen';

export default function ConnexionRoute() {
  if (Platform.OS !== 'web') return <Redirect href="/" />;
  return (
    <>
      <SeoHead
        title="Connexion · GoldApp"
        description="Connecte-toi à GoldApp pour gérer ton wallet PI-SPI, tes commandes et tous tes services au Sénégal."
        path="/connexion"
      />
      <LoginScreen />
    </>
  );
}
