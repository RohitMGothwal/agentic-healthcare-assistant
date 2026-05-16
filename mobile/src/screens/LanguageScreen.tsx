import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '../components/Icon';
import ThemedText from '../components/ThemedText';
import { useTheme } from '../hooks/useTheme';
import { useLanguage, Language } from '../hooks/useLanguage';
import { useNavigation } from '@react-navigation/native';
import { useState, useMemo } from 'react';

const languages = [
  { code: 'en', nativeName: 'English', englishName: 'English', flag: '🇺🇸' },
  { code: 'hi', nativeName: 'हिंदी', englishName: 'Hindi', flag: '🇮🇳' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', flag: '🇧🇩' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', flag: '🇮🇳' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', flag: '🇮🇳' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', flag: '🇮🇳' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', flag: '🇮🇳' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', flag: '🇵🇰' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', flag: '🇮🇳' },
  { code: 'or', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia', flag: '🇮🇳' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', flag: '🇮🇳' },
  { code: 'tl', nativeName: 'Tagalog', englishName: 'Tagalog', flag: '🇵🇭' },
  { code: 'zh', nativeName: '中文', englishName: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', flag: '🇸🇦' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', flag: '🇫🇷' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian', flag: '🇷🇺' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German', flag: '🇩🇪' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', nativeName: '한국어', englishName: 'Korean', flag: '🇰🇷' },
  { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', flag: '🇹🇷' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian', flag: '🇮🇹' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', flag: '🇪🇸' },
];

export default function LanguageScreen() {
  const { colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = useMemo(() => {
    if (!searchQuery) return languages;
    const query = searchQuery.toLowerCase();
    return languages.filter(
      lang => 
        lang.nativeName.toLowerCase().includes(query) ||
        lang.englishName.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelectLanguage = (code: Language) => {
    setLanguage(code);
    // Small delay to show selection before going back
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  };

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{t('language')}</ThemedText>
        <ThemedText style={styles.headerSubtitle}>{t('selectLanguage')}</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Language Card */}
        <View style={[styles.currentCard, { backgroundColor: colors.primary + '15' }]}>
          <ThemedText style={[styles.currentLabel, { color: colors.textSecondary }]}>
            {t('currentLanguage')}
          </ThemedText>
          <View style={styles.currentLangRow}>
            <Text style={styles.flag}>{currentLanguage?.flag}</Text>
            <View>
              <ThemedText style={[styles.currentNative, { color: colors.text }]}>
                {currentLanguage?.nativeName}
              </ThemedText>
              <ThemedText style={[styles.currentEnglish, { color: colors.textSecondary }]}>
                {currentLanguage?.englishName}
              </ThemedText>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('searchLanguage')}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Languages List */}
        <View style={[styles.languagesCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            {t('availableLanguages')} ({filteredLanguages.length})
          </ThemedText>
          
          {filteredLanguages.map((lang, index) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                index !== filteredLanguages.length - 1 && { 
                  borderBottomWidth: 1, 
                  borderBottomColor: colors.border + '30' 
                },
                language === lang.code && { 
                  backgroundColor: colors.primary + '10',
                  borderRadius: 12,
                  marginHorizontal: -8,
                  paddingHorizontal: 20,
                }
              ]}
              onPress={() => handleSelectLanguage(lang.code as Language)}
            >
              <View style={styles.languageRow}>
                <Text style={styles.flagLarge}>{lang.flag}</Text>
                <View style={styles.languageInfo}>
                  <ThemedText style={[
                    styles.nativeName,
                    { color: language === lang.code ? colors.primary : colors.text }
                  ]}>
                    {lang.nativeName}
                  </ThemedText>
                  <ThemedText style={[styles.englishName, { color: colors.textSecondary }]}>
                    {lang.englishName}
                  </ThemedText>
                </View>
              </View>
              
              {language === lang.code ? (
                <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          ))}
          
          {filteredLanguages.length === 0 && (
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
              <ThemedText style={[styles.noResultsText, { color: colors.textSecondary }]}>
                {t('noLanguagesFound')}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Info Footer */}
        <View style={styles.footer}>
          <Ionicons name="globe" size={24} color={colors.primary} />
          <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
            {t('languageSupportInfo')}
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginBottom: 12,
    padding: 8,
    marginLeft: -8,
    alignSelf: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  currentCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  currentLabel: {
    fontSize: 13,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  currentLangRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flag: {
    fontSize: 32,
  },
  currentNative: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  currentEnglish: {
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  languagesCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagLarge: {
    fontSize: 28,
  },
  languageInfo: {
    flex: 1,
  },
  nativeName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  englishName: {
    fontSize: 13,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 14,
    marginTop: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 12,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
