import { SafeAreaView, StyleSheet, Switch, View } from 'react-native';
import ThemedText from '../components/ThemedText';
import { useState } from 'react';

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText style={styles.title}>Settings</ThemedText>
      <View style={styles.row}>
        <ThemedText>Dark mode</ThemedText>
        <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e', padding: 16 },
  title: { fontSize: 28, marginBottom: 24 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#111827',
    borderRadius: 16,
  },
});
