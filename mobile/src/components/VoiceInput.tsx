import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function VoiceInput({ onResult }: { onResult: (text: string) => void }) {
  const [recording, setRecording] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, recording ? styles.recording : null]}
        onPress={() => {
          setRecording((current) => !current);
          if (!recording) {
            onResult('Voice input started');
          } else {
            onResult('Voice input stopped');
          }
        }}
      >
        <Text style={styles.text}>{recording ? 'Stop' : 'Speak'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  recording: {
    backgroundColor: '#dc2626',
  },
  text: {
    color: '#fff',
    fontWeight: '700',
  },
});
