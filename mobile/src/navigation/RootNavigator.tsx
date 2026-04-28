import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import ChatScreen from '../screens/ChatScreen';
import HealthReportScreen from '../screens/HealthReportScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminAnalyticsScreen from '../screens/AdminAnalyticsScreen';
import AdminAppointmentsScreen from '../screens/AdminAppointmentsScreen';
import AdminContentScreen from '../screens/AdminContentScreen';
import AdminSystemScreen from '../screens/AdminSystemScreen';
import AdminLogsScreen from '../screens/AdminLogsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="HealthReport" component={HealthReportScreen} options={{ title: 'Health' }} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
      <Stack.Screen name="AdminAppointments" component={AdminAppointmentsScreen} />
      <Stack.Screen name="AdminContent" component={AdminContentScreen} />
      <Stack.Screen name="AdminSystem" component={AdminSystemScreen} />
      <Stack.Screen name="AdminLogs" component={AdminLogsScreen} />
    </Stack.Navigator>
  );
}
