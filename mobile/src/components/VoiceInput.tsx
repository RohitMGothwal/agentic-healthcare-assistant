import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from './Icon';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import Voice from '@react-native-voice/voice';

const { height } = Dimensions.get('window');

interface VoiceInputProps {
  onResult: (text: string) => void;
}

// Supported languages for speech recognition
const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English', nameKey: 'english' },
  { code: 'hi-IN', name: 'Hindi', nameKey: 'hindi' },
  { code: 'es-ES', name: 'Spanish', nameKey: 'spanish' },
  { code: 'fr-FR', name: 'French', nameKey: 'french' },
  { code: 'de-DE', name: 'German', nameKey: 'german' },
  { code: 'zh-CN', name: 'Chinese', nameKey: 'chinese' },
  { code: 'ar-SA', name: 'Arabic', nameKey: 'arabic' },
  { code: 'pt-BR', name: 'Portuguese', nameKey: 'portuguese' },
  { code: 'ru-RU', name: 'Russian', nameKey: 'russian' },
  { code: 'ja-JP', name: 'Japanese', nameKey: 'japanese' },
  { code: 'ko-KR', name: 'Korean', nameKey: 'korean' },
  { code: 'it-IT', name: 'Italian', nameKey: 'italian' },
];

export default function VoiceInput({ onResult }: VoiceInputProps) {
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  
  const [isVisible, setIsVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveformAnims = useRef([...Array(7)].map(() => new Animated.Value(0))).current;

  // Initialize Voice
  useEffect(() => {
    const initVoice = async () => {
      try {
        const isAvailable = await Voice.isAvailable();
        setIsAvailable(isAvailable);
        
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;
        Voice.onSpeechPartialResults = onSpeechPartialResults;
      } catch (e) {
        console.error('Voice init error:', e);
        setIsAvailable(false);
      }
    };
    
    initVoice();
    
    return () => {
      Voice.destroy().catch(() => {});
    };
  }, []);

  // Set default language based on app language
  useEffect(() => {
    const langMap: { [key: string]: string } = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'zh': 'zh-CN',
      'ar': 'ar-SA',
      'pt': 'pt-BR',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'it': 'it-IT',
    };
    const defaultLang = langMap[language] || 'en-US';
    setSelectedLanguage(defaultLang);
  }, [language]);

  // Pulse animation for mic
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Start waveform animation
      startWaveformAnimation();
    } else {
      pulseAnim.setValue(1);
      stopWaveformAnimation();
    }
  }, [isListening]);

  const startWaveformAnimation = () => {
    waveformAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 300 + index * 50,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300 + index * 50,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const stopWaveformAnimation = () => {
    waveformAnims.forEach(anim => {
      anim.stopAnimation();
      anim.setValue(0);
    });
  };

  const onSpeechStart = () => {
    setIsListening(true);
    setError(null);
  };

  const onSpeechEnd = () => {
    setIsListening(false);
  };

  const onSpeechResults = (e: any) => {
    const text = e.value?.[0] || '';
    setRecognizedText(text);
    setIsListening(false);
  };

  const onSpeechPartialResults = (e: any) => {
    const text = e.value?.[0] || '';
    setRecognizedText(text);
  };

  const onSpeechError = (e: any) => {
    console.error('Speech error:', e);
    setIsListening(false);
    if (e.error?.message?.includes('network')) {
      setError('Network error. Please check your connection.');
    } else if (e.error?.message?.includes('permission')) {
      setError('Microphone permission denied.');
    } else {
      setError('Speech recognition error. Please try again.');
    }
  };

  const openModal = () => {
    setIsVisible(true);
    setRecognizedText('');
    setError(null);
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    if (isListening) {
      stopListening();
    }
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      setRecognizedText('');
      setError(null);
    });
  };

  const startListening = async () => {
    try {
      setError(null);
      setRecognizedText('');
      await Voice.start(selectedLanguage);
    } catch (e) {
      console.error('Start listening error:', e);
      setError('Failed to start listening. Please try again.');
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error('Stop listening error:', e);
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSend = () => {
    if (recognizedText.trim()) {
      onResult(recognizedText.trim());
      closeModal();
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  const getLanguageName = (code: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? lang.name : code;
  };

  const getLanguageFlag = (code: string) => {
    const flags: { [key: string]: string } = {
      'en-US': '🇺🇸',
      'hi-IN': '🇮🇳',
      'es-ES': '🇪🇸',
      'fr-FR': '🇫🇷',
      'de-DE': '🇩🇪',
      'zh-CN': '🇨🇳',
      'ar-SA': '🇸🇦',
      'pt-BR': '🇧🇷',
      'ru-RU': '🇷🇺',
      'ja-JP': '🇯🇵',
      'ko-KR': '🇰🇷',
      'it-IT': '🇮🇹',
    };
    return flags[code] || '🌐';
  };

  if (!isAvailable) {
    return (
      <TouchableOpacity
        style={[styles.micButton, { backgroundColor: colors.border }]}
        disabled={true}
      >
        <Ionicons name="mic-off" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  }

  return (
    <>
      {/* Mic Button in Input Bar */}
      <TouchableOpacity
        style={[styles.micButton, { backgroundColor: colors.primary + '20' }]}
        onPress={openModal}
        activeOpacity={0.7}
      >
        <Ionicons name="mic" size={24} color={colors.primary} />
        <View style={[styles.langIndicator, { backgroundColor: colors.primary }]}>
          <Text style={styles.langIndicatorText}>
            {getLanguageFlag(selectedLanguage)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      {isVisible && (
        <View style={styles.modalContainer}>
          {/* Backdrop */}
          <Animated.View
            style={[
              styles.backdrop,
              { opacity: fadeAnim, backgroundColor: 'rgba(0,0,0,0.5)' },
            ]}
          >
            <TouchableOpacity style={styles.backdropTouch} onPress={handleCancel} />
          </Animated.View>

          {/* Bottom Sheet */}
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY: slideAnim }],
                backgroundColor: colors.card,
              },
            ]}
          >
            {/* Handle Bar */}
            <View style={styles.handleBar}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                {isListening ? t('listening') || 'Listening...' : t('tapToSpeak') || 'Tap to Speak'}
              </Text>
              
              {/* Language Selector Button */}
              <TouchableOpacity
                style={[styles.langButton, { borderColor: colors.border, backgroundColor: colors.background }]}
                onPress={() => setShowLanguageSelector(!showLanguageSelector)}
              >
                <Text style={styles.langFlag}>{getLanguageFlag(selectedLanguage)}</Text>
                <Text style={[styles.langText, { color: colors.text }]}>
                  {getLanguageName(selectedLanguage)}
                </Text>
                <Ionicons
                  name={showLanguageSelector ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Language Selector Dropdown */}
            {showLanguageSelector && (
              <View style={[styles.langSelector, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.langOption,
                        selectedLanguage === lang.code && {
                          backgroundColor: colors.primary + '20',
                          borderColor: colors.primary,
                        },
                        { borderColor: colors.border },
                      ]}
                      onPress={() => {
                        setSelectedLanguage(lang.code);
                        setShowLanguageSelector(false);
                      }}
                    >
                      <Text style={styles.langOptionFlag}>{getLanguageFlag(lang.code)}</Text>
                      <Text style={[styles.langOptionText, { color: colors.text }]}>
                        {lang.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}

            {/* Waveform Visualization */}
            {isListening && (
              <View style={styles.waveformContainer}>
                {waveformAnims.map((anim, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.waveBar,
                      {
                        backgroundColor: colors.primary,
                        transform: [
                          {
                            scaleY: anim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.3, 1],
                            }),
                          },
                        ],
                        height: 20 + index * 8,
                      },
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Recognized Text Preview */}
            {recognizedText ? (
              <View style={[styles.textPreview, { backgroundColor: colors.background }]}>
                <Text style={[styles.previewText, { color: colors.text }]} numberOfLines={3}>
                  {recognizedText}
                </Text>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                  {t('speakNow') || 'Speak now...'}
                </Text>
              </View>
            )}

            {/* Mic Button */}
            <View style={styles.micContainer}>
              <Animated.View
                style={[
                  styles.micPulse,
                  {
                    transform: [{ scale: pulseAnim }],
                    backgroundColor: isListening ? colors.error + '30' : colors.primary + '30',
                  },
                ]}
              />
              <TouchableOpacity
                style={[
                  styles.micLarge,
                  {
                    backgroundColor: isListening ? colors.error : colors.primary,
                    shadowColor: isListening ? colors.error : colors.primary,
                  },
                ]}
                onPress={toggleListening}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isListening ? 'stop' : 'mic'}
                  size={32}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleCancel}
              >
                <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                  {t('cancel') || 'Cancel'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.sendButton,
                  {
                    backgroundColor: recognizedText.trim() ? colors.primary : colors.border,
                  },
                ]}
                onPress={handleSend}
                disabled={!recognizedText.trim()}
              >
                <Text style={[styles.sendText, { color: recognizedText.trim() ? '#fff' : colors.textSecondary }]}>
                  {t('send') || 'Send'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  langIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  langIndicatorText: {
    fontSize: 10,
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropTouch: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  langFlag: {
    fontSize: 16,
  },
  langText: {
    fontSize: 14,
    fontWeight: '500',
  },
  langSelector: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
  },
  langOptionFlag: {
    fontSize: 18,
  },
  langOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginBottom: 20,
    gap: 6,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
  },
  textPreview: {
    minHeight: 80,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    justifyContent: 'center',
  },
  previewText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  placeholderContainer: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 16,
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    height: 100,
  },
  micPulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  micLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  sendButton: {
    backgroundColor: '#2563eb',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sendText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
