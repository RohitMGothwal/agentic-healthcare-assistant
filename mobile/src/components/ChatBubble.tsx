import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ChatBubbleProps {
  message: string;
  isUser?: boolean;
  timestamp?: string;
}

export default function ChatBubble({ message, isUser, timestamp }: ChatBubbleProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.agentContainer]}>
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.agentBubble,
        isDark && !isUser && styles.agentBubbleDark
      ]}>
        <Text style={[
          styles.messageText,
          isUser ? styles.userText : styles.agentText
        ]}>
          {message}
        </Text>
        {timestamp && (
          <Text style={styles.timestamp}>{timestamp}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
    maxWidth: '100%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  agentContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: 14,
    borderRadius: 20,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 4,
  },
  agentBubbleDark: {
    backgroundColor: '#1f2937',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  agentText: {
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
});
