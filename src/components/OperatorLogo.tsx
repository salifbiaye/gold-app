import { StyleSheet, Text, View } from 'react-native';

type Props = {
  operator: string;
  size?: number;
};

const CONFIGS: Record<string, { bg: string; text: string; label: string; borderColor?: string }> = {
  orange: { bg: '#FF6600', text: '#FFFFFF', label: 'OM' },
  wave: { bg: '#1DC3E2', text: '#FFFFFF', label: 'W' },
  free: { bg: '#FFFFFF', text: '#FF0000', label: 'F', borderColor: '#FF0000' },
  expresso: { bg: '#009639', text: '#FFFFFF', label: 'E' },
};

export function OperatorLogo({ operator, size = 32 }: Props) {
  const c = CONFIGS[operator] ?? { bg: '#999', text: '#FFF', label: '?' };
  const radius = size / 2;
  return (
    <View
      style={[
        styles.logo,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: c.bg,
          borderColor: c.borderColor ?? c.bg,
          borderWidth: c.borderColor ? 2 : 0,
        },
      ]}
    >
      <Text style={[styles.label, { fontSize: size * 0.38, color: c.text }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0,
  },
});
