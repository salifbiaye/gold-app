import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, ChevronLeft, RefreshCcw, Settings } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';

type HeaderBarProps = {
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: 'bell' | 'settings' | 'history';
  onBack?: () => void;
  onRight?: () => void;
};

export function HeaderBar({ title, subtitle, back, right, onBack, onRight }: HeaderBarProps) {
  const { colors } = useAppTheme();
  const RightIcon = right === 'settings' ? Settings : right === 'history' ? RefreshCcw : Bell;

  return (
    <View style={styles.container}>
      {back ? (
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={onBack}>
          <ChevronLeft size={25} color={colors.text} strokeWidth={2.4} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}

      <View style={styles.titleWrap}>
        {title ? <Text style={[styles.title, { color: colors.text }]}>{title}</Text> : null}
        {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
      </View>

      {right ? (
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={onRight}>
          <RightIcon size={24} color={colors.text} strokeWidth={2.35} />
          {right === 'bell' ? <View style={styles.dot} /> : null}
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 50,
  },
  iconButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    position: 'relative',
    width: 42,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  dot: {
    backgroundColor: '#EF4444',
    borderRadius: 5,
    height: 10,
    position: 'absolute',
    right: 8,
    top: 8,
    width: 10,
  },
});
