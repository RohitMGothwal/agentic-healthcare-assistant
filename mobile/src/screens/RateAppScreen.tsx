import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '../components/Icon';
import ThemedText from '../components/ThemedText';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

export default function RateAppScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert(t('error'), t('pleaseSelectRating'));
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        t('thankYou'),
        t('feedbackSubmitted'),
        [{ 
          text: t('ok'),
          onPress: () => navigation.goBack()
        }]
      );
    }, 1500);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          style={styles.starButton}
          onPress={() => setRating(i)}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={40}
            color={i <= rating ? '#f59e0b' : colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1: return t('ratingPoor');
      case 2: return t('ratingFair');
      case 3: return t('ratingGood');
      case 4: return t('ratingVeryGood');
      case 5: return t('ratingExcellent');
      default: return t('tapToRate');
    }
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
        <ThemedText style={styles.headerTitle}>{t('rateApp')}</ThemedText>
        <ThemedText style={styles.headerSubtitle}>{t('rateAppSubtitle')}</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Rating Card */}
        <View style={[styles.ratingCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.ratingQuestion, { color: colors.text }]}>
            {t('howWouldYouRate')}
          </ThemedText>
          
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          
          <ThemedText style={[styles.ratingText, { color: colors.primary }]}>
            {getRatingText()}
          </ThemedText>
        </View>

        {/* Feedback Card */}
        <View style={[styles.feedbackCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.feedbackTitle, { color: colors.text }]}>
            {t('shareFeedback')}
          </ThemedText>
          
          <ThemedText style={[styles.feedbackSubtitle, { color: colors.textSecondary }]}>
            {t('feedbackSubtitle')}
          </ThemedText>
          
          <View style={[styles.textInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder={t('feedbackPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              value={feedback}
              onChangeText={setFeedback}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { 
              backgroundColor: rating > 0 ? colors.primary : colors.border,
              opacity: isSubmitting ? 0.7 : 1
            }
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{t('submitReview')}</Text>
          )}
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.goBack()}
        >
          <ThemedText style={[styles.skipButtonText, { color: colors.textSecondary }]}>
            {t('maybeLater')}
          </ThemedText>
        </TouchableOpacity>

        {/* App Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.primary }]}>4.8</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>{t('averageRating')}</ThemedText>
          </View>
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.primary }]}>2.5K+</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>{t('reviews')}</ThemedText>
          </View>
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
  ratingCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingQuestion: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  feedbackSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  textInputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
  },
  textInput: {
    fontSize: 15,
    lineHeight: 22,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 24,
  },
  skipButtonText: {
    fontSize: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
  },
});
