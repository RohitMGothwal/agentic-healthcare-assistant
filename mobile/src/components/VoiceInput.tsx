import { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

interface VoiceInputProps {
  onResult: (text: string) => void;
  isListening?: boolean;
}

export default function VoiceInput({ onResult, isListening = false }: VoiceInputProps) {
  const [recording, setRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [recording]);

  const requestAudioPermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permission:', error);
      return false;
    }
  };

  const startRecording = async () => {
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant microphone permission to use voice input.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setRecording(true);
      setIsProcessing(true);
      
      // Simulate voice recognition with a delay
      // In production, you would use a speech-to-text API like:
      // - Google Cloud Speech-to-Text
      // - Azure Speech Services
      // - OpenAI Whisper API
      
      setTimeout(() => {
        setRecording(false);
        setIsProcessing(false);
        // Mock result - replace with actual speech recognition
        onResult('I have a headache and fever');
      }, 3000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecording(false);
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to start voice recording. Please try again.');
    }
  };

  const stopRecording = () => {
    setRecording(false);
    setIsProcessing(false);
  };

  const speakText = (text: string) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1,
      rate: 0.9,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.voiceContainer}>
        {recording && (
          <View style={styles.waveform}>
            {[...Array(5)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  { 
                    height: 20 + Math.random() * 30,
                    backgroundColor: '#ef4444',
                  }
                ]}
              />
            ))}
          </View>
        )}
        
        <Pressable
          style={[styles.button, recording ? styles.recording : null]}
          onPress={recording ? stopRecording : startRecording}
          disabled={isProcessing && !recording}
        >
          {isProcessing && !recording ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.text}>
              {recording ? '⏹ Stop' : '🎤 Speak'}
            </Text>
          )}
        </Pressable>
        
        {recording && (
          <Text style={styles.duration}>
            Recording: {recordingDuration}s
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  voiceContainer: {
    alignItems: 'center',
    width: '100%',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginBottom: 12,
    gap: 4,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  recording: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  duration: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 14,
  },
});
