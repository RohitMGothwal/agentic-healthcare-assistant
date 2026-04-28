import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { adminApi } from '../api/client';

interface SystemConfig {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  aiEnabled: boolean;
  notificationsEnabled: boolean;
  maxChatHistory: number;
  rateLimit: number;
  version: string;
  lastUpdated: string;
}

const SETTINGS_SECTIONS = [
  {
    title: 'System',
    items: [
      { id: 'maintenanceMode', name: 'Maintenance Mode', icon: 'construct', description: 'Disable app access for maintenance' },
      { id: 'allowRegistration', name: 'Allow Registration', icon: 'person-add', description: 'Enable new user signups' },
    ],
  },
  {
    title: 'Features',
    items: [
      { id: 'aiEnabled', name: 'AI Assistant', icon: 'brain', description: 'Enable AI chat responses' },
      { id: 'notificationsEnabled', name: 'Push Notifications', icon: 'notifications', description: 'Send push notifications' },
    ],
  },
  {
    title: 'Limits',
    items: [
      { id: 'maxChatHistory', name: 'Max Chat History', icon: 'chatbox', description: 'Messages to retain per user' },
      { id: 'rateLimit', name: 'Rate Limit', icon: 'speedometer', description: 'Requests per minute' },
    ],
  },
];

export default function AdminSystemScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await adminApi.getSystemConfig();
      setConfig(data);
    } catch (err) {
      console.error('Failed to load config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (key: keyof SystemConfig) => {
    if (!config) return;
    
    const newValue = !config[key];
    setConfig({ ...config, [key]: newValue });
    
    try {
      await adminApi.updateSystemConfig({ [key]: newValue });
    } catch (err) {
      Alert.alert('Error', 'Failed to update setting');
      setConfig(config);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.clearCache();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (err) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleRestartServer = () => {
    Alert.alert(
      'Restart Server',
      'This will restart the backend server. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restart',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.restartServer();
              Alert.alert('Success', 'Server restart initiated');
            } catch (err) {
              Alert.alert('Error', 'Failed to restart server');
            }
          },
        },
      ]
    );
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
          System Settings
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* System Info Card */}
        <View style={[styles.infoCard, isDark && styles.cardDark]}>
          <View style={styles.infoRow}>
            <Ionicons name="server" size={24} color="#3b82f6" />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, isDark && styles.textLight]}>Version</Text>
              <Text style={styles.infoValue}>{config?.version || '1.0.0'}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="time" size={24} color="#10b981" />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, isDark && styles.textLight]}>Last Updated</Text>
              <Text style={styles.infoValue}>
                {config?.lastUpdated ? new Date(config.lastUpdated).toLocaleString() : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {SETTINGS_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
              {section.title}
            </Text>
            
            <View style={[styles.sectionCard, isDark && styles.cardDark]}>
              {section.items.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.settingItem,
                    index < section.items.length - 1 && styles.settingItemBorder,
                  ]}
                >
                  <View style={styles.settingIcon}>
                    <Ionicons name={item.icon as any} size={22} color="#3b82f6" />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={[styles.settingName, isDark && styles.textLight]}>
                      {item.name}
                    </Text>
                    <Text style={styles.settingDesc}>{item.description}</Text>
                  </View>
                  
                  <Switch
                    value={config?.[item.id as keyof SystemConfig] as boolean}
                    onValueChange={() => handleToggle(item.id as keyof SystemConfig)}
                    trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
          
          <View style={[styles.sectionCard, isDark && styles.cardDark]}>
            <TouchableOpacity style={styles.dangerItem} onPress={handleClearCache}>
              <View style={styles.dangerIcon}>
                <Ionicons name="trash" size={22} color="#ef4444" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.dangerName}>Clear Cache</Text>
                <Text style={styles.dangerDesc}>Remove all cached data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ef4444" />
            </TouchableOpacity>
            
            <View style={styles.dangerDivider} />
            
            <TouchableOpacity style={styles.dangerItem} onPress={handleRestartServer}>
              <View style={styles.dangerIcon}>
                <Ionicons name="refresh" size={22} color="#ef4444" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.dangerName}>Restart Server</Text>
                <Text style={styles.dangerDesc}>Restart backend services</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  infoCard: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1f2937',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginHorizontal: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  settingDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  dangerTitle: {
    color: '#ef4444',
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dangerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
  },
  dangerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  dangerDesc: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  textLight: {
    color: '#f1f5f9',
  },
});
