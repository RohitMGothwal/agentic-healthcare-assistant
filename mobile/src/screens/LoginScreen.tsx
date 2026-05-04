import { Button, SafeAreaView, StyleSheet, TextInput, View, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '../components/Icon';
import ThemedText from '../components/ThemedText';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

export default function LoginScreen() {
  const { login, isLoading, error, setError } = useAuth();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{username?: string; password?: string}>({});

  const validateForm = useCallback(() => {
    const errors: {username?: string; password?: string} = {};
    
    if (!username.trim()) {
      errors.username = t('requiredField');
    }
    
    if (!password.trim()) {
      errors.password = t('requiredField');
    } else if (password.length < 4) {
      errors.password = t('passwordTooShort');
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [username, password, t]);

  const handleLogin = async () => {
    setError(null);
    
    if (!validateForm()) return;
    
    try {
      await login(username.trim(), password.trim());
      navigation.reset({ index: 0, routes: [{ name: 'Main' as never }] });
    } catch (err) {
      // Error is handled in useAuth and displayed via error state
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setUsername('admin');
    setPassword('admin123');
    
    try {
      await login('admin', 'admin123');
      navigation.reset({ index: 0, routes: [{ name: 'Main' as never }] });
    } catch (err) {
      // If login fails, show helpful message
      setError('Unable to login with demo credentials. Please try registering a new account.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <ThemedText style={[styles.title, { color: colors.text }]}>{t('welcomeBack')}</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to continue
            </ThemedText>
          </View>

          {/* Error Message */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <ThemedText style={[styles.errorText, { color: colors.error }]}>{error}</ThemedText>
            </View>
          )}

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { 
              backgroundColor: colors.card, 
              borderColor: fieldErrors.username ? colors.error : colors.border 
            }]}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t('username')}
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (fieldErrors.username) setFieldErrors(prev => ({ ...prev, username: undefined }));
                }}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {fieldErrors.username && (
              <ThemedText style={[styles.fieldError, { color: colors.error }]}>{fieldErrors.username}</ThemedText>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { 
              backgroundColor: colors.card, 
              borderColor: fieldErrors.password ? colors.error : colors.border 
            }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t('password')}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                }}
                editable={!isLoading}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            {fieldErrors.password && (
              <ThemedText style={[styles.fieldError, { color: colors.error }]}>{fieldErrors.password}</ThemedText>
            )}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.loginButtonText}>{t('login')}</ThemedText>
            )}
          </TouchableOpacity>

          {/* Quick Login Buttons */}
          <View style={styles.quickLoginContainer}>
            <TouchableOpacity
              style={[styles.quickLoginButton, { borderColor: colors.primary }]}
              onPress={handleDemoLogin}
              disabled={isLoading}
            >
              <Ionicons name="play-circle-outline" size={16} color={colors.primary} />
              <ThemedText style={[styles.quickLoginBtnText, { color: colors.primary }]}>
                Login Demo Account
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
              {t('newHere')}{' '}
            </ThemedText>
            <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
              <ThemedText style={[styles.registerLink, { color: colors.primary }]}>
                {t('createAccount')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  fieldError: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
    marginTop: 12,
  },
  demoIcon: {
    marginRight: 8,
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickLoginContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  quickLoginText: {
    fontSize: 13,
    marginBottom: 10,
  },
  quickLoginButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  quickLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  quickLoginBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
