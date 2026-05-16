import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '../components/Icon';
import ThemedText from '../components/ThemedText';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

const BUG_CATEGORIES = [
  { id: 'crash', label: 'App Crash', icon: 'bug' },
  { id: 'ui', label: 'UI Issue', icon: 'image' },
  { id: 'feature', label: 'Feature Not Working', icon: 'construct' },
  { id: 'performance', label: 'Slow Performance', icon: 'speedometer' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

export default function ReportBugScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert(t('error'), t('selectCategory'));
      return;
    }
    if (!description.trim()) {
      Alert.alert(t('error'), t('enterDescription'));
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        t('thankYou'),
        t('bugReportSubmitted'),
        [{ 
          text: t('ok'),
          onPress: () => navigation.goBack()
        }]
      );
    }, 1500);
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
        <ThemedText style={styles.headerTitle}>{t('reportBug')}</ThemedText>
        <ThemedText style={styles.headerSubtitle}>{t('reportBugSubtitle')}</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Category Selection */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            {t('bugCategory')}
          </ThemedText>
          
          <View style={styles.categoriesGrid}>
            {BUG_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  { 
                    backgroundColor: selectedCategory === cat.id 
                      ? colors.primary + '20' 
                      : colors.background 
                  },
                  selectedCategory === cat.id && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons 
                  name={cat.icon as any} 
                  size={24} 
                  color={selectedCategory === cat.id ? colors.primary : colors.textSecondary} 
                />
                <ThemedText style={[
                  styles.categoryLabel,
                  { color: selectedCategory === cat.id ? colors.primary : colors.text }
                ]}>
                  {cat.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            {t('bugDescription')}
          </ThemedText>
          
          <View style={[styles.textInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder={t('describeBug')}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </View>
          
          <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>
            {t('bugHint')}
          </ThemedText>
        </View>

        {/* Attach Screenshot */}
        <TouchableOpacity style={[styles.attachButton, { backgroundColor: colors.card }]}>
          <Ionicons name="image-outline" size={24} color={colors.primary} />
          <View style={styles.attachTextContainer}>
            <ThemedText style={[styles.attachTitle, { color: colors.text }]}>
              {t('attachScreenshot')}
            </ThemedText>
            <ThemedText style={[styles.attachSubtitle, { color: colors.textSecondary }]}>
              {t('optional')}
            </ThemedText>
          </View>
          <Ionicons name="add-circle" size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { 
              backgroundColor: selectedCategory && description ? colors.primary : colors.border,
              opacity: isSubmitting ? 0.7 : 1
            }
          ]}
          onPress={handleSubmit}
          disabled={!selectedCategory || !description || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{t('submitReport')}</Text>
          )}
        </TouchableOpacity>
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
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  textInputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
  },
  textInput: {
    fontSize: 15,
    lineHeight: 22,
  },
  hint: {
    fontSize: 13,
    marginTop: 8,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
  },
  attachTextContainer: {
    flex: 1,
  },
  attachTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  attachSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
