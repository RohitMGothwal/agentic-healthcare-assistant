import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '../components/Icon';
import ThemedText from '../components/ThemedText';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

const TERMS_SECTIONS = [
  {
    id: '1',
    title: '1. Acceptance of Terms',
    content: 'By accessing or using Agentic Health, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.',
    icon: 'checkmark-circle',
  },
  {
    id: '2',
    title: '2. Medical Disclaimer',
    content: 'Agentic Health provides AI-powered health information for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.',
    icon: 'medical',
  },
  {
    id: '3',
    title: '3. User Responsibilities',
    content: 'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must be 18 years or older to use this service.',
    icon: 'person',
  },
  {
    id: '4',
    title: '4. Data Privacy',
    content: 'Your use of Agentic Health is also governed by our Privacy Policy. By using the service, you consent to the collection and use of information as detailed in our Privacy Policy.',
    icon: 'shield',
  },
  {
    id: '5',
    title: '5. Prohibited Activities',
    content: 'You may not use the service for any illegal purpose, attempt to gain unauthorized access, interfere with other users, transmit viruses, or engage in any activity that disrupts the service.',
    icon: 'ban',
  },
  {
    id: '6',
    title: '6. Limitation of Liability',
    content: 'Agentic Health shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. The service is provided "as is" without warranties.',
    icon: 'warning',
  },
  {
    id: '7',
    title: '7. Termination',
    content: 'We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including breach of Terms. Upon termination, your right to use the service will cease immediately.',
    icon: 'close-circle',
  },
  {
    id: '8',
    title: '8. Changes to Terms',
    content: 'We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page. Continued use of the service constitutes acceptance of the revised Terms.',
    icon: 'refresh',
  },
  {
    id: '9',
    title: '9. Governing Law',
    content: 'These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which you reside, without regard to its conflict of law provisions.',
    icon: 'document',
  },
  {
    id: '10',
    title: '10. Contact Us',
    content: 'If you have any questions about these Terms, please contact us at legal@agentichealth.com or through the Contact Support option in the app.',
    icon: 'mail',
  },
];

export default function TermsOfServiceScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [expandedSection, setExpandedSection] = useState('1');

  const handleAccept = () => {
    if (!agreedToTerms) {
      Alert.alert(t('error'), t('mustAgreeToTerms'));
      return;
    }
    Alert.alert(t('success'), t('termsAccepted'));
    navigation.goBack();
  };

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? '' : id);
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
        <ThemedText style={styles.headerTitle}>{t('termsOfService')}</ThemedText>
        <ThemedText style={styles.headerSubtitle}>{t('termsSubtitle')}</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Agreement Notice */}
        <View style={[styles.noticeCard, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <ThemedText style={[styles.noticeText, { color: colors.text }]}>
            {t('termsNotice')}
          </ThemedText>
        </View>

        {/* Terms Sections */}
        {TERMS_SECTIONS.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[styles.sectionCard, { backgroundColor: colors.card }]}
            onPress={() => toggleSection(section.id)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={section.icon as any} size={20} color={colors.primary} />
              </View>
              
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                {section.title}
              </ThemedText>
              
              <Ionicons
                name={expandedSection === section.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textSecondary}
              />
            </View>
            
            {expandedSection === section.id && (
              <ThemedText style={[styles.sectionContent, { color: colors.textSecondary }]}>
                {section.content}
              </ThemedText>
            )}
          </TouchableOpacity>
        ))}

        {/* Agreement Checkbox */}
        <View style={[styles.agreementCard, { backgroundColor: colors.card }]}>
          <View style={styles.agreementHeader}>
            <Ionicons name="document-text" size={24} color={colors.primary} />
            <ThemedText style={[styles.agreementTitle, { color: colors.text }]}>
              {t('agreementRequired')}
            </ThemedText>
          </View>
          
          <ThemedText style={[styles.agreementText, { color: colors.textSecondary }]}>
            {t('termsAgreementText')}
          </ThemedText>
          
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <View style={[
              styles.checkbox,
              { 
                borderColor: agreedToTerms ? colors.primary : colors.border,
                backgroundColor: agreedToTerms ? colors.primary : 'transparent'
              }
            ]}>
              {agreedToTerms && <Ionicons name="checkmark" size={18} color="#fff" />}
            </View>
            
            <ThemedText style={[styles.checkboxLabel, { color: colors.text }]}>
              {t('iAgreeToTerms')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Accept Button */}
        <TouchableOpacity
          style={[
            styles.acceptButton,
            { 
              backgroundColor: agreedToTerms ? colors.primary : colors.border,
            }
          ]}
          onPress={handleAccept}
        >
          <Text style={styles.acceptButtonText}>{t('acceptTerms')}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
            {t('lastUpdated')}: May 16, 2025
          </ThemedText>
          
          <ThemedText style={[styles.versionText, { color: colors.textSecondary }]}>
            {t('version')}: 1.0.0
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
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
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
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    marginLeft: 48,
  },
  agreementCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    marginTop: 8,
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
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
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
  },
});
