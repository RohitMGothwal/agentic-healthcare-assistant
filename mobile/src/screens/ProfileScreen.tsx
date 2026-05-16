import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '../components/Icon';
import ThemedText from '../components/ThemedText';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Login' as never);
  };

  const menuItems = [
    { id: '1', icon: 'person-outline', title: t('editProfile'), subtitle: t('updatePersonalInfo') },
    { id: '2', icon: 'notifications-outline', title: t('notifications'), subtitle: t('manageNotifications') },
    { id: '3', icon: 'lock-closed-outline', title: t('privacy'), subtitle: t('privacySettings') },
    { id: '4', icon: 'language-outline', title: t('language'), subtitle: t('changeLanguage') },
    { id: '5', icon: 'help-circle-outline', title: t('helpSupport'), subtitle: t('getHelp') },
    { id: '6', icon: 'information-circle-outline', title: t('about'), subtitle: t('appVersion') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Back Button */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{t('profile')}</ThemedText>
        <ThemedText style={styles.headerSubtitle}>{t('manageYourAccount')}</ThemedText>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="person" size={48} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.userName}>{user?.username || t('guest')}</ThemedText>
            <ThemedText style={[styles.userEmail, { color: colors.textSecondary }]}>
              {user?.email || 'user@example.com'}
            </ThemedText>
            <View style={[styles.roleBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.roleText, { color: colors.primary }]}>
                {(user?.role || 'patient').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Details Section */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{t('personalDetails')}</ThemedText>
          
          <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
            <DetailRow icon="calendar-outline" label={t('dateOfBirth')} value="01/01/1990" colors={colors} />
            <DetailRow icon="male-female-outline" label={t('gender')} value={t('notSpecified')} colors={colors} />
            <DetailRow icon="call-outline" label={t('phone')} value={t('notProvided')} colors={colors} />
            <DetailRow icon="location-outline" label={t('address')} value={t('notProvided')} colors={colors} />
            <DetailRow icon="fitness-outline" label={t('bloodType')} value={t('notSpecified')} colors={colors} last />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{t('settings')}</ThemedText>
          
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { backgroundColor: colors.card }]}
              onPress={() => {}}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name={item.icon as any} size={22} color={colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
                <ThemedText style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                  {item.subtitle}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#ef4444' + '15' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <ThemedText style={[styles.logoutText, { color: '#ef4444' }]}>{t('logout')}</ThemedText>
        </TouchableOpacity>

        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
            Agentic Health v1.0.0
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, value, colors, last = false }: { 
  icon: string; 
  label: string; 
  value: string; 
  colors: any; 
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.border + '30' }]}>
      <View style={styles.detailLeft}>
        <Ionicons name={icon as any} size={20} color={colors.primary} style={styles.detailIcon} />
        <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
      </View>
      <ThemedText style={[styles.detailValue, { color: colors.text }]}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginBottom: 12,
    padding: 8,
    marginLeft: -8,
    alignSelf: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  detailsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
