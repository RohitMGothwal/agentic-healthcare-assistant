import { Button, SafeAreaView, StyleSheet, TextInput, View, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import ThemedText from '../components/ThemedText';
import { useAuth } from '../hooks/useAuth';

export default function RegisterScreen() {
  const { register, isLoading, error } = useAuth();
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) return;
    try {
      await register(username.trim(), password.trim(), email.trim() || undefined);
      navigation.reset({ index: 0, routes: [{ name: 'Main' as never }] });
    } catch (err) {
      // Error is handled in useAuth
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText style={styles.title}>Create Account</ThemedText>
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#94a3b8"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email (optional)"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#94a3b8"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {isLoading ? (
        <ActivityIndicator color="#3b82f6" />
      ) : (
        <Button title="Register" onPress={handleRegister} />
      )}
      <View style={styles.linkContainer}>
        <Button title="Back to Login" onPress={() => navigation.navigate('Login' as never)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0a0f1e',
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#111827',
    color: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  linkContainer: {
    marginTop: 16,
  },
  error: {
    color: '#ef4444',
    marginBottom: 12,
  },
});
