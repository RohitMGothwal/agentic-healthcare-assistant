import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, ActivityIndicator, RefreshControl } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import ThemedText from '../components/ThemedText';
import { healthReportApi } from '../api/client';

const screenWidth = Dimensions.get('window').width - 32;

type HealthMetric = {
  id: number;
  metric_name: string;
  value: number;
  unit: string;
  recorded_at: string;
};

export default function HealthReportScreen() {
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
      <View style={styles.chartCard}>
        <ThemedText style={styles.chartTitle}>{title}</ThemedText>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={180}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => color,
          }}
          bezier
          style={styles.chart}
        />
        <ThemedText style={styles.latestValue}>
          Latest: {data[data.length - 1]?.value} {data[data.length - 1]?.unit}
        </ThemedText>
      </View>
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
        <ThemedText style={styles.title}>Health Report</ThemedText>

        {summary?.latest_metrics && summary.latest_metrics.length > 0 && (
          <View style={styles.summaryCard}>
            <ThemedText style={styles.summaryTitle}>Latest Metrics</ThemedText>
            {summary.latest_metrics.map((metric: any, index: number) => (
              <View key={index} style={styles.metricRow}>
                <ThemedText style={styles.metricName}>{metric.name}</ThemedText>
                <ThemedText style={styles.metricValue}>
                  {metric.value} {metric.unit}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {renderChart(heartRateData, 'Heart Rate', 'rgba(239, 68, 68, 1)')}
        {renderChart(bloodPressureData, 'Blood Pressure', 'rgba(59, 130, 246, 1)')}

        {metrics.length === 0 && (
          <ThemedText style={styles.emptyText}>
            No health metrics recorded yet. Start tracking your health!
          </ThemedText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#0a0f1e',
  backgroundGradientTo: '#0a0f1e',
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
  propsForDots: { r: '6', strokeWidth: '2', stroke: '#3b82f6' },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  content: { padding: 16 },
  title: { fontSize: 28, marginBottom: 16 },
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
  summaryCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  metricName: {
    fontSize: 16,
    color: '#94a3b8',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#111827',
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
    color: '#94a3b8',
  },
});
