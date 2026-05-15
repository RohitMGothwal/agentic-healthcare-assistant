import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '../components/Icon';
import { View, Text } from 'react-native';
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
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom tab bar icon component with label
function TabIcon({ icon, label, focused, colors }: { icon: string; label: string; focused: boolean; colors: any }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 8 }}>
      <Ionicons
        name={icon as any}
        size={focused ? 26 : 22}
        color={focused ? colors.primary : colors.textSecondary}
      />
      <Text
        style={{
          fontSize: 11,
          marginTop: 2,
          color: focused ? colors.primary : colors.textSecondary,
          fontWeight: focused ? '600' : '400',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 70,
          paddingBottom: 10,
          elevation: 8,
          shadowColor: isDark ? '#000' : '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      {/* OPTION C - Mixed Style (Dashboard filled, others outlined) */}
      <Tab.Screen
        name="HealthReport"
        component={HealthReportScreen}
        options={{
          title: t('healthReport'),
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? "heart" : "heart-outline"} label={t('healthReport')} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? "chatbubble" : "chatbubble-outline"} label={t('chat')} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="grid" label={t('dashboard')} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? "calendar" : "calendar-outline"} label={t('appointments')} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? "settings" : "settings-outline"} label={t('settings')} focused={focused} colors={colors} />
          ),
        }}
      />
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
