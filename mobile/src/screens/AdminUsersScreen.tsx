import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { adminApi } from '../api/client';

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  last_login?: string;
}

export default function AdminUsersScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'admin'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await adminApi.updateUser(user.id, { is_active: !user.is_active });
      loadUsers();
    } catch (err) {
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const handleToggleAdmin = async (user: User) => {
    try {
      await adminApi.updateUser(user.id, { is_admin: !user.is_admin });
      loadUsers();
    } catch (err) {
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteUser(user.id);
              loadUsers();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'active') return matchesSearch && user.is_active;
    if (filter === 'admin') return matchesSearch && user.is_admin;
    return matchesSearch;
  });

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userCard, isDark && styles.cardDark]}
      onPress={() => {
        setSelectedUser(item);
        setShowUserModal(true);
      }}
    >
      <View style={styles.userHeader}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, isDark && styles.textLight]}>
            {item.username}
          </Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        
        <View style={styles.userBadges}>
          {item.is_admin && (
            <View style={styles.adminBadge}>
              <Text style={styles.badgeText}>ADMIN</Text>
            </View>
          )}
          {!item.is_active && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.badgeText}>INACTIVE</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.userFooter}>
        <Text style={styles.userDate}>
          Joined: {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <Text style={[styles.headerTitle, isDark && styles.textLight]}>
          User Management
        </Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, isDark && styles.searchBoxDark]}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={[styles.searchInput, isDark && styles.textLight]}
            placeholder="Search users..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'active', 'admin'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === f && styles.filterTabTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />

      {/* User Detail Modal */}
      <Modal
        visible={showUserModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            {selectedUser && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>
                      {selectedUser.username[0].toUpperCase()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowUserModal(false)}
                  >
                    <Ionicons name="close" size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalUserName, isDark && styles.textLight]}>
                  {selectedUser.username}
                </Text>
                <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>

                <View style={styles.userStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Status</Text>
                    <Text
                      style={[
                        styles.statValue,
                        { color: selectedUser.is_active ? '#10b981' : '#ef4444' },
                      ]}
                    >
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Role</Text>
                    <Text
                      style={[
                        styles.statValue,
                        { color: selectedUser.is_admin ? '#8b5cf6' : '#3b82f6' },
                      ]}
                    >
                      {selectedUser.is_admin ? 'Admin' : 'User'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: selectedUser.is_active ? '#fef2f2' : '#f0fdf4' },
                    ]}
                    onPress={() => handleToggleActive(selectedUser)}
                  >
                    <Ionicons
                      name={selectedUser.is_active ? 'ban' : 'checkmark-circle'}
                      size={20}
                      color={selectedUser.is_active ? '#ef4444' : '#10b981'}
                    />
                    <Text
                      style={[
                        styles.actionButtonText,
                        { color: selectedUser.is_active ? '#ef4444' : '#10b981' },
                      ]}
                    >
                      {selectedUser.is_active ? 'Deactivate' : 'Activate'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: selectedUser.is_admin ? '#fef2f2' : '#f5f3ff' },
                    ]}
                    onPress={() => handleToggleAdmin(selectedUser)}
                  >
                    <Ionicons
                      name={selectedUser.is_admin ? 'remove-circle' : 'shield-checkmark'}
                      size={20}
                      color={selectedUser.is_admin ? '#ef4444' : '#8b5cf6'}
                    />
                    <Text
                      style={[
                        styles.actionButtonText,
                        { color: selectedUser.is_admin ? '#ef4444' : '#8b5cf6' },
                      ]}
                    >
                      {selectedUser.is_admin ? 'Remove Admin' : 'Make Admin'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => {
                      setShowUserModal(false);
                      handleDeleteUser(selectedUser);
                    }}
                  >
                    <Ionicons name="trash" size={20} color="#fff" />
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>
                      Delete User
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0a0f1e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerDark: {
    backgroundColor: '#111827',
    borderBottomColor: '#1f2937',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchBoxDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1e293b',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1f2937',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  userBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  adminBadge: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inactiveBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  userFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  userDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalContentDark: {
    backgroundColor: '#1f2937',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
  },
  modalUserName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  modalUserEmail: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    marginTop: 8,
  },
  textLight: {
    color: '#f1f5f9',
  },
});
