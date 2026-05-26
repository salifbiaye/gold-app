import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { IconComponent } from '../types/icon';

type ServiceIntroCardProps = {
  icon: IconComponent;
  tint: string;
  title: string;
  text: string;
};

export function ServiceIntroCard({ icon: Icon, text, tint, title }: ServiceIntroCardProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: `${tint}16`, borderColor: `${tint}33` }]}>
      <View style={[styles.iconBox, { backgroundColor: `${tint}20` }]}>
        <Icon color={tint} size={24} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.text, { color: colors.muted }]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    padding: 14,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 4,
  },
});
