import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, ActivityIndicator, RefreshControl, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import ThemedText from '../components/ThemedText';
import { healthReportApi } from '../api/client';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

const screenWidth = Dimensions.get('window').width - 32;

type HealthMetric = {
  id: number;
  metric_name: string;
  value: number;
  unit: string;
  recorded_at: string;
};

export default function HealthReportScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadHealthData = useCallback(async () => {
    try {
      const [reportData, summaryData] = await Promise.all([
        healthReportApi.getReport(),
        healthReportApi.getSummary(),
      ]);
      setMetrics(reportData.metrics || []);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load health data:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadHealthData();
      setIsLoading(false);
    };
    init();
  }, [loadHealthData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadHealthData();
    setIsRefreshing(false);
  }, [loadHealthData]);

  // Group metrics by name for charts
  const getMetricsByName = (name: string) => {
    return metrics
      .filter(m => m.metric_name === name)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .slice(-7); // Last 7 entries
  };

  const heartRateData = getMetricsByName('heart_rate');
  const bloodPressureData = getMetricsByName('blood_pressure');

  const renderChart = (data: HealthMetric[], title: string, color: string) => {
    if (data.length === 0) return null;

    const chartData = {
      labels: data.map((_, i) => `${i + 1}`),
      datasets: [{ data: data.map(m => m.value) }],
    };

    return (
      <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
        <ThemedText style={styles.chartTitle}>{title}</ThemedText>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={180}
          chartConfig={{
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            color: (opacity = 1) => color,
            labelColor: (opacity = 1) => colors.textSecondary,
            propsForDots: { r: '6', strokeWidth: '2', stroke: colors.primary },
          }}
          bezier
          style={styles.chart}
        />
        <ThemedText style={[styles.latestValue, { color: colors.textSecondary }]}>
          {t('latest')}: {data[data.length - 1]?.value} {data[data.length - 1]?.unit}
        </ThemedText>
      </View>
    );
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
        <ThemedText style={[styles.title, { color: colors.text }]}>
          <Text style={{ fontWeight: '700' }}>{t('healthReportTitle')}</Text>
        </ThemedText>

        {/* Health Overview Card */}
        <View style={[styles.overviewCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.overviewTitle, { color: colors.text }]}>📊 {t('healthOverview')}</ThemedText>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <ThemedText style={[styles.overviewValue, { color: colors.primary }]}>{metrics.length}</ThemedText>
              <ThemedText style={[styles.overviewLabel, { color: colors.textSecondary }]}>{t('totalRecords')}</ThemedText>
            </View>
            
            <View style={styles.overviewItem}>
              <ThemedText style={[styles.overviewValue, { color: colors.success || '#22c55e' }]}>{summary?.latest_metrics?.length || 0}</ThemedText>
              <ThemedText style={[styles.overviewLabel, { color: colors.textSecondary }]}>{t('activeMetrics')}</ThemedText>
            </View>
            <View style={styles.overviewItem}>
              <ThemedText style={[styles.overviewValue, { color: colors.warning || '#f59e0b' }]}>{t('statusGood')}</ThemedText>
              <ThemedText style={[styles.overviewLabel, { color: colors.textSecondary }]}>{t('status')}</ThemedText>
            </View>
          </View>
        </View>

        {/* BMI Calculator Section */}
        <View style={[styles.bmiCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.bmiTitle, { color: colors.text }]}>⚖️ {t('bmiCalculator')}</ThemedText>
          <View style={styles.bmiInputRow}>
            <View style={styles.bmiInput}>
              <ThemedText style={[styles.bmiLabel, { color: colors.textSecondary }]}>{t('heightCm')}</ThemedText>
              <ThemedText style={[styles.bmiValue, { color: colors.text }]}>170</ThemedText>
            </View>
            <View style={styles.bmiInput}>
              <ThemedText style={[styles.bmiLabel, { color: colors.textSecondary }]}>{t('weightKg')}</ThemedText>
              <ThemedText style={[styles.bmiValue, { color: colors.text }]}>70</ThemedText>
            </View>
            <View style={[styles.bmiResult, { backgroundColor: colors.primary + '20' }]}>
              <ThemedText style={[styles.bmiResultValue, { color: colors.primary }]}>24.2</ThemedText>
              <ThemedText style={[styles.bmiResultLabel, { color: colors.textSecondary }]}>{t('bmiNormal')}</ThemedText>
            </View>
          </View>
        </View>

        {/* Latest Metrics */}
        {summary?.latest_metrics && summary.latest_metrics.length > 0 && (
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.summaryTitle, { color: colors.text }]}>🩺 {t('latestMetrics')}</ThemedText>
            {summary.latest_metrics.map((metric: any, index: number) => (
              <View key={index} style={[styles.metricRow, { borderBottomColor: colors.border }]}>
                <ThemedText style={[styles.metricName, { color: colors.textSecondary }]}>{metric.name}</ThemedText>
                <ThemedText style={[styles.metricValue, { color: colors.text }]}>
                  {metric.value} {metric.unit}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* Health Trends Charts */}
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>📈 {t('healthTrends')}</ThemedText>
        {renderChart(heartRateData, t('heartRateBPM'), colors.error || 'rgba(239, 68, 68, 1)')}
        {renderChart(bloodPressureData, t('bloodPressureMmHg'), colors.primary)}

        {/* Health Recommendations */}
        <View style={[styles.recommendationsCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.recommendationsTitle, { color: colors.text }]}>💊 {t('healthRecommendations')}</ThemedText>
          <View style={styles.recommendationItem}>
            <ThemedText style={[styles.recommendationIcon, { color: colors.success || '#22c55e' }]}>✓</ThemedText>
            <ThemedText style={[styles.recommendationText, { color: colors.text }]}>{t('recHydration')}</ThemedText>
          </View>
          <View style={styles.recommendationItem}>
            <ThemedText style={[styles.recommendationIcon, { color: colors.success || '#22c55e' }]}>✓</ThemedText>
            <ThemedText style={[styles.recommendationText, { color: colors.text }]}>{t('recExercise')}</ThemedText>
          </View>
          <View style={styles.recommendationItem}>
            <ThemedText style={[styles.recommendationIcon, { color: colors.warning || '#f59e0b' }]}>!</ThemedText>
            <ThemedText style={[styles.recommendationText, { color: colors.text }]}>{t('recBPMonitor')}</ThemedText>
          </View>
          <View style={styles.recommendationItem}>
            <ThemedText style={[styles.recommendationIcon, { color: colors.success || '#22c55e' }]}>✓</ThemedText>
            <ThemedText style={[styles.recommendationText, { color: colors.text }]}>{t('recSleep')}</ThemedText>
          </View>
        </View>

        {/* Upcoming Checkups */}
        <View style={[styles.checkupsCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.checkupsTitle, { color: colors.text }]}>📅 {t('upcomingCheckups')}</ThemedText>
          <View style={styles.checkupItem}>
            <View style={[styles.checkupDate, { backgroundColor: colors.primary + '20' }]}>
              <ThemedText style={[styles.checkupDay, { color: colors.primary }]}>15</ThemedText>
              <ThemedText style={[styles.checkupMonth, { color: colors.primary }]}>MAY</ThemedText>
            </View>
            <View style={styles.checkupInfo}>
              <ThemedText style={[styles.checkupType, { color: colors.text }]}>General Health Checkup</ThemedText>
              <ThemedText style={[styles.checkupDoctor, { color: colors.textSecondary }]}>Dr. Sharma - General Physician</ThemedText>
            </View>
          </View>
          <View style={styles.checkupItem}>
            <View style={[styles.checkupDate, { backgroundColor: colors.warning + '20' || 'rgba(245, 158, 11, 0.2)' }]}>
              <ThemedText style={[styles.checkupDay, { color: colors.warning || '#f59e0b' }]}>22</ThemedText>
              <ThemedText style={[styles.checkupMonth, { color: colors.warning || '#f59e0b' }]}>MAY</ThemedText>
            </View>
            <View style={styles.checkupInfo}>
              <ThemedText style={[styles.checkupType, { color: colors.text }]}>Blood Test</ThemedText>
              <ThemedText style={[styles.checkupDoctor, { color: colors.textSecondary }]}>City Diagnostic Center</ThemedText>
            </View>
          </View>
        </View>

        {/* Health Goals */}
        <View style={[styles.goalsCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.goalsTitle, { color: colors.text }]}>🎯 Health Goals</ThemedText>
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <ThemedText style={[styles.goalName, { color: colors.text }]}>Daily Steps</ThemedText>
              <ThemedText style={[styles.goalProgress, { color: colors.primary }]}>8,432 / 10,000</ThemedText>
            </View>
            <View style={[styles.goalBar, { backgroundColor: colors.border }]}>
              <View style={[styles.goalFill, { width: '84%', backgroundColor: colors.primary }]} />
            </View>
          </View>
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <ThemedText style={[styles.goalName, { color: colors.text }]}>Water Intake</ThemedText>
              <ThemedText style={[styles.goalProgress, { color: colors.primary }]}>5 / 8 glasses</ThemedText>
            </View>
            <View style={[styles.goalBar, { backgroundColor: colors.border }]}>
              <View style={[styles.goalFill, { width: '62%', backgroundColor: colors.primary }]} />
            </View>
          </View>
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <ThemedText style={[styles.goalName, { color: colors.text }]}>Sleep Hours</ThemedText>
              <ThemedText style={[styles.goalProgress, { color: colors.primary }]}>7 / 8 hours</ThemedText>
            </View>
            <View style={[styles.goalBar, { backgroundColor: colors.border }]}>
              <View style={[styles.goalFill, { width: '87%', backgroundColor: colors.primary }]} />
            </View>
          </View>
        </View>

        {metrics.length === 0 && (
          <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
            No health metrics recorded yet. Start tracking your health!
          </ThemedText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  title: { fontSize: 28, marginBottom: 16, fontWeight: '700' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
  },
  // Overview Card Styles
  overviewCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  overviewLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  // BMI Card Styles
  bmiCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  bmiTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  bmiInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bmiInput: {
    flex: 1,
    alignItems: 'center',
  },
  bmiLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  bmiValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  bmiResult: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
  },
  bmiResultValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  bmiResultLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  // Section Title
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  // Summary Card Styles
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  metricName: {
    fontSize: 16,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Chart Styles
  chartCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chart: { borderRadius: 16 },
  latestValue: {
    textAlign: 'center',
    marginTop: 8,
  },
  // Recommendations Styles
  recommendationsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationIcon: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
    width: 24,
  },
  recommendationText: {
    fontSize: 15,
    flex: 1,
  },
  // Checkups Styles
  checkupsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  checkupsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  checkupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkupDate: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkupDay: {
    fontSize: 24,
    fontWeight: '700',
  },
  checkupMonth: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkupInfo: {
    flex: 1,
  },
  checkupType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  checkupDoctor: {
    fontSize: 14,
  },
  // Goals Styles
  goalsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  goalItem: {
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalName: {
    fontSize: 15,
    fontWeight: '600',
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '600',
  },
  goalBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    borderRadius: 4,
  },
});
