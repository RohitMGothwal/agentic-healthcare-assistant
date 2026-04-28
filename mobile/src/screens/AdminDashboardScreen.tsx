import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { adminApi } from '../api/client';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalChats: number;
  todayChats: number;
  totalAppointments: number;
  pendingAppointments: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  serverUptime: number;
}

const ADMIN_MENU_ITEMS = [
  { id: 'users', name: 'User Management', icon: 'people', color: '#3b82f6', description: 'Manage users & permissions' },
  { id: 'analytics', name: 'Analytics', icon: 'bar-chart', color: '#10b981', description: 'View system metrics' },
  { id: 'appointments', name: 'Appointments', icon: 'calendar', color: '#f59e0b', description: 'Manage all appointments' },
  { id: 'content', name: 'Content', icon: 'document-text', color: '#8b5cf6', description: 'Health content management' },
  { id: 'system', name: 'System', icon: 'settings', color: '#ef4444', description: 'System configuration' },
  { id: 'logs', name: 'Logs', icon: 'list', color: '#6b7280', description: 'System logs & errors' },
];

export default function AdminDashboardScreen({ navigation }: any) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const handleMenuPress = (id: string) => {
    switch (id) {
      case 'users':
        navigation.navigate('AdminUsers');
        break;
      case 'analytics':
        navigation.navigate('AdminAnalytics');
        break;
      case 'appointments':
        navigation.navigate('AdminAppointments');
        break;
      case 'content':
        navigation.navigate('AdminContent');
        break;
      case 'system':
        navigation.navigate('AdminSystem');
        break;
      case 'logs':
        navigation.navigate('AdminLogs');
        break;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={[styles.loadingText, isDark && styles.textLight]}>
            Loading admin dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={styles.headerLeft}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={24} color="#fff" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, isDark && styles.textLight]}>
              Admin Dashboard
            </Text>
            <Text style={styles.headerSubtitle}>Super Administrator</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            System Overview
          </Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon="people"
              color="#3b82f6"
              isDark={isDark}
            />
            <StatCard
              title="Active Now"
              value={stats?.activeUsers || 0}
              icon="radio"
              color="#10b981"
              isDark={isDark}
            />
            <StatCard
              title="Total Chats"
              value={stats?.totalChats || 0}
              icon="chatbubbles"
              color="#8b5cf6"
              isDark={isDark}
            />
            <StatCard
              title="Today's Chats"
              value={stats?.todayChats || 0}
              icon="chatbubble"
              color="#f59e0b"
              isDark={isDark}
            />
            <StatCard
              title="Appointments"
              value={stats?.totalAppointments || 0}
              icon="calendar"
              color="#ec4899"
              isDark={isDark}
            />
            <StatCard
              title="Pending"
              value={stats?.pendingAppointments || 0}
              icon="time"
              color="#ef4444"
              isDark={isDark}
            />
          </View>
        </View>

        {/* System Health */}
        <View style={[styles.healthCard, isDark && styles.cardDark]}>
          <View style={styles.healthHeader}>
            <Ionicons name="pulse" size={24} color="#10b981" />
            <Text style={[styles.healthTitle, isDark && styles.textLight]}>
              System Health
            </Text>
          </View>
          <View style={styles.healthStatus}>
            <View style={[styles.statusBadge, { backgroundColor: getHealthColor(stats?.systemHealth) }]}>
              <Text style={styles.statusText}>
                {(stats?.systemHealth || 'healthy').toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.uptimeText, isDark && styles.textMuted]}>
              Uptime: {formatUptime(stats?.serverUptime || 0)}
            </Text>
          </View>
        </View>

        {/* Admin Menu */}
        <View style={styles.menuContainer}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            Administration
          </Text>
          <View style={styles.menuGrid}>
            {ADMIN_MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuCard, isDark && styles.cardDark]}
                onPress={() => handleMenuPress(item.id)}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={28} color={item.color} />
                </View>
                <Text style={[styles.menuName, isDark && styles.textLight]}>
                  {item.name}
                </Text>
                <Text style={styles.menuDesc}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            Quick Actions
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Add User</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.secondaryAction, isDark && styles.secondaryActionDark]}>
              <Ionicons name="download" size={20} color="#3b82f6" />
              <Text style={[styles.secondaryActionText, isDark && styles.textLight]}>Export Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.secondaryAction, isDark && styles.secondaryActionDark]}>
              <Ionicons name="notifications" size={20} color="#f59e0b" />
              <Text style={[styles.secondaryActionText, isDark && styles.textLight]}>Broadcast</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ title, value, icon, color, isDark }: any) {
  return (
    <View style={[styles.statCard, isDark && styles.cardDark]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, isDark && styles.textLight]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

function getHealthColor(health?: string) {
  switch (health) {
    case 'healthy': return '#10b981';
    case 'warning': return '#f59e0b';
    case 'critical': return '#ef4444';
    default: return '#10b981';
  }
}

function formatUptime(hours: number) {
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);
  if (days > 0) {
    return `${days}d ${remainingHours}h`;
  }
  return `${remainingHours}h`;
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1f2937',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  statTitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  healthCard: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  uptimeText: {
    fontSize: 14,
    color: '#64748b',
  },
  menuContainer: {
    padding: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  menuDesc: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  primaryAction: {
    backgroundColor: '#3b82f6',
  },
  secondaryAction: {
    backgroundColor: '#f1f5f9',
  },
  secondaryActionDark: {
    backgroundColor: '#374151',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryActionText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  textLight: {
    color: '#f1f5f9',
  },
  textMuted: {
    color: '#94a3b8',
  },
});
