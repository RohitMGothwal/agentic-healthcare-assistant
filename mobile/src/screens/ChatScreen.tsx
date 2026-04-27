import { useState } from 'react';
import { Button, SafeAreaView, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import ChatBubble from '../components/ChatBubble';
import VoiceInput from '../components/VoiceInput';
import OfflineBanner from '../components/OfflineBanner';
import ThemedText from '../components/ThemedText';
import { useOfflineQueue } from '../hooks/useOfflineQueue';

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<Array<{ text: string; user: boolean }>>([]);
  const { isConnected } = useOfflineQueue();

  const send = () => {
    if (!message.trim()) return;
    setChat((current) => [...current, { text: message, user: true }]);
    setChat((current) => [...current, { text: `Bot reply to: ${message}`, user: false }]);
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isConnected && <OfflineBanner />}
      <ScrollView contentContainerStyle={styles.chatList}>
        {chat.map((item, index) => (
          <ChatBubble key={index} message={item.text} isUser={item.user} />
        ))}
      </ScrollView>
      <VoiceInput onResult={(text) => setMessage(text)} />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message"
          placeholderTextColor="#94a3b8"
          value={message}
          onChangeText={setMessage}
        />
        <Button title="Send" onPress={send} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  chatList: { padding: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8 },
  textInput: {
    flex: 1,
    backgroundColor: '#111827',
    color: '#fff',
    borderRadius: 12,
    padding: 12,
  },
});
