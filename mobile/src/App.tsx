import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView, StatusBar } from 'react-native';
import RootNavigator from './navigation/RootNavigator';
import { AuthProvider } from './hooks/useAuth';
import { useNotifications } from './hooks/useNotifications';
import './i18n';

function AppContent() {
  useNotifications();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0f1e' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
