import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { Ionicons } from '../components/Icon';
import ChatBubble from '../components/ChatBubble';
import VoiceInput from '../components/VoiceInput';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { chatApi } from '../api/client';

interface ChatMessage {
  id?: number;
  text: string;
  user: boolean;
  created_at?: string;
  timestamp?: string;
}

interface Specialist {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Specialist data with translation keys
const SPECIALISTS_DATA = [
  { id: 'general', nameKey: 'specialist_general', icon: 'medical', descKey: 'desc_general' },
  { id: 'cardiologist', nameKey: 'specialist_cardiologist', icon: 'heart', descKey: 'desc_cardiologist' },
  { id: 'dermatologist', nameKey: 'specialist_dermatologist', icon: 'body-outline', descKey: 'desc_dermatologist' },
  { id: 'neurologist', nameKey: 'specialist_neurologist', icon: 'git-network', descKey: 'desc_neurologist' },
  { id: 'pediatrician', nameKey: 'specialist_pediatrician', icon: 'happy', descKey: 'desc_pediatrician' },
  { id: 'gynecologist', nameKey: 'specialist_gynecologist', icon: 'female', descKey: 'desc_gynecologist' },
  { id: 'orthopedic', nameKey: 'specialist_orthopedic', icon: 'barbell', descKey: 'desc_orthopedic' },
  { id: 'psychiatrist', nameKey: 'specialist_psychiatrist', icon: 'happy-outline', descKey: 'desc_psychiatrist' },
  { id: 'dentist', nameKey: 'specialist_dentist', icon: 'sunny', descKey: 'desc_dentist' },
  { id: 'ophthalmologist', nameKey: 'specialist_ophthalmologist', icon: 'eye', descKey: 'desc_ophthalmologist' },
  { id: 'ent', nameKey: 'specialist_ent', icon: 'headset', descKey: 'desc_ent' },
  { id: 'pulmonologist', nameKey: 'specialist_pulmonologist', icon: 'cloud', descKey: 'desc_pulmonologist' },
  { id: 'gastroenterologist', nameKey: 'specialist_gastroenterologist', icon: 'restaurant', descKey: 'desc_gastroenterologist' },
  { id: 'endocrinologist', nameKey: 'specialist_endocrinologist', icon: 'water', descKey: 'desc_endocrinologist' },
  { id: 'oncologist', nameKey: 'specialist_oncologist', icon: 'medal', descKey: 'desc_oncologist' },
  { id: 'urologist', nameKey: 'specialist_urologist', icon: 'male', descKey: 'desc_urologist' },
  { id: 'nephrologist', nameKey: 'specialist_nephrologist', icon: 'water-outline', descKey: 'desc_nephrologist' },
  { id: 'rheumatologist', nameKey: 'specialist_rheumatologist', icon: 'hand-left', descKey: 'desc_rheumatologist' },
  { id: 'allergist', nameKey: 'specialist_allergist', icon: 'leaf', descKey: 'desc_allergist' },
  { id: 'emergency', nameKey: 'specialist_emergency', icon: 'alert-circle', descKey: 'desc_emergency' },
];

// Generate specialists with translations
const useSpecialists = () => {
  const { t } = useLanguage();
  return SPECIALISTS_DATA.map(s => ({
    id: s.id,
    name: t(s.nameKey),
    icon: s.icon,
    description: t(s.descKey),
  }));
};

export default function ChatScreen() {
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  const SPECIALISTS = useSpecialists();
  
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist>(SPECIALISTS[0]);
  const [showSpecialistModal, setShowSpecialistModal] = useState(false);
  const [showSymptomAnalysis, setShowSymptomAnalysis] = useState(false);
  const [symptomAnalysis, setSymptomAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const chatHistoryRef = useRef<ChatMessage[]>([]);
  const isSendingRef = useRef(false);
  const messageRef = useRef('');
  const lastSendTimeRef = useRef(0);

  // Generate welcome message based on current language
  const generateWelcomeMessage = useCallback((): ChatMessage => ({
    id: 0,
    text: `${t('chatWelcome')}\n\n${t('chatCapabilities')}:\n• ${t('chatFeature1')}\n• ${t('chatFeature2')}\n• ${t('chatFeature3')}\n• ${t('chatFeature4')}\n• ${t('chatFeature5')}\n\n${t('chatPrompt')}`,
    user: false,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }), [t]);

  // Load chat history on mount - only once
  useEffect(() => {
    const initChat = async () => {
      try {
        setIsLoadingHistory(true);
        const history = await chatApi.getHistory();
        const formattedHistory = history.map((msg: any) => ({
          id: msg.id,
          text: msg.message,
          user: msg.is_user === 1,
          created_at: msg.created_at,
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        // Store history in a ref to use with welcome message
        chatHistoryRef.current = formattedHistory;
        // Set initial chat with welcome message
        setChat([generateWelcomeMessage(), ...formattedHistory]);
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setChat([generateWelcomeMessage()]);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Update welcome message when language changes
  useEffect(() => {
    setChat((currentChat) => {
      // If chat is empty, just add welcome message
      if (currentChat.length === 0) {
        return [generateWelcomeMessage()];
      }
      // If first message is welcome message (id: 0), update it
      if (currentChat[0].id === 0) {
        return [generateWelcomeMessage(), ...currentChat.slice(1)];
      }
      return currentChat;
    });
  }, [language, generateWelcomeMessage]);

  const sendMessage = useCallback(async () => {
    // Use a local ref to get the current message value to avoid closure issues
    const currentMessage = messageRef.current.trim();
    
    // Multiple guards to prevent duplicate sends
    if (!currentMessage) {
      console.log('Send blocked: empty message');
      return;
    }
    if (isLoading) {
      console.log('Send blocked: already loading');
      return;
    }
    if (isSendingRef.current) {
      console.log('Send blocked: already sending');
      return;
    }

    // Debounce: prevent sending within 2000ms of last send
    const now = Date.now();
    if (now - lastSendTimeRef.current < 2000) {
      console.log('Send blocked: debounced (within 2 seconds)');
      return;
    }
    lastSendTimeRef.current = now;

    // Prevent duplicate sends
    isSendingRef.current = true;
    
    // Clear input immediately to prevent double-send
    setMessage('');
    messageRef.current = '';

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Optimistically add user message
    const userMessage: ChatMessage = { 
      text: currentMessage, 
      user: true,
      timestamp,
    };
    setChat((current) => [...current, userMessage]);
    setIsLoading(true);
    
    console.log('Message sent:', currentMessage);

    // Generate unique request ID to prevent duplicate processing
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log(`Sending message with requestId: ${requestId}...`);
      
      const response = await chatApi.sendMessage(currentMessage, language);
      const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Check if message with this ID already exists to prevent duplicates
      const botMessage: ChatMessage = {
        id: response.id,
        text: response.message,
        user: false,
        created_at: response.created_at,
        timestamp: botTimestamp,
      };
      
      setChat((current) => {
        // Prevent duplicate messages by checking ID
        const exists = current.some(msg => msg.id === response.id);
        if (exists) {
          console.log('Duplicate message detected, skipping');
          return current;
        }
        return [...current, botMessage];
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setChat((current) => [
        ...current,
        { 
          text: t('serverError') + ' (Please try again)',
          user: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  }, [isLoading, t, language]);

  const handleVoiceResult = (text: string) => {
    setMessage(text);
    messageRef.current = text;
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleWhatsApp = () => {
    setShowWhatsAppModal(true);
  };

  const handleCall = () => {
    const phoneNumber = '108';
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleSMS = () => {
    const phoneNumber = '+911234567890';
    const message = 'I need medical assistance';
    Linking.openURL(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
  };

  const analyzeSymptoms = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const result = await chatApi.analyzeSymptoms(trimmed);
      setSymptomAnalysis(result);
      setShowSymptomAnalysis(true);
    } catch (err) {
      console.error('Failed to analyze symptoms:', err);
      Alert.alert(t('error'), 'Failed to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [message, isAnalyzing, t]);

  if (isLoadingHistory) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t('loading')}...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Enhanced Specialist Profile */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.specialistAvatarContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name={selectedSpecialist.icon as any} size={28} color={colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {selectedSpecialist.name}
            </Text>
            <View style={styles.specialistMetaContainer}>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.statusText, { color: colors.success }]}>{t('online')}</Text>
              </View>
              <Text style={[styles.specialistExperience, { color: colors.textSecondary }]}>
                • 15+ years exp
              </Text>
            </View>
            <Text style={[styles.specialistDescription, { color: colors.textSecondary }]} numberOfLines={1}>
              {selectedSpecialist.description}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.background }]} onPress={handleCall}>
            <Ionicons name="call" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.background }]} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={22} color={colors.success} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.changeSpecialistButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowSpecialistModal(true)}
          >
            <Ionicons name="swap-horizontal" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Specialist Selector Modal */}
      {showSpecialistModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {t('chooseSpecialist')}
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  {SPECIALISTS.length} {t('specialistsAvailable')} • Select for consultation
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.closeIconButton, { backgroundColor: colors.background }]} 
                onPress={() => setShowSpecialistModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.specialistList} showsVerticalScrollIndicator={true}>
              {SPECIALISTS.map((specialist) => (
                <TouchableOpacity
                  key={specialist.id}
                  style={[
                    styles.specialistProfileCard,
                    selectedSpecialist.id === specialist.id && { 
                      backgroundColor: colors.primary + '10', 
                      borderColor: colors.primary,
                      borderWidth: 2 
                    },
                    { backgroundColor: colors.background, borderColor: colors.border }
                  ]}
                  onPress={() => {
                    setSelectedSpecialist(specialist);
                    setShowSpecialistModal(false);
                  }}
                >
                  {/* Avatar Section */}
                  <View style={styles.specialistProfileHeader}>
                    <View style={[
                      styles.specialistAvatarLarge,
                      { backgroundColor: colors.primary + '20' },
                      selectedSpecialist.id === specialist.id && { backgroundColor: colors.primary + '30' }
                    ]}>
                      <Ionicons 
                        name={specialist.icon as any} 
                        size={32} 
                        color={colors.primary} 
                      />
                    </View>
                    
                    <View style={styles.specialistProfileInfo}>
                      <Text style={[
                        styles.specialistProfileName,
                        { color: colors.text },
                        selectedSpecialist.id === specialist.id && { color: colors.primary }
                      ]}>
                        {specialist.name}
                      </Text>
                      
                      <View style={styles.specialistTags}>
                        <View style={[styles.specialistTag, { backgroundColor: colors.success + '20' }]}>
                          <Ionicons name="star" size={12} color={colors.success} />
                          <Text style={[styles.specialistTagText, { color: colors.success }]}>4.9</Text>
                        </View>
                        <View style={[styles.specialistTag, { backgroundColor: colors.primary + '20' }]}>
                          <Ionicons name="time" size={12} color={colors.primary} />
                          <Text style={[styles.specialistTagText, { color: colors.primary }]}>15+ yrs</Text>
                        </View>
                      </View>
                      
                      <Text style={[styles.specialistProfileDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                        {specialist.description}
                      </Text>
                    </View>
                    
                    {/* Selection Indicator */}
                    <View style={[
                      styles.selectionIndicator,
                      { borderColor: selectedSpecialist.id === specialist.id ? colors.primary : colors.border }
                    ]}>
                      {selectedSpecialist.id === specialist.id && (
                        <View style={[styles.selectionDot, { backgroundColor: colors.primary }]} />
                      )}
                    </View>
                  </View>
                  
                  {/* Availability & Action Section */}
                  <View style={styles.specialistProfileFooter}>
                    <View style={styles.availabilityContainer}>
                      <View style={[styles.availabilityDot, { backgroundColor: colors.success }]} />
                      <Text style={[styles.availabilityText, { color: colors.success }]}>
                        Available Now
                      </Text>
                      <Text style={[styles.responseTime, { color: colors.textSecondary }]}>
                        • Usually responds in 2 min
                      </Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={[
                        styles.consultButton,
                        { backgroundColor: selectedSpecialist.id === specialist.id ? colors.primary : colors.primary + '80' }
                      ]}
                      onPress={() => {
                        setSelectedSpecialist(specialist);
                        setShowSpecialistModal(false);
                      }}
                    >
                      <Text style={styles.consultButtonText}>
                        {selectedSpecialist.id === specialist.id ? 'Selected' : 'Consult'}
                      </Text>
                      <Ionicons 
                        name={selectedSpecialist.id === specialist.id ? "checkmark" : "arrow-forward"} 
                        size={16} 
                        color="#fff" 
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

        {/* Symptom Analysis Modal */}
        <Modal
          visible={showSymptomAnalysis}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSymptomAnalysis(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <View style={[styles.symptomAnalysisContainer, { backgroundColor: colors.card }]}>
              <View style={styles.symptomAnalysisHeader}>
                <Text style={[styles.symptomAnalysisTitle, { color: colors.text }]}>
                  🏥 Symptom Analysis
                </Text>
                <TouchableOpacity onPress={() => setShowSymptomAnalysis(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.symptomAnalysisContent}>
                {symptomAnalysis?.conditions?.length > 0 ? (
                  <>
                    <Text style={[styles.analysisSubtitle, { color: colors.textSecondary }]}>
                      Possible conditions based on your symptoms:
                    </Text>
                    {symptomAnalysis.conditions.map((condition: any, index: number) => (
                      <View key={index} style={[styles.conditionCard, { backgroundColor: colors.background }]}>
                        <View style={styles.conditionHeader}>
                          <Text style={[styles.conditionName, { color: colors.text }]}>
                            {condition.condition}
                          </Text>
                          <View style={[
                            styles.urgencyBadge,
                            { backgroundColor: 
                              condition.urgency?.toLowerCase() === 'high' ? colors.error :
                              condition.urgency?.toLowerCase() === 'medium' ? colors.warning || '#f59e0b' :
                              colors.success
                            }
                          ]}>
                            <Text style={styles.urgencyText}>{condition.urgency}</Text>
                          </View>
                        </View>
                        
                        <Text style={[styles.conditionSymptoms, { color: colors.textSecondary }]}>
                          <Text style={{ fontWeight: 'bold' }}>Symptoms: </Text>
                          {condition.matching_symptoms?.join(', ')}
                        </Text>
                        
                        <Text style={[styles.conditionTreatment, { color: colors.textSecondary }]}>
                          <Text style={{ fontWeight: 'bold' }}>Treatment: </Text>
                          {condition.treatment}
                        </Text>
                      </View>
                    ))}
                    
                    <View style={[styles.disclaimerCard, { backgroundColor: colors.error + '10' }]}>
                      <Ionicons name="warning" size={20} color={colors.error} />
                      <Text style={[styles.disclaimerText, { color: colors.text }]}>
                        {symptomAnalysis?.disclaimer}
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Ionicons name="search" size={48} color={colors.textSecondary} />
                    <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
                      No matching conditions found. Please consult a healthcare professional.
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* WhatsApp Integration Modal */}
        <Modal
          visible={showWhatsAppModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowWhatsAppModal(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
            <View style={[styles.comingSoonContainer, { backgroundColor: colors.card }]}>
              <View style={styles.comingSoonHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#25D366' + '20' }]}>
                  <Ionicons name="logo-whatsapp" size={40} color="#25D366" />
                </View>
                <Text style={[styles.comingSoonTitle, { color: colors.text }]}>
                  WhatsApp Integration
                </Text>
                <Text style={[styles.comingSoonSubtitle, { color: colors.textSecondary }]}>
                  Coming Soon
                </Text>
              </View>
              
              <View style={styles.statusContainer2}>
                <View style={[styles.statusBadge, { backgroundColor: colors.warning + '20' }]}>
                  <Ionicons name="time" size={16} color={colors.warning} />
                  <Text style={[styles.statusText2, { color: colors.warning }]}>
                    Under Negotiation
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={[styles.comingSoonDescription, { color: colors.textSecondary }]}>
                We are currently in discussions with WhatsApp Business API providers to bring you seamless healthcare communication directly through WhatsApp.
              </Text>

              <View style={styles.featuresList}>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                  <Text style={[styles.featureText2, { color: colors.text }]}>Instant chat with healthcare providers</Text>
                </View>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                  <Text style={[styles.featureText2, { color: colors.text }]}>Appointment reminders & notifications</Text>
                </View>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                  <Text style={[styles.featureText2, { color: colors.text }]}>Secure medical report sharing</Text>
                </View>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                  <Text style={[styles.featureText2, { color: colors.text }]}>24/7 AI health assistant access</Text>
                </View>
              </View>

              <View style={[styles.infoBox, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Expected launch: Q3 2026. Stay tuned for updates!
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowWhatsAppModal(false)}
              >
                <Text style={styles.closeButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={scrollToBottom}
        >
          {chat.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <Ionicons name="medical" size={64} color={colors.primary} />
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                {t('welcome')}
              </Text>
              <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                {t('chatWelcome')}
              </Text>
              <View style={styles.featureList}>
                {[t('chatFeature1'), t('chatFeature2'), t('chatFeature3'), t('chatFeature4')].map((feature, i) => (
                  <View key={i} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
                {t('medicalDisclaimer')}
              </Text>
            </View>
          ) : chat.length === 1 && chat[0].id === 0 ? (
            // Only show welcome message from AI, no user messages yet
            <View style={styles.welcomeContainer}>
              <Ionicons name="medical" size={48} color={colors.primary} />
              <Text style={[styles.welcomeText, { color: colors.textSecondary, marginTop: 16 }]}>
                {t('startConversation')}
              </Text>
              <View style={styles.featureList}>
                {[t('typeFever'), t('typeHeadache'), t('typeEmergency')].map((feature, i) => (
                  <View key={i} style={styles.featureItem}>
                    <Ionicons name="chatbubble" size={16} color={colors.primary} />
                    <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            chat.map((item, index) => (
              <ChatBubble
                key={item.id ? `msg-${item.id}` : `temp-${index}-${Date.now()}`}
                message={item.text}
                isUser={item.user}
                timestamp={item.timestamp}
              />
            ))
          )}

        </ScrollView>

        {/* Quick Actions */}
        <View style={[styles.quickActions, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleSMS}>
            <Ionicons name="chatbubble" size={20} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.textSecondary }]}>{t('sms')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleCall}>
            <Ionicons name="call" size={20} color={colors.error} />
            <Text style={[styles.quickActionText, { color: colors.textSecondary }]}>{t('emergency')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color={colors.success} />
            <Text style={[styles.quickActionText, { color: colors.textSecondary }]}>{t('whatsapp')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={analyzeSymptoms} disabled={isAnalyzing || !message.trim()}>
            <Ionicons name="medical" size={20} color={isAnalyzing || !message.trim() ? colors.textSecondary : colors.primary} />
            <Text style={[styles.quickActionText, { color: isAnalyzing || !message.trim() ? colors.textSecondary : colors.text }]}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <VoiceInput onResult={handleVoiceResult} />
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
            placeholder={t('typeMessage')}
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              messageRef.current = text;
            }}
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
            returnKeyType="send"
            multiline={false}
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: colors.primary },
              (!message.trim() || isLoading) && { backgroundColor: colors.border }
            ]}
            onPress={sendMessage}
            disabled={!message.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={20}
              color={message.trim() && !isLoading ? '#fff' : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  changeSpecialistButton: {
    padding: 8,
    borderRadius: 20,
  },
  specialistAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialistMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  specialistExperience: {
    fontSize: 12,
  },
  specialistDescription: {
    fontSize: 12,
    marginTop: 2,
    maxWidth: 200,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
  },
  closeIconButton: {
    padding: 8,
    borderRadius: 20,
  },
  specialistList: {
    maxHeight: 520,
  },
  specialistProfileCard: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  specialistProfileHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  specialistAvatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialistProfileInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  specialistProfileName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  specialistTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  specialistTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  specialistTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  specialistProfileDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  specialistProfileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  availabilityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  responseTime: {
    fontSize: 12,
    marginLeft: 6,
  },
  consultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  consultButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 100,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  featureList: {
    width: '100%',
    paddingHorizontal: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    marginLeft: 10,
  },
  disclaimer: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 30,
    fontStyle: 'italic',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 12,
    marginTop: 8,
  },
  typingText: {
    marginLeft: 8,
    fontSize: 13,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  quickActionBtn: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  quickActionText: {
    fontSize: 12,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  // Symptom Analysis Styles
  symptomAnalysisContainer: {
    borderRadius: 24,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  symptomAnalysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  symptomAnalysisTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  symptomAnalysisContent: {
    padding: 20,
  },
  analysisSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  conditionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conditionName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  conditionSymptoms: {
    fontSize: 13,
    marginBottom: 6,
  },
  conditionTreatment: {
    fontSize: 13,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  // WhatsApp Coming Soon Modal Styles
  comingSoonContainer: {
    borderRadius: 24,
    width: '85%',
    maxWidth: 360,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  comingSoonHeader: {
    alignItems: 'center',
    paddingTop: 28,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  comingSoonSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  statusContainer2: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusText2: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginHorizontal: 24,
    marginVertical: 16,
  },
  comingSoonDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  featuresList: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText2: {
    fontSize: 14,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  closeButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
