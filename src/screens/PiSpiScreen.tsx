import { Image, StyleSheet, Text, View } from 'react-native';
import { materialIcon } from '../components/AppIconSet';
import { HeaderBar } from '../components/HeaderBar';
import { Screen } from '../components/Screen';
import { useAppTheme } from '../context/ThemeContext';

const piSpiLogo = require('../../assets/images/pi-spi.logo.png');

const features = [
  { icon: materialIcon('account-balance-wallet'), title: 'Paiements interoperables', text: 'Payez entre wallet, banque et services compatibles.' },
  { icon: materialIcon('bolt'), title: 'Transactions rapides', text: 'Validation simple pour vos paiements du quotidien.' },
  { icon: materialIcon('verified-user'), title: 'Securise', text: 'Controle et confirmation avant chaque operation sensible.' },
];

export function PiSpiScreen() {
  const { colors } = useAppTheme();

  return (
    <Screen edges={['left', 'right']}>
      <HeaderBar title="PI-SPI" />

      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Image source={piSpiLogo} resizeMode="contain" style={styles.logo} />
        <Text style={[styles.title, { color: colors.text }]}>Paiements PI-SPI</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Un point d'acces simple pour vos paiements securises et interoperables.
        </Text>
      </View>

      <View style={styles.list}>
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <View key={item.title} style={[styles.feature, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}>
                <Icon color={colors.primary} size={22} strokeWidth={2.25} />
              </View>
              <View style={styles.featureCopy}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.featureText, { color: colors.muted }]}>{item.text}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 10,
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  logo: {
    height: 86,
    width: 86,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
  list: {
    gap: 10,
    marginTop: 16,
  },
  feature: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 18,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  featureText: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    marginTop: 3,
  },
});
