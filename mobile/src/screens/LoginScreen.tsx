import { Button, SafeAreaView, StyleSheet, TextInput, View } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import ThemedText from '../components/ThemedText';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!username.trim()) return;
    login(username.trim());
    navigation.reset({ index: 0, routes: [{ name: 'Main' as never }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText style={styles.title}>Welcome back</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#94a3b8"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#94a3b8"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      <View style={styles.linkContainer}>
        <Button title="Create Account" onPress={() => navigation.navigate('Register' as never)} />
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
});
