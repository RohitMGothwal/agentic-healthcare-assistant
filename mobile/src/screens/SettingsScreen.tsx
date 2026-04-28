import { SafeAreaView, StyleSheet, Switch, View, Button, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '../components/ThemedText';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigation = useNavigation();
  const isDarkMode = theme === 'dark';

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
          },
        },
      ]
    );
  };

  const handleAdminAccess = () => {
    navigation.navigate('AdminDashboard' as never);
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <ScrollView>
        <ThemedText style={styles.title}>Settings</ThemedText>
        
        {user && (
          <View style={[styles.userCard, isDarkMode && styles.cardDark]}>
            <ThemedText style={styles.userLabel}>Logged in as</ThemedText>
            <ThemedText style={styles.username}>{user.username}</ThemedText>
            {user.is_admin && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#fff" />
                <Text style={styles.adminText}>Administrator</Text>
              </View>
            )}
          </View>
        )}

        {/* Admin Access Button */}
        <TouchableOpacity 
          style={[styles.adminButton, isDarkMode && styles.cardDark]}
          onPress={handleAdminAccess}
        >
          <View style={styles.adminButtonContent}>
            <View style={styles.adminIconContainer}>
              <Ionicons name="shield" size={24} color="#3b82f6" />
            </View>
            <View style={styles.adminButtonText}>
              <ThemedText style={styles.adminButtonTitle}>Admin Dashboard</ThemedText>
              <ThemedText style={styles.adminButtonSubtitle}>
                Manage users, analytics, and system
              </ThemedText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
        </TouchableOpacity>

        <View style={[styles.row, isDarkMode && styles.cardDark]}>
          <ThemedText>Dark mode</ThemedText>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>

        <View style={styles.logoutButton}>
          <Button title="Logout" onPress={handleLogout} color="#ef4444" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc', 
    padding: 16 
  },
  containerDark: { 
    backgroundColor: '#0a0f1e' 
  },
  title: { 
    fontSize: 28, 
    marginBottom: 24,
    fontWeight: '700',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#111827',
  },
  userLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  adminText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  adminButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adminIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  adminButtonText: {
    flex: 1,
  },
  adminButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  adminButtonSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButton: {
    marginTop: 8,
  },
});
