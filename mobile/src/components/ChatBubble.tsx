import { View, Text, StyleSheet } from 'react-native';
import ThemedText from './ThemedText';

export default function ChatBubble({ message, isUser }: { message: string; isUser?: boolean }) {
  return (
    <View style={[styles.container, isUser ? styles.user : styles.agent]}>
      <ThemedText>{message}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 14,
    maxWidth: '85%',
  },
  user: {
    backgroundColor: '#2563eb',
    alignSelf: 'flex-end',
  },
  agent: {
    backgroundColor: '#1f2937',
    alignSelf: 'flex-start',
  },
});
