import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

type SectionHeaderProps = {
  onAction?: () => void;
  title: string;
  action?: string;
};

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {action ? (
        <TouchableOpacity activeOpacity={0.8} onPress={onAction}>
          <Text style={[styles.action, { color: colors.primaryDark }]}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
  },
  action: {
    fontSize: 13,
    fontWeight: '800',
  },
});
