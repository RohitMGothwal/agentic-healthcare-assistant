import { Button, SafeAreaView, StyleSheet, TextInput, View, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '../components/Icon';
import ThemedText from '../components/ThemedText';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

export default function RegisterScreen() {
  const { register, isLoading, error, setError } = useAuth();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{username?: string; email?: string; password?: string}>({});

  const validateForm = useCallback(() => {
    const errors: {username?: string; email?: string; password?: string} = {};
    
    if (!username.trim()) {
      errors.username = t('requiredField');
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = t('invalidEmail');
    }
    
    if (!password.trim()) {
      errors.password = t('requiredField');
    } else if (password.length < 6) {
      errors.password = t('passwordTooShort');
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [username, email, password, t]);

  const handleRegister = async () => {
    setError(null);
    
    if (!validateForm()) return;
    
    try {
      await register(username.trim(), password.trim(), email.trim() || undefined);
      navigation.reset({ index: 0, routes: [{ name: 'Main' as never }] });
    } catch (err) {
      // Error is handled in useAuth
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
            <ThemedText style={[styles.title, { color: colors.text }]}>{t('createAccount')}</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign up to get started
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

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { 
              backgroundColor: colors.card, 
              borderColor: fieldErrors.email ? colors.error : colors.border 
            }]}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={`${t('email')} (${t('optional')})`}
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            {fieldErrors.email && (
              <ThemedText style={[styles.fieldError, { color: colors.error }]}>{fieldErrors.email}</ThemedText>
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

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.registerButtonText}>{t('register')}</ThemedText>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
              {t('alreadyHaveAccount')}{' '}
            </ThemedText>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <ThemedText style={[styles.loginLink, { color: colors.primary }]}>
                {t('login')}
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
  registerButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
