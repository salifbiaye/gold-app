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
      <View style={[styles.badge, { backgroundColor: `${tint}28` }]}>
        <Icon size={28} color={tint} strokeWidth={2.2} />
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
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 4,
    width: '23%',
  },
  badge: {
    alignItems: 'center',
    borderRadius: 20,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    maxWidth: '94%',
    textAlign: 'center',
  },
});
