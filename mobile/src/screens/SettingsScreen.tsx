import { SafeAreaView, StyleSheet, Switch, View, Button, Alert } from 'react-native';
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

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText style={styles.title}>Settings</ThemedText>
      
      {user && (
        <View style={styles.userCard}>
          <ThemedText style={styles.userLabel}>Logged in as</ThemedText>
          <ThemedText style={styles.username}>{user.username}</ThemedText>
        </View>
      )}

      <View style={styles.row}>
        <ThemedText>Dark mode</ThemedText>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>

      <View style={styles.logoutButton}>
        <Button title="Logout" onPress={handleLogout} color="#ef4444" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e', padding: 16 },
  title: { fontSize: 28, marginBottom: 24 },
  userCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  userLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#111827',
    borderRadius: 16,
    marginBottom: 16,
  },
  logoutButton: {
    marginTop: 8,
  },
});
