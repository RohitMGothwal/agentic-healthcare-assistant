import { useState, useEffect, useCallback } from 'react';
import { Button, SafeAreaView, ScrollView, StyleSheet, TextInput, View, ActivityIndicator } from 'react-native';
import ChatBubble from '../components/ChatBubble';
import VoiceInput from '../components/VoiceInput';
import OfflineBanner from '../components/OfflineBanner';
import ThemedText from '../components/ThemedText';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { chatApi } from '../api/client';

type ChatMessage = {
  id?: number;
  text: string;
  user: boolean;
  created_at?: string;
};

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const { isConnected } = useOfflineQueue();

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
      }));
      setChat(formattedHistory);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const send = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    // Optimistically add user message
    const userMessage: ChatMessage = { text: trimmed, user: true };
    setChat((current) => [...current, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(trimmed);
      // Add bot response
      const botMessage: ChatMessage = {
        id: response.id,
        text: response.message,
        user: false,
        created_at: response.created_at,
      };
      setChat((current) => [...current, botMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Add error message
      setChat((current) => [
        ...current,
        { text: 'Sorry, failed to send message. Please try again.', user: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [message]);

  return (
    <SafeAreaView style={styles.container}>
      {!isConnected && <OfflineBanner />}
      {isLoadingHistory ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#3b82f6" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.chatList}>
          {chat.length === 0 && (
            <ThemedText style={styles.emptyText}>
              Start a conversation with your healthcare assistant
            </ThemedText>
          )}
          {chat.map((item, index) => (
            <ChatBubble key={item.id || index} message={item.text} isUser={item.user} />
          ))}
          {isLoading && <ActivityIndicator color="#3b82f6" style={styles.loadingIndicator} />}
        </ScrollView>
      )}
      <VoiceInput onResult={(text) => setMessage(text)} />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message"
          placeholderTextColor="#94a3b8"
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={send}
          editable={!isLoading}
        />
        <Button title="Send" onPress={send} disabled={isLoading || !message.trim()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  chatList: { padding: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  textInput: {
    flex: 1,
    backgroundColor: '#111827',
    color: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
  },
});
