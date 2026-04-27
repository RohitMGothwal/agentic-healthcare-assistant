import { View, Text, StyleSheet } from 'react-native';

export default function OfflineBanner() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>You are offline. Some features may be unavailable.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f59e0b',
    padding: 10,
  },
  text: {
    color: '#111827',
    textAlign: 'center',
  },
});
