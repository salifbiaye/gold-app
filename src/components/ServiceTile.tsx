import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { PressScale } from './PressScale';
import { IconComponent } from '../types/icon';

type ServiceTileProps = {
  label: string;
  icon: IconComponent;
  tint: string;
  onPress?: () => void;
};

export function ServiceTile({ label, icon: Icon, tint, onPress }: ServiceTileProps) {
  const { colors } = useAppTheme();

  return (
    <PressScale style={styles.container} scaleTo={0.88} haptic="selection" onPress={onPress}>
      <View style={[styles.badge, { backgroundColor: `${tint}18` }]}>
        <Icon size={22} color={tint} strokeWidth={2.3} />
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.label, { color: colors.text }]}>
        {label}
      </Text>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
    height: 58,
    justifyContent: 'center',
    width: '22%',
  },
  badge: {
    alignItems: 'center',
    borderRadius: 9,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    maxWidth: '94%',
  },
});
