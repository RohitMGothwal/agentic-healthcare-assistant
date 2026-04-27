import { Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function ModeSwitcher({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  label: {
    color: '#fff',
    fontWeight: '600',
  },
});
