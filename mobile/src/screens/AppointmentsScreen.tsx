import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import ThemedText from '../components/ThemedText';

export default function AppointmentsScreen() {
  const appointments = [
    { id: 1, date: '2026-05-10', doctor: 'Dr. Patel', clinic: 'Wellness Center', status: 'confirmed' },
    { id: 2, date: '2026-05-18', doctor: 'Dr. Smith', clinic: 'City Clinic', status: 'pending' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText style={styles.title}>Appointments</ThemedText>
        {appointments.map((appointment) => (
          <View key={appointment.id} style={styles.card}>
            <ThemedText>{appointment.date}</ThemedText>
            <ThemedText>{appointment.doctor}</ThemedText>
            <ThemedText>{appointment.clinic}</ThemedText>
            <ThemedText>Status: {appointment.status}</ThemedText>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  content: { padding: 16 },
  title: { fontSize: 28, marginBottom: 16 },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
});
