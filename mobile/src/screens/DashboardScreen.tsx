import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import ThemedText from '../components/ThemedText';
import RiskBadge from '../components/RiskBadge';
import SOSButton from '../components/SOSButton';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText style={styles.title}>Dashboard</ThemedText>
        <RiskBadge label="Low risk" />
        <View style={styles.card}>
          <ThemedText>Track your appointments, chat with the assistant, and view your health insights.</ThemedText>
        </View>
        <SOSButton onPress={() => {}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  content: { padding: 20 },
  title: { fontSize: 28, marginBottom: 16 },
  card: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 16,
    marginVertical: 16,
  },
});
