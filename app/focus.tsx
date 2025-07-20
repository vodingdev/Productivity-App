import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { FocusItem, storage } from '@/utils/storage';
import { FocusCard } from '@/components/FocusCard';
import { FocusModal } from '@/components/modals/FocusModal';
import { Plus, Target, Calendar, Clock, TrendingUp, Filter, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

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
  const [scrollY] = useState(new Animated.Value(0));
  const [isScrolled, setIsScrolled] = useState(false);

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

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsScrolled(offsetY > 50);
      }
    }
  );

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
    headerContainer: {
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    header: {
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'web' ? 20 : 60,
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    headerCompact: {
      paddingTop: Platform.OS === 'web' ? 16 : 40,
      paddingBottom: 12,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignSelf: 'flex-start',
      gap: 8,
    },
    backButtonCompact: {
      marginBottom: 12,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
    },
    backButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: colors.textSecondary,
    },
    backButtonTextCompact: {
      fontSize: 12,
    },
    headerTitle: {
      fontSize: Typography['4xl'],
      fontFamily: Typography.family.display,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      marginBottom: Spacing.lg,
      letterSpacing: -1.5,
    },
    headerTitleCompact: {
      fontSize: Typography['2xl'],
      marginBottom: Spacing.sm,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    headerSubtitleCompact: {
      fontSize: 14,
      marginBottom: 8,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 16,
    },
    statsContainerCompact: {
      marginTop: 8,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
    },
    statCardCompact: {
      padding: 12,
      borderRadius: 12,
    },
    statIcon: {
      marginBottom: 8,
    },
    statIconCompact: {
      marginBottom: 4,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    statNumberCompact: {
      fontSize: 18,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    statLabelCompact: {
      fontSize: 10,
    },
    filterContainer: {
      backgroundColor: colors.background,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    filterContainerCompact: {
      paddingVertical: 12,
    },
    filterScroll: {
      paddingHorizontal: 24,
      gap: 12,
    },
    filterScrollCompact: {
      paddingHorizontal: 16,
      gap: 8,
    },
    periodButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 24,
      marginRight: 12,
      borderWidth: 1,
    },
    periodButtonCompact: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginRight: 8,
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
    periodTextCompact: {
      fontSize: 12,
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
    contentHeader: {
      marginBottom: 24,
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
  });

  return (
    <View style={styles.container}>
      <Animated.View style={styles.headerContainer}>
        <View style={[styles.header, isScrolled && styles.headerCompact]}>
          <TouchableOpacity style={[styles.backButton, isScrolled && styles.backButtonCompact]} onPress={() => router.back()}>
            <ArrowLeft size={isScrolled ? 14 : 16} color={colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.backButtonText, isScrolled && styles.backButtonTextCompact]}>Back to Tasks</Text>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, isScrolled && styles.headerTitleCompact]}>Focus</Text>
          {!isScrolled && (
            <Text style={styles.headerSubtitle}>
              High-level goals and priorities
            </Text>
          )}
          
          <View style={[styles.statsContainer, isScrolled && styles.statsContainerCompact]}>
            <View style={[styles.statCard, isScrolled && styles.statCardCompact]}>
              <View style={[styles.statIcon, isScrolled && styles.statIconCompact]}>
                <Target size={isScrolled ? 16 : 20} color={colors.primary} />
              </View>
              <Text style={[styles.statNumber, isScrolled && styles.statNumberCompact]}>{stats.total}</Text>
              <Text style={[styles.statLabel, isScrolled && styles.statLabelCompact]}>Total</Text>
            </View>
            
            <View style={[styles.statCard, isScrolled && styles.statCardCompact]}>
              <View style={[styles.statIcon, isScrolled && styles.statIconCompact]}>
                <TrendingUp size={isScrolled ? 16 : 20} color={colors.success} />
              </View>
              <Text style={[styles.statNumber, isScrolled && styles.statNumberCompact]}>{stats.completed}</Text>
              <Text style={[styles.statLabel, isScrolled && styles.statLabelCompact]}>Completed</Text>
            </View>

            <View style={[styles.statCard, isScrolled && styles.statCardCompact]}>
              <View style={[styles.statIcon, isScrolled && styles.statIconCompact]}>
                <Clock size={isScrolled ? 16 : 20} color={colors.error} />
              </View>
              <Text style={[styles.statNumber, isScrolled && styles.statNumberCompact]}>{stats.highPriority}</Text>
              <Text style={[styles.statLabel, isScrolled && styles.statLabelCompact]}>High Priority</Text>
            </View>
          </View>
        </View>

        <View style={[styles.filterContainer, isScrolled && styles.filterContainerCompact]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.filterScroll, isScrolled && styles.filterScrollCompact]}
          >
            {periodFilters.map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  isScrolled && styles.periodButtonCompact,
                  selectedPeriod === period 
                    ? styles.periodButtonActive 
                    : styles.periodButtonInactive,
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodText,
                    isScrolled && styles.periodTextCompact,
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
      </Animated.View>

      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>
            {getPeriodLabel(selectedPeriod)} Focus
          </Text>
          <Text style={styles.contentSubtitle}>
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} • {stats.completed} completed
          </Text>
        </View>

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