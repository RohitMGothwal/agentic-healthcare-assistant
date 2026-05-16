import { SafeAreaView, StyleSheet, Switch, View, Button, Alert, TouchableOpacity, ScrollView, Text, ActivityIndicator, Linking, Share } from 'react-native';
import { Ionicons } from '../components/Icon';
import ThemedText from '../components/ThemedText';
import { useTheme } from '../hooks/useTheme';
import { useLanguage, Language } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { logout, user } = useAuth();
  const navigation = useNavigation();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('upToDate');
  
  // Notification states
  const [chatNotifications, setChatNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

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

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateStatus('checking');
    
    // Simulate checking for update
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setUpdateStatus('upToDate');
      Alert.alert(
        t('softwareUpdate'),
        t('appUpToDate'),
        [{ text: t('ok') }]
      );
    }, 2000);
  };

  const handleClearCache = () => {
    Alert.alert(
      t('clearCache'),
      t('clearCacheConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clear'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(t('success'), t('cacheCleared'));
          },
        },
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: t('shareAppMessage'),
        title: t('shareApp'),
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleRateApp = () => {
    navigation.navigate('RateApp' as never);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@agentichealth.com');
  };

  const handleOpenPrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy' as never);
  };

  const handleOpenTerms = () => {
    navigation.navigate('TermsOfService' as never);
  };

  // Simple language data for preview
  const languages = [
    { code: 'en', nativeName: 'English', flag: '🇺🇸' },
    { code: 'hi', nativeName: 'हिंदी', flag: '🇮🇳' },
    { code: 'bn', nativeName: 'বাংলা', flag: '🇧🇩' },
    { code: 'es', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ar', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'ja', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ru', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'pt', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ko', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'it', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'tr', nativeName: 'Türkçe', flag: '🇹🇷' },
    { code: 'ta', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'mr', nativeName: 'मराठी', flag: '🇮🇳' },
    { code: 'gu', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kn', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', nativeName: 'മലയാളം', flag: '🇮🇳' },
    { code: 'ur', nativeName: 'اردو', flag: '🇵🇰' },
    { code: 'or', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
    { code: 'tl', nativeName: 'Tagalog', flag: '🇵🇭' },
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

        {/* Software Update Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cloud-download" size={22} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{t('softwareUpdate')}</ThemedText>
          </View>
          
          <View style={styles.updateInfoRow}>
            <View>
              <ThemedText style={[styles.currentVersion, { color: colors.text }]}>
                {t('currentVersion')}: 1.0.0
              </ThemedText>
              <ThemedText style={[styles.updateStatus, { color: colors.textSecondary }]}>
                {updateStatus === 'checking' ? t('checkingForUpdates') : t('appUpToDate')}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.checkUpdateButton, { backgroundColor: colors.primary }]}
              onPress={handleCheckUpdate}
              disabled={isCheckingUpdate}
            >
              {isCheckingUpdate ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="refresh" size={16} color="#fff" />
                  <Text style={styles.checkUpdateText}>{t('checkForUpdates')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={[styles.autoUpdateRow, { borderTopColor: colors.border + '30' }]}>
            <View style={styles.rowLeft}>
              <Ionicons name="sync-circle" size={20} color={colors.primary} />
              <ThemedText style={[styles.rowText, { color: colors.text }]}>{t('autoUpdate')}</ThemedText>
            </View>
            <Switch
              value={true}
              disabled={true}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={colors.primary}
            />
          </View>
        </View>

        {/* Language Selector */}
        <TouchableOpacity 
          style={[styles.section, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('Language' as never)}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="language" size={22} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{t('language')}</ThemedText>
          </View>
          
          <View style={styles.languagePreviewRow}>
            <View style={styles.languagePreview}>
              <Text style={styles.flagEmoji}>{languages.find(l => l.code === language)?.flag || '🇺🇸'}</Text>
              <ThemedText style={[styles.selectedLanguage, { color: colors.text }]}>
                {languages.find(l => l.code === language)?.nativeName || 'English'}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* Storage & Data Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="server" size={22} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{t('storageData')}</ThemedText>
          </View>
          
          <View style={styles.storageInfoRow}>
            <View>
              <ThemedText style={[styles.storageUsed, { color: colors.text }]}>
                245 MB {t('used')}
              </ThemedText>
              <ThemedText style={[styles.storageTotal, { color: colors.textSecondary }]}>
                {t('of')} 5 GB
              </ThemedText>
            </View>
            <View style={[styles.storageBar, { backgroundColor: colors.border }]}>
              <View style={[styles.storageFill, { backgroundColor: colors.primary, width: '5%' }]} />
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.clearCacheButton, { borderTopColor: colors.border + '30' }]}
            onPress={handleClearCache}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <ThemedText style={[styles.rowText, { color: '#ef4444' }]}>{t('clearCache')}</ThemedText>
            </View>
            <ThemedText style={[styles.cacheSize, { color: colors.textSecondary }]}>32 MB</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={22} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{t('notifications')}</ThemedText>
          </View>
          
          <View style={[styles.notificationRow, { borderBottomColor: colors.border + '30' }]}>
            <View style={styles.rowLeft}>
              <Ionicons name="chatbubble" size={20} color={colors.primary} />
              <ThemedText style={[styles.rowText, { color: colors.text }]}>{t('chatNotifications')}</ThemedText>
            </View>
            <Switch
              value={chatNotifications}
              onValueChange={setChatNotifications}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={chatNotifications ? colors.primary : colors.textSecondary}
            />
          </View>
          
          <View style={[styles.notificationRow, { borderBottomColor: colors.border + '30' }]}>
            <View style={styles.rowLeft}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <ThemedText style={[styles.rowText, { color: colors.text }]}>{t('appointmentReminders')}</ThemedText>
            </View>
            <Switch
              value={appointmentReminders}
              onValueChange={setAppointmentReminders}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={appointmentReminders ? colors.primary : colors.textSecondary}
            />
          </View>
          
          <View style={styles.notificationRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="mail" size={20} color={colors.primary} />
              <ThemedText style={[styles.rowText, { color: colors.text }]}>{t('emailNotifications')}</ThemedText>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={emailNotifications ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Help & Support Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={22} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{t('helpSupport')}</ThemedText>
          </View>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('FAQ' as never)}>
            <View style={styles.rowLeft}>
              <Ionicons name="book-outline" size={20} color={colors.primary} />
              <ThemedText style={[styles.rowText, { color: colors.text }]}>{t('faqs')}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleContactSupport}>
            <View style={styles.rowLeft}>
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
              <ThemedText style={[styles.rowText, { color: colors.text }]}>{t('contactSupport')}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ReportBug' as never)}>
            <View style={styles.rowLeft}>
              <Ionicons name="bug-outline" size={20} color={colors.primary} />
              <ThemedText style={[styles.rowText, { color: colors.text }]}>{t('reportBug')}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.rowLeft}>
              <Ionicons name="videocam-outline" size={20} color={colors.primary} />
              <ThemedText style={[styles.rowText, { color: colors.text }]}>{t('appTutorial')}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{t('about')}</ThemedText>
          </View>
          
          <View style={styles.aboutInfo}>
            <ThemedText style={[styles.appName, { color: colors.text }]}>Agentic Health</ThemedText>
            <ThemedText style={[styles.appVersion, { color: colors.textSecondary }]}>
              {t('version')} 1.0.0 (Build 2024.05.16)
            </ThemedText>
          </View>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleRateApp}>
            <View style={styles.rowLeft}>
              <Ionicons name="star-outline" size={20} color={colors.primary} />
              <ThemedText style={[styles.rowText, { color: colors.text }]}>{t('rateApp')}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleShareApp}>
            <View style={styles.rowLeft}>
              <Ionicons name="share-outline" size={20} color={colors.primary} />
              <ThemedText style={[styles.rowText, { color: colors.text }]}>{t('shareApp')}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleOpenPrivacyPolicy}>
            <View style={styles.rowLeft}>
              <Ionicons name="shield-outline" size={20} color={colors.primary} />
              <ThemedText style={[styles.rowText, { color: colors.text }]}>{t('privacyPolicy')}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleOpenTerms}>
            <View style={styles.rowLeft}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              <ThemedText style={[styles.rowText, { color: colors.text }]}>{t('termsOfService')}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutCard, { backgroundColor: colors.card }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <View style={styles.logoutContent}>
            <View style={[styles.logoutIconContainer, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="log-out-outline" size={24} color={colors.error} />
            </View>
            <View style={styles.logoutTextContainer}>
              <ThemedText style={[styles.logoutTitle, { color: colors.error }]}>
                {t('logout')}
              </ThemedText>
              <ThemedText style={[styles.logoutSubtitle, { color: colors.textSecondary }]}>
                {t('logoutSubtitle')}
              </ThemedText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.error} />
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
            Agentic Health v1.0.0
          </ThemedText>
          <ThemedText style={[styles.footerSubtext, { color: colors.textSecondary }]}>
            {t('madeWithLove')}
          </ThemedText>
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
  // Logout Styles
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ef4444' + '30',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutTextContainer: {
    flex: 1,
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  logoutSubtitle: {
    fontSize: 13,
  },
  // Footer Styles
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
  },
  // Language Preview Styles
  languagePreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
  },
  languagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flagEmoji: {
    fontSize: 24,
  },
  selectedLanguage: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Software Update Styles
  updateInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentVersion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  updateStatus: {
    fontSize: 13,
  },
  checkUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  checkUpdateText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  autoUpdateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  // Storage & Data Styles
  storageInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  storageUsed: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  storageTotal: {
    fontSize: 13,
  },
  storageBar: {
    width: 100,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  storageFill: {
    height: '100%',
    borderRadius: 4,
  },
  clearCacheButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  cacheSize: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Notifications Styles
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  // Menu Item Styles
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  // About Section Styles
  aboutInfo: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
  },
});
