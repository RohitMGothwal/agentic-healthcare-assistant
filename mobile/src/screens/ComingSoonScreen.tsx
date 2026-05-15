import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '../components/Icon';
import ThemedText from '../components/ThemedText';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

// List of upcoming features - these are planned but not implemented yet
const UPCOMING_FEATURES = [
  {
    id: '1',
    title: 'Telemedicine',
    description: 'Video consultations with doctors',
    icon: 'videocam',
    status: 'planned',
  },
  {
    id: '2',
    title: 'Apple HealthKit',
    description: 'Sync with Apple Watch and Health app',
    icon: 'watch',
    status: 'planned',
  },
  {
    id: '3',
    title: 'Medication Reminders',
    description: 'Smart pill tracking and schedules',
    icon: 'medical',
    status: 'planned',
  },
  {
    id: '4',
    title: 'Family Profiles',
    description: 'Manage health for entire family',
    icon: 'people',
    status: 'planned',
  },
  {
    id: '5',
    title: 'Skin Disease Detection',
    description: 'AI-powered skin condition analysis',
    icon: 'scan',
    status: 'planned',
  },
  {
    id: '6',
    title: 'Mental Health',
    description: 'Mood tracking and meditation',
    icon: 'happy',
    status: 'planned',
  },
  {
    id: '7',
    title: 'Women\'s Health',
    description: 'Period tracker and pregnancy mode',
    icon: 'female',
    status: 'planned',
  },
  {
    id: '8',
    title: 'Medical Report Scanner',
    description: 'OCR for prescriptions and reports',
    icon: 'document-text',
    status: 'planned',
  },
  {
    id: '9',
    title: 'Emergency SOS',
    description: 'Fall detection and auto-alerts',
    icon: 'warning',
    status: 'planned',
  },
  {
    id: '10',
    title: 'Health Challenges',
    description: 'Gamified fitness competitions',
    icon: 'trophy',
    status: 'planned',
  },
];

export default function ComingSoonScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <ThemedText style={styles.headerTitle}>Coming Soon</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Exciting new features in development
        </ThemedText>
      </View>

      <ScrollView style={styles.scrollView}>
        {UPCOMING_FEATURES.map((feature) => (
          <View
            key={feature.id}
            style={[styles.featureCard, { backgroundColor: colors.card }]}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={feature.icon as any}
                size={28}
                color={colors.primary}
              />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
              <ThemedText style={[styles.featureDesc, { color: colors.textSecondary }]}>
                {feature.description}
              </ThemedText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.statusText, { color: colors.primary }]}>
                {feature.status.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
            These features are planned for future releases.
          </ThemedText>
          <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
            Current version includes: AI Symptom Analysis, Chat, Appointments, Health Reports, and 23-language support.
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
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  featureContent: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    opacity: 0.8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
});
