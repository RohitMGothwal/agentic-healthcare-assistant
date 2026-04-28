import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { adminApi } from '../api/client';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  dailyActiveUsers: number[];
  chatVolume: number[];
  userGrowth: number[];
  topQueries: { query: string; count: number }[];
  specialistUsage: { specialist: string; count: number }[];
  totalStats: {
    totalUsers: number;
    totalChats: number;
    avgResponseTime: number;
    satisfactionRate: number;
  };
}

export default function AdminAnalyticsScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const result = await adminApi.getAnalytics(timeRange);
      setData(result);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <Text style={[styles.headerTitle, isDark && styles.textLight]}>
          Analytics
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['7d', '30d', '90d'] as const).map((range) => (
            <View
              key={range}
              style={[
                styles.timeRangeTab,
                timeRange === range && styles.timeRangeActive,
              ]}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </Text>
            </View>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            Key Metrics
          </Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Total Users"
              value={data?.totalStats.totalUsers || 0}
              change="+12%"
              icon="people"
              color="#3b82f6"
              isDark={isDark}
            />
            <MetricCard
              title="Total Chats"
              value={data?.totalStats.totalChats || 0}
              change="+24%"
              icon="chatbubbles"
              color="#10b981"
              isDark={isDark}
            />
            <MetricCard
              title="Avg Response"
              value={`${data?.totalStats.avgResponseTime || 0}s`}
              change="-8%"
              icon="time"
              color="#f59e0b"
              isDark={isDark}
            />
            <MetricCard
              title="Satisfaction"
              value={`${data?.totalStats.satisfactionRate || 0}%`}
              change="+5%"
              icon="happy"
              color="#8b5cf6"
              isDark={isDark}
            />
          </View>
        </View>

        {/* Charts Placeholder */}
        <View style={styles.chartContainer}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            User Activity
          </Text>
          <View style={[styles.chartCard, isDark && styles.cardDark]}>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="bar-chart" size={48} color="#cbd5e1" />
              <Text style={styles.chartPlaceholderText}>
                Activity Chart
              </Text>
              <Text style={styles.chartPlaceholderSubtext}>
                Daily active users over time
              </Text>
            </View>
          </View>
        </View>

        {/* Top Queries */}
        <View style={styles.queriesContainer}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            Top Health Queries
          </Text>
          <View style={[styles.queriesCard, isDark && styles.cardDark]}>
            {(data?.topQueries || [
              { query: 'COVID-19 symptoms', count: 245 },
              { query: 'Headache relief', count: 189 },
              { query: 'Fever treatment', count: 156 },
              { query: 'Back pain', count: 134 },
              { query: 'Allergies', count: 112 },
            ]).map((item, index) => (
              <View key={index} style={styles.queryItem}>
                <View style={styles.queryRank}>
                  <Text style={styles.queryRankText}>{index + 1}</Text>
                </View>
                <Text style={[styles.queryText, isDark && styles.textLight]} numberOfLines={1}>
                  {item.query}
                </Text>
                <Text style={styles.queryCount}>{item.count} queries</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Specialist Usage */}
        <View style={styles.specialistContainer}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            Specialist Usage
          </Text>
          <View style={[styles.specialistCard, isDark && styles.cardDark]}>
            {(data?.specialistUsage || [
              { specialist: 'General Physician', count: 523 },
              { specialist: 'Cardiologist', count: 234 },
              { specialist: 'Dermatologist', count: 189 },
              { specialist: 'Pediatrician', count: 156 },
              { specialist: 'Neurologist', count: 98 },
            ]).map((item, index) => {
              const maxCount = 523;
              const percentage = (item.count / maxCount) * 100;
              return (
                <View key={index} style={styles.specialistItem}>
                  <View style={styles.specialistHeader}>
                    <Text style={[styles.specialistName, isDark && styles.textLight]}>
                      {item.specialist}
                    </Text>
                    <Text style={styles.specialistCount}>{item.count}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${percentage}%` },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ title, value, change, icon, color, isDark }: any) {
  const isPositive = change.startsWith('+');
  
  return (
    <View style={[styles.metricCard, isDark && styles.cardDark]}>
      <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.metricValue, isDark && styles.textLight]}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
      <View style={styles.changeContainer}>
        <Ionicons
          name={isPositive ? 'trending-up' : 'trending-down'}
          size={14}
          color={isPositive ? '#10b981' : '#ef4444'}
        />
        <Text
          style={[
            styles.changeText,
            { color: isPositive ? '#10b981' : '#ef4444' },
          ]}
        >
          {change}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0a0f1e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerDark: {
    backgroundColor: '#111827',
    borderBottomColor: '#1f2937',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  timeRangeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
  },
  timeRangeActive: {
    backgroundColor: '#3b82f6',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1f2937',
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
  },
  metricTitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  chartPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 12,
  },
  chartPlaceholderSubtext: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 4,
  },
  queriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  queriesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  queryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  queryRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  queryRankText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  queryText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  queryCount: {
    fontSize: 13,
    color: '#94a3b8',
  },
  specialistContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  specialistCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  specialistItem: {
    marginBottom: 16,
  },
  specialistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  specialistName: {
    fontSize: 15,
    color: '#1e293b',
  },
  specialistCount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3b82f6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  textLight: {
    color: '#f1f5f9',
  },
});
