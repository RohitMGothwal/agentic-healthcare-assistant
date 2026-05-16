import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '../components/Icon';
import ThemedText from '../components/ThemedText';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigation } from '@react-navigation/native';

const FAQS = [
  {
    id: '1',
    question: 'How do I book an appointment?',
    answer: 'Go to the Appointments tab, tap "Book Appointment", select your preferred doctor, date, and time. You will receive a confirmation notification once booked.',
    icon: 'calendar',
  },
  {
    id: '2',
    question: 'How does the AI symptom checker work?',
    answer: 'Our AI analyzes your symptoms using advanced natural language processing and matches them with our medical database of 41 conditions and 93 symptoms. It provides possible conditions and recommendations.',
    icon: 'medical',
  },
  {
    id: '3',
    question: 'Is my health data secure?',
    answer: 'Yes! We use end-to-end encryption and comply with HIPAA regulations. Your data is stored securely and never shared with third parties without your consent.',
    icon: 'shield-checkmark',
  },
  {
    id: '4',
    question: 'Can I use the app offline?',
    answer: 'Yes, many features work offline including viewing your health reports and appointments. The AI chat requires internet connection for best results.',
    icon: 'wifi',
  },
  {
    id: '5',
    question: 'How do I change my language?',
    answer: 'Go to Settings > Language, select your preferred language from 23 available options. The app will instantly update.',
    icon: 'language',
  },
  {
    id: '6',
    question: 'What should I do in an emergency?',
    answer: 'Tap the red SOS button on the dashboard for emergency contacts. For life-threatening emergencies, always call your local emergency number first.',
    icon: 'warning',
  },
];

export default function FAQScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();

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
        <ThemedText style={styles.headerTitle}>{t('faqs')}</ThemedText>
        <ThemedText style={styles.headerSubtitle}>{t('faqsSubtitle')}</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {FAQS.map((faq) => (
          <View key={faq.id} style={[styles.faqCard, { backgroundColor: colors.card }]}>
            <View style={styles.faqHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={faq.icon as any} size={22} color={colors.primary} />
              </View>
              <ThemedText style={[styles.question, { color: colors.text }]}>
                {faq.question}
              </ThemedText>
            </View>
            
            <ThemedText style={[styles.answer, { color: colors.textSecondary }]}>
              {faq.answer}
            </ThemedText>
          </View>
        ))}

        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
            {t('cantFindAnswer')}
          </ThemedText>
          
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: colors.primary }]}
            onPress={() => Linking.openURL('mailto:support@agentichealth.com')}
          >
            <Ionicons name="mail" size={18} color="#fff" />
            <Text style={styles.contactButtonText}>{t('contactSupport')}</Text>
          </TouchableOpacity>
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
  faqCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqHeader: {
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
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  answer: {
    fontSize: 14,
    lineHeight: 22,
    marginLeft: 52,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
