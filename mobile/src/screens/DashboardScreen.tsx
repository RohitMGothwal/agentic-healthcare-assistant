import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, ActivityIndicator, RefreshControl, Linking, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '../components/Icon';
import ThemedText from '../components/ThemedText';
import RiskBadge from '../components/RiskBadge';
import SOSButton from '../components/SOSButton';
import { appointmentsApi, healthReportApi } from '../api/client';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';

// Demo data for dashboard with translation keys
const getDemoHealthTips = (t: any) => [
  { id: 1, icon: 'water', title: t('tipHydratedTitle'), description: t('tipHydratedDesc'), color: '#3b82f6' },
  { id: 2, icon: 'walk', title: t('tipWalkTitle'), description: t('tipWalkDesc'), color: '#10b981' },
  { id: 3, icon: 'moon', title: t('tipSleepTitle'), description: t('tipSleepDesc'), color: '#8b5cf6' },
  { id: 4, icon: 'nutrition', title: t('tipNutritionTitle'), description: t('tipNutritionDesc'), color: '#f59e0b' },
];

const getDemoUpcomingAppointment = (t: any) => ({
  id: 1,
  doctor_name: t('demoDoctor1'),
  clinic_name: t('demoClinic1'),
  appointment_date: new Date(Date.now() + 86400000 * 2).toISOString(),
  type: t('demoApptType'),
});

const getDemoMetrics = (t: any) => [
  { name: t('metricBloodPressure'), value: '120/80', unit: 'mmHg', status: 'normal', icon: 'heart' },
  { name: t('metricHeartRate'), value: '72', unit: 'bpm', status: 'normal', icon: 'pulse' },
  { name: t('metricBloodGlucose'), value: '95', unit: 'mg/dL', status: 'normal', icon: 'water' },
];

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState(0);
  const [latestMetrics, setLatestMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');

  // Get translated demo data
  const DEMO_HEALTH_TIPS = getDemoHealthTips(t);
  const DEMO_UPCOMING_APPOINTMENT = getDemoUpcomingAppointment(t);
  const DEMO_METRICS = getDemoMetrics(t);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('goodMorning'));
    else if (hour < 18) setGreeting(t('goodAfternoon'));
    else setGreeting(t('goodEvening'));
  }, [t]);

  const loadDashboardData = useCallback(async () => {
    try {
      const [appointments, healthSummary] = await Promise.all([
        appointmentsApi.getAll(),
        healthReportApi.getSummary(),
      ]);
      
      const now = new Date();
      const upcoming = appointments.filter((a: any) => new Date(a.appointment_date) > now);
      setUpcomingAppointments(upcoming.length);
      
      // Use demo metrics if none from API
      const metrics = healthSummary.latest_metrics || [];
      setLatestMetrics(metrics.length > 0 ? metrics : DEMO_METRICS);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setLatestMetrics(DEMO_METRICS);
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
      t('sos'),
      t('callEmergencyConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('callEmergency'),
          style: 'destructive',
          onPress: () => Linking.openURL('tel:911'),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header with Greeting */}
        <View style={styles.header}>
          <View>
            <ThemedText style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</ThemedText>
            <ThemedText style={[styles.userName, { color: colors.text }]}>{user?.username || t('guest')} 👋</ThemedText>
          </View>
          <TouchableOpacity style={[styles.profileButton, { backgroundColor: colors.card }]}>
            <Ionicons name="person" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Health Status Card */}
        <View style={[styles.healthCard, { backgroundColor: colors.primary }]}>
          <View style={styles.healthCardContent}>
            <View style={styles.healthIconContainer}>
              <Ionicons name="shield-checkmark" size={32} color="#fff" />
            </View>
            <View style={styles.healthTextContainer}>
              <ThemedText style={styles.healthTitle}>{t('healthStatus')}</ThemedText>
              <ThemedText style={styles.healthSubtitle}>{t('allVitalsNormal')}</ThemedText>
            </View>
          </View>
          <View style={styles.healthStatsRow}>
            <View style={styles.healthStat}>
              <ThemedText style={styles.healthStatValue}>98%</ThemedText>
              <ThemedText style={styles.healthStatLabel}>{t('wellness')}</ThemedText>
            </View>
            <View style={styles.healthStat}>
              <ThemedText style={styles.healthStatValue}>{upcomingAppointments}</ThemedText>
              <ThemedText style={styles.healthStatLabel}>{t('appointments')}</ThemedText>
            </View>
            <View style={styles.healthStat}>
              <ThemedText style={styles.healthStatValue}>{latestMetrics.length}</ThemedText>
              <ThemedText style={styles.healthStatLabel}>{t('metrics')}</ThemedText>
            </View>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{t('quickActions')}</ThemedText>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickActionItem, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('Chat' as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="chatbubbles" size={24} color={colors.primary} />
              </View>
              <ThemedText style={[styles.quickActionText, { color: colors.text }]}>{t('aiChat')}</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionItem, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('Appointments' as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#10b981' + '20' }]}>
                <Ionicons name="calendar" size={24} color="#10b981" />
              </View>
              <ThemedText style={[styles.quickActionText, { color: colors.text }]}>{t('bookAppt')}</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionItem, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('HealthReport' as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#8b5cf6' + '20' }]}>
                <Ionicons name="document-text" size={24} color="#8b5cf6" />
              </View>
              <ThemedText style={[styles.quickActionText, { color: colors.text }]}>{t('reports')}</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionItem, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('Settings' as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#f59e0b' + '20' }]}>
                <Ionicons name="settings" size={24} color="#f59e0b" />
              </View>
              <ThemedText style={[styles.quickActionText, { color: colors.text }]}>{t('settings')}</ThemedText>
            </TouchableOpacity>

            {/* Coming Soon - Future Features */}
            <TouchableOpacity 
              style={[styles.quickActionItem, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('ComingSoon' as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#8b5cf6' + '20' }]}>
                <Ionicons name="rocket" size={24} color="#8b5cf6" />
              </View>
              <ThemedText style={[styles.quickActionText, { color: colors.text }]}>Coming Soon</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Appointment Card */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{t('upcomingAppointment')}</ThemedText>
            <TouchableOpacity onPress={() => navigation.navigate('Appointments' as never)}>
              <ThemedText style={[styles.seeAll, { color: colors.primary }]}>{t('seeAll')}</ThemedText>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={[styles.appointmentCard, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('Appointments' as never)}
          >
            <View style={styles.appointmentDateBadge}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <ThemedText style={[styles.appointmentDate, { color: colors.text }]}>
                {formatDate(DEMO_UPCOMING_APPOINTMENT.appointment_date)}
              </ThemedText>
            </View>
            <View style={styles.appointmentInfo}>
              <ThemedText style={[styles.appointmentDoctor, { color: colors.text }]}>
                {DEMO_UPCOMING_APPOINTMENT.doctor_name}
              </ThemedText>
              <ThemedText style={[styles.appointmentClinic, { color: colors.textSecondary }]}>
                {DEMO_UPCOMING_APPOINTMENT.clinic_name}
              </ThemedText>
              <View style={styles.appointmentTypeBadge}>
                <ThemedText style={styles.appointmentTypeText}>
                  {DEMO_UPCOMING_APPOINTMENT.type}
                </ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Health Metrics Preview */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{t('healthMetrics')}</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll}>
            {latestMetrics.slice(0, 3).map((metric: any, index: number) => (
              <View key={index} style={[styles.metricCard, { backgroundColor: colors.card }]}>
                <View style={styles.metricHeader}>
                  <Ionicons name={metric.icon || 'fitness'} size={20} color={colors.primary} />
                  <View style={[styles.metricStatus, { backgroundColor: metric.status === 'normal' ? '#10b981' : '#ef4444' }]}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                </View>
                <ThemedText style={[styles.metricValue, { color: colors.text }]}>
                  {metric.value}
                </ThemedText>
                <ThemedText style={[styles.metricUnit, { color: colors.textSecondary }]}>
                  {metric.unit}
                </ThemedText>
                <ThemedText style={[styles.metricName, { color: colors.textSecondary }]}>
                  {metric.name}
                </ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Health Tips Section */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{t('dailyHealthTips')}</ThemedText>
          {DEMO_HEALTH_TIPS.slice(0, 2).map((tip) => (
            <View key={tip.id} style={[styles.tipCard, { backgroundColor: colors.card }]}>
              <View style={[styles.tipIcon, { backgroundColor: tip.color + '20' }]}>
                <Ionicons name={tip.icon as any} size={24} color={tip.color} />
              </View>
              <View style={styles.tipContent}>
                <ThemedText style={[styles.tipTitle, { color: colors.text }]}>{tip.title}</ThemedText>
                <ThemedText style={[styles.tipDescription, { color: colors.textSecondary }]}>
                  {tip.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        <SOSButton onPress={handleSOS} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Health Card
  healthCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  healthCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  healthTextContainer: {
    flex: 1,
  },
  healthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  healthSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  healthStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  healthStat: {
    alignItems: 'center',
  },
  healthStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  healthStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionItem: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Appointment Card
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
  },
  appointmentDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  appointmentClinic: {
    fontSize: 13,
    marginBottom: 6,
  },
  appointmentTypeBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  appointmentTypeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  // Metrics
  metricsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  metricCard: {
    width: 120,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricStatus: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricUnit: {
    fontSize: 12,
    marginTop: 2,
  },
  metricName: {
    fontSize: 12,
    marginTop: 8,
  },
  // Tips
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  // Old styles (keeping for compatibility)
  title: { fontSize: 28, marginBottom: 16, fontWeight: 'bold' },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
