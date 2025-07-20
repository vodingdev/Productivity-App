import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { FocusItem, storage } from '@/utils/storage';
import { FocusCard } from '@/components/FocusCard';
import { FocusModal } from '@/components/modals/FocusModal';
import { Plus, Target, Calendar, Clock, TrendingUp, Filter } from 'lucide-react-native';

type FocusPeriod = 'all' | 'today' | 'tomorrow' | 'this-week' | 'this-month' | 'this-quarter' | 'this-year' | 'custom';

export default function FocusScreen() {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const insets = useSafeAreaInsets();
  const [focusItems, setFocusItems] = useState<FocusItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FocusItem | undefined>();
  const [selectedPeriod, setSelectedPeriod] = useState<FocusPeriod>('all');
  const [tags, setTags] = useState<string[]>([]);

  const loadFocusItems = async () => {
    const [loadedItems, loadedTags] = await Promise.all([
      storage.getFocusItems(),
      storage.getTags()
    ]);
    setFocusItems(loadedItems.sort((a, b) => {
      // Sort by priority first, then by creation date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }));
    setTags(loadedTags);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadFocusItems();
    }, [])
  );

  const handleSaveItem = async (itemData: Omit<FocusItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    let updatedItems: FocusItem[];
    
    if (editingItem) {
      updatedItems = focusItems.map(item =>
        item.id === editingItem.id
          ? { 
              ...item, 
              ...itemData, 
              updatedAt: now 
            }
          : item
      );
    } else {
      const newItem: FocusItem = {
        id: Date.now().toString(),
        ...itemData,
        createdAt: now,
        updatedAt: now,
      };
      updatedItems = [...focusItems, newItem];
    }
    
    setFocusItems(updatedItems.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }));
    await storage.saveFocusItems(updatedItems);
    setEditingItem(undefined);
  };

  const handleDeleteItem = async (itemId: string) => {
    const updatedItems = focusItems.filter(item => item.id !== itemId);
    setFocusItems(updatedItems);
    await storage.saveFocusItems(updatedItems);
  };

  const handleToggleComplete = async (itemId: string) => {
    const updatedItems = focusItems.map(item =>
      item.id === itemId 
        ? { ...item, completed: !item.completed, updatedAt: new Date().toISOString() } 
        : item
    );
    setFocusItems(updatedItems);
    await storage.saveFocusItems(updatedItems);
  };

  const handleAddTag = async (newTag: string) => {
    if (!tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      await storage.saveTags(updatedTags);
    }
  };

  const getFilteredItems = () => {
    if (selectedPeriod === 'all') return focusItems;
    return focusItems.filter(item => item.period === selectedPeriod);
  };

  const getPeriodLabel = (period: FocusPeriod) => {
    switch (period) {
      case 'all': return 'All';
      case 'today': return 'Today';
      case 'tomorrow': return 'Tomorrow';
      case 'this-week': return 'This Week';
      case 'this-month': return 'This Month';
      case 'this-quarter': return 'This Quarter';
      case 'this-year': return 'This Year';
      case 'custom': return 'Custom';
      default: return 'All';
    }
  };

  const getStats = () => {
    const filtered = getFilteredItems();
    const completed = filtered.filter(item => item.completed).length;
    const highPriority = filtered.filter(item => item.priority === 'high' && !item.completed).length;
    return { total: filtered.length, completed, highPriority };
  };

  const filteredItems = getFilteredItems();
  const stats = getStats();

  const periodFilters: FocusPeriod[] = ['all', 'today', 'tomorrow', 'this-week', 'this-month', 'this-quarter', 'this-year'];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'web' ? 20 : 60,
      paddingHorizontal: 24,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: Typography['4xl'],
      fontFamily: Typography.family.display,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      marginBottom: Spacing.lg,
      letterSpacing: -1.5,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    statsContainer: {
      flexDirection: 'row',
      marginTop: 20,
      gap: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
    },
    statIcon: {
      marginBottom: 8,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    filterContainer: {
      backgroundColor: colors.background,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    filterScroll: {
      paddingHorizontal: 24,
      gap: 12,
    },
    periodButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 24,
      marginRight: 12,
      borderWidth: 1,
    },
    periodButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    periodButtonInactive: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    periodText: {
      fontSize: 14,
      fontWeight: '500',
    },
    periodTextActive: {
      color: colors.background,
    },
    periodTextInactive: {
      color: colors.textSecondary,
    },
    content: {
      flex: 1,
    },
    stickyHeader: {
      position: 'sticky',
      top: 0,
      zIndex: 10,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    contentHeader: {
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    contentTitle: {
      fontSize: Typography['2xl'],
      fontFamily: Typography.family.displayBold,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      marginBottom: 4,
    },
    contentSubtitle: {
      fontSize: Typography.base,
      color: colors.textSecondary,
    },
    scrollContent: {
      padding: 24,
      paddingBottom: Platform.OS === 'android' ? insets.bottom + 72 + 24 : 108,
    },
    emptyState: {
      padding: 48,
      alignItems: 'center',
    },
    emptyIcon: {
      marginBottom: 20,
      opacity: 0.4,
    },
    emptyTitle: {
      fontSize: Typography.xl,
      fontFamily: Typography.family.displayBold,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: Typography.base,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 24,
    },
    fab: {
      position: 'absolute',
      bottom: Platform.OS === 'android' ? Math.max(insets.bottom + 72 + 24, 108) : 108,
      right: 24,
      backgroundColor: colors.primary,
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Focus</Text>
        <Text style={styles.headerSubtitle}>
          High-level goals and priorities
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Target size={20} color={colors.primary} />
            </View>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp size={20} color={colors.success} />
            </View>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Clock size={20} color={colors.error} />
            </View>
            <Text style={styles.statNumber}>{stats.highPriority}</Text>
            <Text style={styles.statLabel}>High Priority</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {periodFilters.map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period 
                  ? styles.periodButtonActive 
                  : styles.periodButtonInactive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period 
                    ? styles.periodTextActive 
                    : styles.periodTextInactive,
                ]}
              >
                {getPeriodLabel(period)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        <View style={styles.stickyHeader}>
          <View style={styles.contentHeader}>
            <Text style={styles.contentTitle}>
              {getPeriodLabel(selectedPeriod)} Focus
            </Text>
            <Text style={styles.contentSubtitle}>
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} • {stats.completed} completed
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Target size={60} color={colors.textMuted} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No focus items yet</Text>
              <Text style={styles.emptyText}>
                Create your first focus item to start organizing your high-level goals and priorities.
              </Text>
            </View>
          ) : (
            filteredItems.map(item => (
              <FocusCard
                key={item.id}
                item={item}
                onPress={() => {
                  setEditingItem(item);
                  setModalVisible(true);
                }}
                onToggleComplete={() => handleToggleComplete(item.id)}
              />
            ))
          )}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingItem(undefined);
          setModalVisible(true);
        }}
      >
        <Plus size={24} color={colors.background} strokeWidth={2} />
      </TouchableOpacity>

      <FocusModal
        visible={modalVisible}
        item={editingItem}
        availableTags={tags}
        onClose={() => {
          setModalVisible(false);
          setEditingItem(undefined);
        }}
        onSave={handleSaveItem}
        onAddTag={handleAddTag}
        onDelete={handleDeleteItem}
      />
    </View>
  );
}