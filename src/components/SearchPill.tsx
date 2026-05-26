import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Mic, Search, SlidersHorizontal } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';

type SearchPillProps = {
  placeholder: string;
  mode?: 'voice' | 'filter' | 'none';
};

export function SearchPill({ placeholder, mode = 'voice' }: SearchPillProps) {
  const { colors } = useAppTheme();
  const Icon = mode === 'filter' ? SlidersHorizontal : Mic;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Search color={colors.muted} size={18} />
      <TextInput placeholder={placeholder} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text }]} />
      {mode !== 'none' ? (
        <TouchableOpacity style={mode === 'voice' ? styles.voiceButton : styles.filterButton} activeOpacity={0.82}>
          <Icon color={mode === 'voice' ? '#FFFFFF' : colors.text} size={20} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    minHeight: 42,
    paddingHorizontal: 13,
  },
  input: {
    flex: 1,
    fontSize: 13,
  },
  voiceButton: {
    alignItems: 'center',
    backgroundColor: '#0EB56D',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  filterButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
