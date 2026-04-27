import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Button, ActivityIndicator, RefreshControl } from 'react-native';
import ThemedText from '../components/ThemedText';
import { appointmentsApi } from '../api/client';

type Appointment = {
  id: number;
  doctor_name: string;
  clinic_name: string;
  appointment_date: string;
  status: string;
  notes?: string;
};

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAppointments = useCallback(async () => {
    try {
      const data = await appointmentsApi.getAll();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadAppointments();
      setIsLoading(false);
    };
    init();
  }, [loadAppointments]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadAppointments();
    setIsRefreshing(false);
  }, [loadAppointments]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#94a3b8';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <ThemedText style={styles.title}>Appointments</ThemedText>
        {appointments.length === 0 ? (
          <ThemedText style={styles.emptyText}>No appointments yet</ThemedText>
        ) : (
          appointments.map((appointment) => (
            <View key={appointment.id} style={styles.card}>
              <ThemedText style={styles.date}>{formatDate(appointment.appointment_date)}</ThemedText>
              <ThemedText style={styles.doctor}>{appointment.doctor_name}</ThemedText>
              <ThemedText style={styles.clinic}>{appointment.clinic_name}</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
                <ThemedText style={styles.statusText}>{appointment.status}</ThemedText>
              </View>
              {appointment.notes && (
                <ThemedText style={styles.notes}>{appointment.notes}</ThemedText>
              )}
            </View>
          ))
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  doctor: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  clinic: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  notes: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});
