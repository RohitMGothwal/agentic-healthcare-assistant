import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '../components/Icon';
import ThemedText from '../components/ThemedText';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigation } from '@react-navigation/native';

// Premium Feature Categories with all KonsultaMD-like features
const FEATURE_CATEGORIES = [
  {
    id: 'telemedicine',
    title: '🏥 Telemedicine',
    subtitle: '24/7 Healthcare Access',
    features: [
      { id: 't1', title: 'Video Consultations', description: 'Live HD video calls with certified doctors', icon: 'videocam', priority: 'high' },
      { id: 't2', title: '24/7 Doctor Access', description: 'Round-the-clock medical consultations', icon: 'time', priority: 'high' },
      { id: 't3', title: 'Specialist Network', description: 'Cardiology, Dermatology, Pediatrics & more', icon: 'medical', priority: 'medium' },
      { id: 't4', title: 'Digital Prescriptions', description: 'Instant e-prescriptions sent to your pharmacy', icon: 'document-text', priority: 'high' },
      { id: 't5', title: 'Medical Certificates', description: 'Digital sick leave & fit-to-work certificates', icon: 'fitness', priority: 'medium' },
    ]
  },
  {
    id: 'ecommerce',
    title: '🛒 Health Marketplace',
    subtitle: 'Medicines & Services',
    features: [
      { id: 'e1', title: 'Medicine Delivery', description: 'Same-day delivery from partner pharmacies', icon: 'bicycle', priority: 'high' },
      { id: 'e2', title: 'Lab Test Booking', description: 'Home sample collection for diagnostics', icon: 'flask', priority: 'high' },
      { id: 'e3', title: 'In-App Payments', description: 'GCash, Credit Card, PayPal integration', icon: 'card', priority: 'high' },
      { id: 'e4', title: 'Health Products', description: 'Vitamins, supplements & medical supplies', icon: 'basket', priority: 'medium' },
    ]
  },
  {
    id: 'family',
    title: '👨‍👩‍👧‍👦 Family Plans',
    subtitle: 'Multi-User Management',
    features: [
      { id: 'f1', title: 'Family Profiles', description: 'Manage health for up to 6 family members', icon: 'people', priority: 'high' },
      { id: 'f2', title: 'Subscription Tiers', description: 'Basic, Premium & Family plans', icon: 'diamond', priority: 'high' },
      { id: 'f3', title: 'Dependent Tracking', description: 'Monitor children & elderly health', icon: 'heart-circle', priority: 'medium' },
      { id: 'f4', title: 'Shared Health Records', description: 'Access family medical history', icon: 'folder-open', priority: 'medium' },
    ]
  },
  {
    id: 'ai',
    title: '🤖 AI Health Features',
    subtitle: 'Smart Diagnostics',
    features: [
      { id: 'a1', title: 'Skin Disease Detection', description: 'AI-powered skin condition analysis', icon: 'scan', priority: 'medium' },
      { id: 'a2', title: 'Symptom Checker', description: 'Advanced AI symptom analysis', icon: 'search', priority: 'high' },
      { id: 'a3', title: 'Health Predictions', description: 'Risk assessment & early warnings', icon: 'trending-up', priority: 'medium' },
      { id: 'a4', title: 'Smart Recommendations', description: 'Personalized health tips', icon: 'bulb', priority: 'medium' },
    ]
  },
  {
    id: 'wellness',
    title: '🧘 Wellness & Lifestyle',
    subtitle: 'Holistic Health',
    features: [
      { id: 'w1', title: 'Mental Health', description: 'Mood tracking & meditation guides', icon: 'happy', priority: 'medium' },
      { id: 'w2', title: 'Women\'s Health', description: 'Period tracker & pregnancy mode', icon: 'female', priority: 'medium' },
      { id: 'w3', title: 'Health Challenges', description: 'Gamified fitness competitions', icon: 'trophy', priority: 'low' },
      { id: 'w4', title: 'Sleep Tracking', description: 'Sleep quality analysis & tips', icon: 'moon', priority: 'medium' },
    ]
  },
  {
    id: 'devices',
    title: '⌚ Device Integration',
    subtitle: 'Connected Health',
    features: [
      { id: 'd1', title: 'Apple HealthKit', description: 'Sync with Apple Watch & Health app', icon: 'watch', priority: 'high' },
      { id: 'd2', title: 'Google Fit', description: 'Android health data integration', icon: 'logo-google', priority: 'high' },
      { id: 'd3', title: 'Medical Devices', description: 'BP monitors, glucometers & scales', icon: 'hardware-chip', priority: 'medium' },
      { id: 'd4', title: 'Wearable Alerts', description: 'Fall detection & emergency SOS', icon: 'warning', priority: 'high' },
    ]
  },
  {
    id: 'reminders',
    title: '🔔 Smart Reminders',
    subtitle: 'Never Miss a Dose',
    features: [
      { id: 'r1', title: 'Medication Reminders', description: 'Smart pill tracking & schedules', icon: 'medical', priority: 'high' },
      { id: 'r2', title: 'Appointment Alerts', description: 'SMS & push notification reminders', icon: 'alarm', priority: 'high' },
      { id: 'r3', title: 'Follow-up Alerts', description: 'Automatic check-up reminders', icon: 'repeat', priority: 'medium' },
      { id: 'r4', title: 'Vaccination Tracker', description: 'Immunization schedule & alerts', icon: 'shield-checkmark', priority: 'medium' },
    ]
  },
  {
    id: 'content',
    title: '📚 Health Content',
    subtitle: 'Learn & Stay Informed',
    features: [
      { id: 'c1', title: 'Health Articles', description: 'Daily curated health content', icon: 'newspaper', priority: 'medium' },
      { id: 'c2', title: 'Doctor Ratings', description: 'Rate & review consultations', icon: 'star', priority: 'medium' },
      { id: 'c3', title: 'Video Library', description: 'Health tips & educational videos', icon: 'play-circle', priority: 'low' },
      { id: 'c4', title: 'Community Forum', description: 'Connect with other patients', icon: 'chatbubbles', priority: 'low' },
    ]
  },
];

export default function ComingSoonScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#10b981'; // Green
      case 'medium': return '#f59e0b'; // Orange
      case 'low': return '#6b7280'; // Gray
      default: return colors.primary;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'PRIORITY';
      case 'medium': return 'PLANNED';
      case 'low': return 'FUTURE';
      default: return 'PLANNED';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.premiumBadge}>
            <Ionicons name="diamond" size={16} color="#8b5cf6" />
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
          <ThemedText style={styles.headerTitle}>Coming Soon</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            30+ powerful features in development
          </ThemedText>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#10b981' + '15' }]}>
            <Ionicons name="rocket" size={24} color="#10b981" />
            <Text style={[styles.statNumber, { color: '#10b981' }]}>30+</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Features</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#8b5cf6' + '15' }]}>
            <Ionicons name="calendar" size={24} color="#8b5cf6" />
            <Text style={[styles.statNumber, { color: '#8b5cf6' }]}>Q3</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>2025</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#f59e0b' + '15' }]}>
            <Ionicons name="star" size={24} color="#f59e0b" />
            <Text style={[styles.statNumber, { color: '#f59e0b' }]}>4.9</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Target</Text>
          </View>
        </View>

        {/* Feature Categories */}
        {FEATURE_CATEGORIES.map((category) => (
          <View key={category.id} style={styles.categorySection}>
            {/* Category Header */}
            <View style={styles.categoryHeader}>
              <ThemedText style={[styles.categoryTitle, { color: colors.text }]}>
                {category.title}
              </ThemedText>
              <ThemedText style={[styles.categorySubtitle, { color: colors.textSecondary }]}>
                {category.subtitle}
              </ThemedText>
            </View>

            {/* Features Grid */}
            <View style={styles.featuresGrid}>
              {category.features.map((feature, index) => (
                <View
                  key={feature.id}
                  style={[
                    styles.featureCard, 
                    { 
                      backgroundColor: colors.card,
                      borderLeftWidth: 3,
                      borderLeftColor: getPriorityColor(feature.priority),
                    }
                  ]}
                >
                  <View style={styles.featureHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: getPriorityColor(feature.priority) + '15' }]}>
                      <Ionicons
                        name={feature.icon as any}
                        size={20}
                        color={getPriorityColor(feature.priority)}
                      />
                    </View>
                    <View style={[
                      styles.priorityBadge, 
                      { backgroundColor: getPriorityColor(feature.priority) + '15' }
                    ]}>
                      <Text style={[
                        styles.priorityText, 
                        { color: getPriorityColor(feature.priority) }
                      ]}>
                        {getPriorityLabel(feature.priority)}
                      </Text>
                    </View>
                  </View>
                  <ThemedText style={[styles.featureTitle, { color: colors.text }]}>
                    {feature.title}
                  </ThemedText>
                  <ThemedText style={[styles.featureDesc, { color: colors.textSecondary }]}>
                    {feature.description}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Premium CTA */}
        <View style={[styles.ctaCard, { backgroundColor: colors.primary }]}>
          <Ionicons name="notifications" size={32} color="#fff" />
          <ThemedText style={styles.ctaTitle}>Get Notified</ThemedText>
          <ThemedText style={styles.ctaSubtitle}>
            Be the first to know when new features launch
          </ThemedText>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Notify Me</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
            Current version: AI Symptom Analysis • Chat • Appointments
          </ThemedText>
          <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
            Health Reports • 23 Languages • Profile Management
          </ThemedText>
          <ThemedText style={[styles.footerVersion, { color: colors.textSecondary }]}>
            v1.0.0 • Built with ❤️ for better healthcare
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
  headerContent: {
    alignItems: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6' + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8b5cf6',
    marginLeft: 6,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '700',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 18,
  },
  ctaCard: {
    marginHorizontal: 4,
    marginVertical: 24,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  footerDivider: {
    width: 60,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 6,
    opacity: 0.8,
  },
  footerVersion: {
    fontSize: 12,
    marginTop: 12,
    opacity: 0.6,
  },
});
