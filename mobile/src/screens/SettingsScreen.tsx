import { SafeAreaView, StyleSheet, Switch, View, Button, Alert, TouchableOpacity, ScrollView, Text } from 'react-native';
import { Ionicons } from '../components/Icon';
import ThemedText from '../components/ThemedText';
import { useTheme } from '../hooks/useTheme';
import { useLanguage, Language } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { logout, user } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
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

  const languages = [
    { code: 'en', nativeName: 'English', englishName: 'English' },
    { code: 'hi', nativeName: 'हिंदी', englishName: 'Hindi' },
    { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali' },
    { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi' },
    { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu' },
    { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil' },
    { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati' },
    { code: 'ur', nativeName: 'اردو', englishName: 'Urdu' },
    { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada' },
    { code: 'or', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia' },
    { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam' },
    { code: 'tl', nativeName: 'Tagalog', englishName: 'Tagalog' },
    { code: 'zh', nativeName: '中文', englishName: 'Chinese' },
    { code: 'ar', nativeName: 'العربية', englishName: 'Arabic' },
    { code: 'fr', nativeName: 'Français', englishName: 'French' },
    { code: 'pt', nativeName: 'Português', englishName: 'Portuguese' },
    { code: 'ru', nativeName: 'Русский', englishName: 'Russian' },
    { code: 'de', nativeName: 'Deutsch', englishName: 'German' },
    { code: 'ja', nativeName: '日本語', englishName: 'Japanese' },
    { code: 'ko', nativeName: '한국어', englishName: 'Korean' },
    { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish' },
    { code: 'it', nativeName: 'Italiano', englishName: 'Italian' },
    { code: 'es', nativeName: 'Español', englishName: 'Spanish' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <ThemedText style={[styles.title, { color: colors.text }]}>{t('settings')}</ThemedText>
        
        {user && (
          <View style={[styles.userCard, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.userLabel, { color: colors.textSecondary }]}>{t('loggedInAs')}</ThemedText>
            <ThemedText style={[styles.username, { color: colors.text }]}>{user.username}</ThemedText>
            {user.is_admin && (
              <View style={[styles.adminBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="shield-checkmark" size={14} color="#fff" />
                <Text style={styles.adminText}>{t('administrator')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Admin Access Button */}
        {user?.is_admin && (
          <TouchableOpacity 
            style={[styles.adminButton, { backgroundColor: colors.card }]}
            onPress={handleAdminAccess}
          >
            <View style={styles.adminButtonContent}>
              <View style={[styles.adminIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="shield" size={24} color={colors.primary} />
              </View>
              <View style={styles.adminButtonText}>
                <ThemedText style={[styles.adminButtonTitle, { color: colors.text }]}>{t('adminDashboard')}</ThemedText>
                <ThemedText style={[styles.adminButtonSubtitle, { color: colors.textSecondary }]}>
                  {t('adminDashboardSubtitle')}
                </ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Theme Toggle */}
        <View style={[styles.row, { backgroundColor: colors.card }]}>
          <View style={styles.rowLeft}>
            <Ionicons name={isDark ? "moon" : "sunny"} size={22} color={colors.primary} />
            <ThemedText style={[styles.rowText, { color: colors.text }]}>{t('darkMode')}</ThemedText>
          </View>
          <Switch 
            value={isDark} 
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={isDark ? colors.primary : colors.textSecondary}
          />
        </View>

        {/* Language Selector */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="language" size={22} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{t('language')}</ThemedText>
          </View>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageOption,
                language === lang.code && { backgroundColor: colors.primary + '20' }
              ]}
              onPress={() => setLanguage(lang.code as Language)}
            >
              <View style={styles.languageRow}>
                <ThemedText style={[
                  styles.languageText,
                  { color: language === lang.code ? colors.primary : colors.text }
                ]}>
                  {lang.nativeName}
                </ThemedText>
                <ThemedText style={[
                  styles.languageEnglishName,
                  { color: language === lang.code ? colors.primary : colors.textSecondary }
                ]}>
                  ({lang.englishName})
                </ThemedText>
              </View>
              {language === lang.code && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.logoutButton}>
          <Button title={t('logout')} onPress={handleLogout} color={colors.error} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16 
  },
  title: { 
    fontSize: 28, 
    marginBottom: 24,
    fontWeight: '700',
  },
  userCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  languageText: {
    fontSize: 15,
    fontWeight: '500',
  },
  languageEnglishName: {
    fontSize: 14,
  },
  logoutButton: {
    marginTop: 8,
  },
});
