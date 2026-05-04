import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ChatBubbleProps {
  message: string;
  isUser?: boolean;
  timestamp?: string;
}

// Function to clean and format AI response text
function formatMessage(text: string): string {
  return text
    // Remove leading/trailing whitespace
    .trim()
    // Normalize multiple newlines to double newline
    .replace(/\n{3,}/g, '\n\n')
    // Ensure proper spacing after bullets
    .replace(/^(\*|\-|\•)\s*/gm, '• ')
    // Clean up any remaining markdown artifacts
    .replace(/\*\*\s*\*\*/g, '');
}

// Function to parse markdown and convert to formatted text components
function parseMarkdown(text: string): Array<{ 
  type: 'text' | 'bold' | 'italic' | 'header' | 'bullet' | 'newline'; 
  content: string 
}> {
  const parts: Array<{ type: 'text' | 'bold' | 'italic' | 'header' | 'bullet' | 'newline'; content: string }> = [];
  
  // Split by lines first to handle bullets and structure better
  const lines = text.split('\n');
  
  lines.forEach((line, lineIndex) => {
    // Add newline between lines (except first)
    if (lineIndex > 0) {
      parts.push({ type: 'newline', content: '' });
    }
    
    const trimmedLine = line.trim();
    
    // Check for bullet points (•, *, - at start)
    if (trimmedLine.match(/^[\*\-\•]\s/)) {
      const content = trimmedLine.replace(/^[\*\-\•]\s*/, '');
      // Parse bold within bullet content
      parseInlineMarkdown(content, parts, true);
    }
    // Check for headers (text surrounded by ** at start of line)
    else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
      parts.push({ 
        type: 'header', 
        content: trimmedLine.slice(2, -2).trim() 
      });
    }
    // Check for bold text at start (like **Disclaimer:**)
    else if (trimmedLine.startsWith('**')) {
      const endBold = trimmedLine.indexOf('**', 2);
      if (endBold > 2) {
        parts.push({ 
          type: 'bold', 
          content: trimmedLine.slice(2, endBold) 
        });
        const remaining = trimmedLine.slice(endBold + 2).trim();
        if (remaining) {
          parts.push({ type: 'text', content: ' ' + remaining });
        }
      } else {
        parseInlineMarkdown(trimmedLine, parts, false);
      }
    }
    // Regular line with possible inline formatting
    else {
      parseInlineMarkdown(trimmedLine, parts, false);
    }
  });
  
  return parts;
}

// Helper to parse inline markdown (bold, italic within text)
function parseInlineMarkdown(
  text: string, 
  parts: Array<{ type: 'text' | 'bold' | 'italic' | 'header' | 'bullet' | 'newline'; content: string }>,
  isBullet: boolean
) {
  const pattern = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match;
  
  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      if (beforeText) {
        parts.push({ type: 'text', content: beforeText });
      }
    }
    
    // Check which pattern matched
    if (match[1]) {
      // **bold**
      parts.push({ type: 'bold', content: match[2] });
    } else if (match[3]) {
      // *italic*
      parts.push({ type: 'italic', content: match[4] });
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining) {
      parts.push({ type: 'text', content: remaining });
    }
  }
  
  // If no matches found, add the whole text
  if (lastIndex === 0 && text) {
    parts.push({ type: 'text', content: text });
  }
}

export default function ChatBubble({ message, isUser, timestamp }: ChatBubbleProps) {
  const { colors } = useTheme();
  
  // Format and parse markdown in the message
  const formattedMessage = formatMessage(message);
  const parsedParts = parseMarkdown(formattedMessage);
  
  // Determine text color based on user/agent
  const textColor = isUser ? '#ffffff' : colors.text;

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.agentContainer]}>
      <View style={[
        styles.bubble,
        isUser 
          ? [styles.userBubble, { backgroundColor: colors.primary }] 
          : [styles.agentBubble, { backgroundColor: colors.card }]
      ]}>
        <Text style={[styles.messageText, { color: textColor }]}>
          {parsedParts.map((part, index) => {
            if (part.type === 'bold') {
              return (
                <Text key={index} style={[styles.boldText, { color: textColor }]}>
                  {part.content}
                </Text>
              );
            } else if (part.type === 'italic') {
              return (
                <Text key={index} style={[styles.italicText, { color: textColor }]}>
                  {part.content}
                </Text>
              );
            } else if (part.type === 'header') {
              return (
                <Text key={index} style={[styles.headerText, { color: textColor }]}>
                  {part.content}{'\n'}
                </Text>
              );
            } else if (part.type === 'newline') {
              return <Text key={index}>{'\n'}</Text>;
            }
            return <Text key={index} style={{ color: textColor }}>{part.content}</Text>;
          })}
        </Text>
        {timestamp && (
          <Text style={[styles.timestamp, { color: isUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
            {timestamp}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  agentContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
  },
  italicText: {
    fontStyle: 'italic',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});
