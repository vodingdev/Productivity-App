import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Colors';
import { InventoryItem, storage } from '@/utils/storage';
import { InventoryCard } from '@/components/InventoryCard';
import { InventoryModal } from '@/components/modals/InventoryModal';
import { Plus, Package, Hash } from 'lucide-react-native';

export default function InventoryScreen() {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [tags, setTags] = useState<string[]>([]);
  const [scrollY] = useState(new Animated.Value(0));
  const [isScrolled, setIsScrolled] = useState(false);

  const loadData = async () => {
    const [loadedItems, loadedCategories, loadedTags] = await Promise.all([
      storage.getInventoryItems(),
      storage.getCategories(),
      storage.getTags(),
    ]);
    setItems(loadedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setCategories(loadedCategories);
    setTags(loadedTags);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const handleSaveItem = async (itemData: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    let updatedItems: InventoryItem[];
    
    if (editingItem) {
      updatedItems = items.map(item =>
        item.id === editingItem.id
          ? { ...item, ...itemData }
          : item
      );
    } else {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        ...itemData,
        createdAt: new Date().toISOString(),
      };
      updatedItems = [...items, newItem];
    }
    
    setItems(updatedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    await storage.saveInventoryItems(updatedItems);
    setEditingItem(undefined);
  };

  const handleDeleteItem = async (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    await storage.saveInventoryItems(updatedItems);
  };

  const handleAddCategory = async (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      await storage.saveCategories(updatedCategories);
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

  const handleAddTag = async (newTag: string) => {
    if (!tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      await storage.saveTags(updatedTags);
    }
  };
  const getFilteredItems = () => {
    if (selectedCategory === 'All') return items;
    return items.filter(item => item.category === selectedCategory);
  };

  const getTotalQuantity = () => {
    const filteredItems = getFilteredItems();
    return filteredItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const filteredItems = getFilteredItems();
  const totalQuantity = getTotalQuantity();
  const allCategories = categories.length > 0 ? ['All', ...categories] : [];

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
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    statCardCompact: {
      padding: 10,
      borderRadius: 8,
    },
    statIcon: {
      marginBottom: 4,
    },
    statIconCompact: {
      marginBottom: 2,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    statNumberCompact: {
      fontSize: 16,
      marginBottom: 1,
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
      gap: 16,
    },
    filterScrollCompact: {
      paddingHorizontal: 16,
      gap: 12,
    },
    categoryButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 24,
      marginRight: 16,
      borderWidth: 1,
    },
    categoryButtonCompact: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginRight: 12,
    },
    categoryButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryButtonInactive: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    categoryText: {
      fontSize: 14,
      fontWeight: '500',
    },
    categoryTextCompact: {
      fontSize: 12,
    },
    categoryTextActive: {
      color: colors.background,
    },
    categoryTextInactive: {
      color: colors.textSecondary,
    },
    content: {
      flex: 1,
    },
    stickyHeader: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    contentHeader: {
      marginBottom: 0,
    },
    contentTitle: {
      fontSize: Typography['2xl'],
      fontFamily: 'Inter-Bold',
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
    emptyText: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
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
      fontFamily: 'Inter-Bold',
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
          <Text style={[styles.headerTitle, isScrolled && styles.headerTitleCompact]}>Inventory</Text>
          
          <View style={[styles.statsContainer, isScrolled && styles.statsContainerCompact]}>
            <View style={[styles.statCard, isScrolled && styles.statCardCompact]}>
              <View style={[styles.statIcon, isScrolled && styles.statIconCompact]}>
                <Package size={isScrolled ? 16 : 20} color={colors.primary} />
              </View>
              <Text style={[styles.statNumber, isScrolled && styles.statNumberCompact]}>{filteredItems.length}</Text>
              <Text style={[styles.statLabel, isScrolled && styles.statLabelCompact]}>Items</Text>
            </View>
            
            <View style={[styles.statCard, isScrolled && styles.statCardCompact]}>
              <View style={[styles.statIcon, isScrolled && styles.statIconCompact]}>
                <Hash size={isScrolled ? 16 : 20} color={colors.warning} />
              </View>
              <Text style={[styles.statNumber, isScrolled && styles.statNumberCompact]}>{totalQuantity}</Text>
              <Text style={[styles.statLabel, isScrolled && styles.statLabelCompact]}>Total Qty</Text>
            </View>
          </View>
        </View>

        {allCategories.length > 0 && (
          <View style={[styles.filterContainer, isScrolled && styles.filterContainerCompact]}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.filterScroll, isScrolled && styles.filterScrollCompact]}
            >
              {allCategories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    isScrolled && styles.categoryButtonCompact,
                    selectedCategory === category 
                      ? styles.categoryButtonActive 
                      : styles.categoryButtonInactive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isScrolled && styles.categoryTextCompact,
                      selectedCategory === category 
                        ? styles.categoryTextActive 
                        : styles.categoryTextInactive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
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
            {selectedCategory === 'All' ? 'All Items' : selectedCategory}
          </Text>
          <Text style={styles.contentSubtitle}>
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} • {totalQuantity} total quantity
          </Text>
        </View>

        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {selectedCategory === 'All' 
                ? 'No inventory items yet' 
                : `No items in ${selectedCategory} category`}
            </Text>
          </View>
        ) : (
          filteredItems.map(item => (
            <InventoryCard
              key={item.id}
              item={item}
              onPress={() => {
                setEditingItem(item);
                setModalVisible(true);
              }}
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
        <Plus size={24} color={colors.background} />
      </TouchableOpacity>

      <InventoryModal
        visible={modalVisible}
        item={editingItem}
        categories={categories}
        availableTags={tags}
        onClose={() => {
          setModalVisible(false);
          setEditingItem(undefined);
        }}
        onSave={handleSaveItem}
        onAddCategory={handleAddCategory}
        onAddTag={handleAddTag}
        onDelete={handleDeleteItem}
      />
    </View>
  );
}