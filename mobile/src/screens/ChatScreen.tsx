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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChatBubble from '../components/ChatBubble';
import VoiceInput from '../components/VoiceInput';
import { useTheme } from '../hooks/useTheme';
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

const SPECIALISTS: Specialist[] = [
  { id: 'general', name: 'General Physician', icon: 'medical', description: 'Primary healthcare consultation' },
  { id: 'cardiologist', name: 'Cardiologist', icon: 'heart', description: 'Heart-related issues' },
  { id: 'dermatologist', name: 'Dermatologist', icon: 'body', description: 'Skin conditions' },
  { id: 'neurologist', name: 'Neurologist', icon: 'brain', description: 'Brain & nervous system' },
  { id: 'pediatrician', name: 'Pediatrician', icon: 'happy', description: 'Child healthcare' },
  { id: 'gynecologist', name: 'Gynecologist', icon: 'woman', description: 'Women\'s health' },
];

export default function ChatScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist>(SPECIALISTS[0]);
  const [showSpecialistModal, setShowSpecialistModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
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
      setChat(formattedHistory);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const sendMessage = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Optimistically add user message
    const userMessage: ChatMessage = { 
      text: trimmed, 
      user: true,
      timestamp,
    };
    setChat((current) => [...current, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(trimmed);
      const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const botMessage: ChatMessage = {
        id: response.id,
        text: response.message,
        user: false,
        created_at: response.created_at,
        timestamp: botTimestamp,
      };
      setChat((current) => [...current, botMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setChat((current) => [
        ...current,
        { 
          text: 'Sorry, I encountered an error. Please try again or contact support if the issue persists.',
          user: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [message, isLoading]);

  const handleVoiceResult = (text: string) => {
    setMessage(text);
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleWhatsApp = () => {
    const phoneNumber = '+911234567890';
    const message = 'Hello, I need medical assistance';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('WhatsApp not installed', 'Please install WhatsApp to use this feature');
        }
      })
      .catch((err) => console.error('Error opening WhatsApp:', err));
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

  if (isLoadingHistory) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={[styles.loadingText, isDark && styles.textLight]}>
            Loading your health assistant...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: 'https://via.placeholder.com/40/3b82f6/ffffff?text=AI' }}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, isDark && styles.textLight]}>
              {selectedSpecialist.name}
            </Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleCall}>
            <Ionicons name="call" size={22} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={22} color="#10b981" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.specialistButton}
            onPress={() => setShowSpecialistModal(true)}
          >
            <Ionicons name="medical" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Specialist Selector Modal */}
      {showSpecialistModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, isDark && styles.textLight]}>
              Choose Specialist
            </Text>
            <ScrollView style={styles.specialistList}>
              {SPECIALISTS.map((specialist) => (
                <TouchableOpacity
                  key={specialist.id}
                  style={[
                    styles.specialistCard,
                    selectedSpecialist.id === specialist.id && styles.selectedSpecialist,
                  ]}
                  onPress={() => {
                    setSelectedSpecialist(specialist);
                    setShowSpecialistModal(false);
                  }}
                >
                  <Ionicons 
                    name={specialist.icon as any} 
                    size={24} 
                    color={selectedSpecialist.id === specialist.id ? '#fff' : '#3b82f6'} 
                  />
                  <View style={styles.specialistInfo}>
                    <Text style={[
                      styles.specialistName,
                      selectedSpecialist.id === specialist.id && styles.selectedText,
                      isDark && styles.textLight,
                    ]}>
                      {specialist.name}
                    </Text>
                    <Text style={styles.specialistDesc}>{specialist.description}</Text>
                  </View>
                  {selectedSpecialist.id === specialist.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSpecialistModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
              <Ionicons name="medical" size={64} color="#3b82f6" />
              <Text style={[styles.welcomeTitle, isDark && styles.textLight]}>
                Welcome to Agentic Health
              </Text>
              <Text style={[styles.welcomeText, isDark && styles.textMuted]}>
                I'm your AI healthcare assistant. I can help you with:
              </Text>
              <View style={styles.featureList}>
                {['Symptom checking', 'Health education', 'Vaccination info', 'Emergency guidance'].map((feature, i) => (
                  <View key={i} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <Text style={[styles.featureText, isDark && styles.textLight]}>{feature}</Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.disclaimer, isDark && styles.textMuted]}>
                Note: This is not a substitute for professional medical advice.
              </Text>
            </View>
          ) : (
            chat.map((item, index) => (
              <ChatBubble
                key={item.id || index}
                message={item.text}
                isUser={item.user}
                timestamp={item.timestamp}
              />
            ))
          )}
          {isLoading && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={[styles.typingText, isDark && styles.textMuted]}>
                AI is typing...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Quick Actions */}
        <View style={[styles.quickActions, isDark && styles.quickActionsDark]}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleSMS}>
            <Ionicons name="chatbubble" size={20} color="#3b82f6" />
            <Text style={styles.quickActionText}>SMS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#ef4444" />
            <Text style={styles.quickActionText}>Emergency</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color="#10b981" />
            <Text style={styles.quickActionText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* Voice Input */}
        <VoiceInput onResult={handleVoiceResult} />

        {/* Input Area */}
        <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
          <TextInput
            style={[styles.textInput, isDark && styles.textInputDark]}
            placeholder="Type your health question..."
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={sendMessage}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!message.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={20}
              color={message.trim() && !isLoading ? '#fff' : '#9ca3af'}
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
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0a0f1e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerDark: {
    backgroundColor: '#111827',
    borderBottomColor: '#1f2937',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
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
    color: '#10b981',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  specialistButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalContentDark: {
    backgroundColor: '#1f2937',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1e293b',
  },
  specialistList: {
    maxHeight: 400,
  },
  specialistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedSpecialist: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  specialistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  specialistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  selectedText: {
    color: '#fff',
  },
  specialistDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  closeButton: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
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
    color: '#1e293b',
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748b',
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
    color: '#374151',
  },
  disclaimer: {
    fontSize: 13,
    color: '#94a3b8',
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
    color: '#64748b',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  quickActionsDark: {
    backgroundColor: '#111827',
    borderTopColor: '#1f2937',
  },
  quickActionBtn: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  quickActionText: {
    fontSize: 12,
    marginTop: 4,
    color: '#64748b',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  inputContainerDark: {
    backgroundColor: '#111827',
    borderTopColor: '#1f2937',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
    maxHeight: 100,
  },
  textInputDark: {
    backgroundColor: '#1f2937',
    color: '#f1f5f9',
  },
  sendButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#e2e8f0',
    shadowOpacity: 0,
  },
  textLight: {
    color: '#f1f5f9',
  },
  textMuted: {
    color: '#94a3b8',
  },
});
