import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, ActivityIndicator, RefreshControl, Linking, Alert } from 'react-native';
import ThemedText from '../components/ThemedText';
import RiskBadge from '../components/RiskBadge';
import SOSButton from '../components/SOSButton';
import { appointmentsApi, healthReportApi } from '../api/client';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [upcomingAppointments, setUpcomingAppointments] = useState(0);
  const [latestMetrics, setLatestMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [appointments, healthSummary] = await Promise.all([
        appointmentsApi.getAll(),
        healthReportApi.getSummary(),
      ]);
      
      // Count upcoming appointments
      const now = new Date();
      const upcoming = appointments.filter((a: any) => new Date(a.appointment_date) > now);
      setUpcomingAppointments(upcoming.length);
      
      setLatestMetrics(healthSummary.latest_metrics || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadDashboardData();
      setIsLoading(false);
    };
    init();
  }, [loadDashboardData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  }, [loadDashboardData]);

  const handleSOS = () => {
    Alert.alert(
      'Emergency SOS',
      'This will call emergency services. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Emergency',
          style: 'destructive',
          onPress: () => {
            Linking.openURL('tel:911');
          },
        },
      ]
    );
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
        <ThemedText style={styles.title}>Dashboard</ThemedText>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <ThemedText style={styles.statNumber}>{upcomingAppointments}</ThemedText>
            <ThemedText style={styles.statLabel}>Upcoming Appointments</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={styles.statNumber}>{latestMetrics.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Health Metrics</ThemedText>
          </View>
        </View>

        <RiskBadge label="Low risk" />
        
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Quick Actions</ThemedText>
          <View style={styles.quickActions}>
            <View style={styles.actionButton}>
              <ThemedText 
                style={styles.actionText}
                onPress={() => navigation.navigate('Chat' as never)}
              >
                💬 Chat with Assistant
              </ThemedText>
            </View>
            <View style={styles.actionButton}>
              <ThemedText 
                style={styles.actionText}
                onPress={() => navigation.navigate('Appointments' as never)}
              >
                📅 View Appointments
              </ThemedText>
            </View>
            <View style={styles.actionButton}>
              <ThemedText 
                style={styles.actionText}
                onPress={() => navigation.navigate('HealthReport' as never)}
              >
                📊 Health Report
              </ThemedText>
            </View>
          </View>
        </View>

        {latestMetrics.length > 0 && (
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>Latest Health Metrics</ThemedText>
            {latestMetrics.slice(0, 3).map((metric: any, index: number) => (
              <View key={index} style={styles.metricRow}>
                <ThemedText style={styles.metricName}>{metric.name}</ThemedText>
                <ThemedText style={styles.metricValue}>
                  {metric.value} {metric.unit}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        <SOSButton onPress={handleSOS} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  content: { padding: 20 },
  title: { fontSize: 28, marginBottom: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActions: {
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  metricName: {
    fontSize: 14,
    color: '#94a3b8',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
