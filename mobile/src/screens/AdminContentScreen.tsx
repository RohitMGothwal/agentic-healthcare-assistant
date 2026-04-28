import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { adminApi } from '../api/client';

interface HealthContent {
  id: number;
  title: string;
  category: string;
  content: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ['All', 'Diseases', 'Symptoms', 'Treatments', 'Prevention', 'Wellness'];

export default function AdminContentScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [contents, setContents] = useState<HealthContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    try {
      const data = await adminApi.getHealthContent();
      setContents(data);
    } catch (err) {
      console.error('Failed to load content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContents = contents.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const renderContent = ({ item }: { item: HealthContent }) => (
    <TouchableOpacity style={[styles.contentCard, isDark && styles.cardDark]}>
      <View style={styles.contentHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        
        <View style={[styles.statusBadge, item.isPublished ? styles.publishedBadge : styles.draftBadge]}>
          <Text style={styles.statusText}>
            {item.isPublished ? 'Published' : 'Draft'}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.contentTitle, isDark && styles.textLight]} numberOfLines={2}>
        {item.title}
      </Text>
      
      <Text style={styles.contentPreview} numberOfLines={2}>
        {item.content}
      </Text>
      
      <View style={styles.tagsContainer}>
        {item.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {item.tags.length > 3 && (
          <Text style={styles.moreTags}>+{item.tags.length - 3} more</Text>
        )}
      </View>
      
      <View style={styles.contentFooter}>
        <Text style={styles.dateText}>
          Updated: {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={18} color="#3b82f6" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Diseases': '#ef4444',
      'Symptoms': '#f59e0b',
      'Treatments': '#10b981',
      'Prevention': '#3b82f6',
      'Wellness': '#8b5cf6',
    };
    return colors[category] || '#64748b';
  };

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
          Content Management
        </Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, isDark && styles.searchBoxDark]}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={[styles.searchInput, isDark && styles.textLight]}
            placeholder="Search content..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryTab,
                selectedCategory === cat && styles.categoryTabActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  selectedCategory === cat && styles.categoryTabTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content List */}
      <FlatList
        data={filteredContents}
        renderItem={renderContent}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No content found</Text>
          </View>
        }
      />

      {/* Add Content Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.textLight]}>
                Add New Content
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalPlaceholder}>
              Content creation form would go here...
            </Text>
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
  categoryContainer: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: '#3b82f6',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  contentCard: {
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
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  publishedBadge: {
    backgroundColor: '#d1fae5',
  },
  draftBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  contentTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  contentPreview: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#4338ca',
  },
  moreTags: {
    fontSize: 12,
    color: '#94a3b8',
    alignSelf: 'center',
  },
  contentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  editButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#dbeafe',
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
    minHeight: 400,
  },
  modalContentDark: {
    backgroundColor: '#1f2937',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalPlaceholder: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
  },
  textLight: {
    color: '#f1f5f9',
  },
});
