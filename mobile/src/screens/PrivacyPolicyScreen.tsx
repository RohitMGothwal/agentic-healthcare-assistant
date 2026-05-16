import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons } from '../components/Icon';
import ThemedText from '../components/ThemedText';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

const PRIVACY_SECTIONS = [
  {
    id: '1',
    title: 'Data Collection',
    content: 'We collect health metrics, appointment data, chat history, and device information to provide personalized healthcare services. All data is encrypted and stored securely.',
    icon: 'cloud-download',
  },
  {
    id: '2',
    title: 'Data Usage',
    content: 'Your data is used to provide AI-powered health insights, appointment scheduling, and health tracking. We never sell your personal data to third parties.',
    icon: 'analytics',
  },
  {
    id: '3',
    title: 'Data Protection',
    content: 'We use industry-standard encryption (AES-256) and comply with HIPAA regulations. Your data is backed up daily and stored in secure data centers.',
    icon: 'shield-checkmark',
  },
  {
    id: '4',
    title: 'Third-Party Sharing',
    content: 'We only share data with your consent or when required by law. Healthcare providers can access your data only with your explicit permission.',
    icon: 'share-social',
  },
  {
    id: '5',
    title: 'Your Rights',
    content: 'You have the right to access, modify, or delete your data at any time. Contact support for data export or deletion requests.',
    icon: 'person',
  },
];

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [agreedToNDA, setAgreedToNDA] = useState(false);
  const [agreedToConsent, setAgreedToConsent] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);

  const handleAcceptAll = () => {
    if (!agreedToNDA || !agreedToConsent) {
      Alert.alert(t('error'), t('mustAgreeToContinue'));
      return;
    }
    Alert.alert(t('success'), t('privacySettingsSaved'));
    navigation.goBack();
  };

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
        <ThemedText style={styles.headerTitle}>{t('privacyPolicy')}</ThemedText>
        <ThemedText style={styles.headerSubtitle}>{t('privacySubtitle')}</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Privacy Sections */}
        {PRIVACY_SECTIONS.map((section) => (
          <View key={section.id} style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={section.icon as any} size={22} color={colors.primary} />
              </View>
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                {section.title}
              </ThemedText>
            </View>
            
            <ThemedText style={[styles.sectionContent, { color: colors.textSecondary }]}>
              {section.content}
            </ThemedText>
          </View>
        ))}

        {/* NDA Agreement */}
        <View style={[styles.agreementCard, { backgroundColor: colors.card }]}>
          <View style={styles.agreementHeader}>
            <Ionicons name="document-lock" size={24} color={colors.primary} />
            <ThemedText style={[styles.agreementTitle, { color: colors.text }]}>
              {t('ndaAgreement')}
            </ThemedText>
          </View>
          
          <ThemedText style={[styles.agreementText, { color: colors.textSecondary }]}>
            {t('ndaText')}
          </ThemedText>
          
          <View style={styles.checkboxRow}>
            <Switch
              value={agreedToNDA}
              onValueChange={setAgreedToNDA}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={agreedToNDA ? colors.primary : colors.textSecondary}
            />
            <ThemedText style={[styles.checkboxLabel, { color: colors.text }]}>
              {t('iAgreeToNDA')}
            </ThemedText>
          </View>
        </View>

        {/* Consent Form */}
        <View style={[styles.agreementCard, { backgroundColor: colors.card }]}>
          <View style={styles.agreementHeader}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            <ThemedText style={[styles.agreementTitle, { color: colors.text }]}>
              {t('consentForm')}
            </ThemedText>
          </View>
          
          <ThemedText style={[styles.agreementText, { color: colors.textSecondary }]}>
            {t('consentText')}
          </ThemedText>
          
          <View style={styles.checkboxRow}>
            <Switch
              value={agreedToConsent}
              onValueChange={setAgreedToConsent}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={agreedToConsent ? colors.primary : colors.textSecondary}
            />
            <ThemedText style={[styles.checkboxLabel, { color: colors.text }]}>
              {t('iConsent')}
            </ThemedText>
          </View>
        </View>

        {/* Data Sharing Toggle */}
        <View style={[styles.toggleCard, { backgroundColor: colors.card }]}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Ionicons name="share-outline" size={22} color={colors.primary} />
              <View>
                <ThemedText style={[styles.toggleTitle, { color: colors.text }]}>
                  {t('dataSharing')}
                </ThemedText>
                <ThemedText style={[styles.toggleSubtitle, { color: colors.textSecondary }]}>
                  {t('dataSharingSubtitle')}
                </ThemedText>
              </View>
            </View>
            
            <Switch
              value={dataSharing}
              onValueChange={setDataSharing}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={dataSharing ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Accept Button */}
        <TouchableOpacity
          style={[
            styles.acceptButton,
            { 
              backgroundColor: agreedToNDA && agreedToConsent ? colors.primary : colors.border,
            }
          ]}
          onPress={handleAcceptAll}
          disabled={!agreedToNDA || !agreedToConsent}
        >
          <Text style={styles.acceptButtonText}>{t('acceptAndContinue')}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
            {t('lastUpdated')}: May 16, 2025
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
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
    marginLeft: 52,
  },
  agreementCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  agreementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  agreementTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  agreementText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  toggleCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 13,
  },
  acceptButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
  },
});
