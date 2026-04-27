import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import ThemedText from '../components/ThemedText';

const screenWidth = Dimensions.get('window').width - 32;

export default function HealthReportScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText style={styles.title}>Health Report</ThemedText>
        <View style={styles.chartCard}>
          <LineChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
              datasets: [{ data: [72, 75, 70, 74, 76, 73] }],
            }}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#0a0f1e',
  backgroundGradientTo: '#0a0f1e',
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
  propsForDots: { r: '6', strokeWidth: '2', stroke: '#3b82f6' },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  content: { padding: 16 },
  title: { fontSize: 28, marginBottom: 16 },
  chartCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 16,
  },
  chart: { borderRadius: 16 },
});
