import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography } from '@/constants/Colors';
import { InventoryItem } from '@/utils/storage';
import { DatePicker } from '@/components/DatePicker';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';
import { TagSelector } from '@/components/TagSelector';
import { X, Plus } from 'lucide-react-native';

interface InventoryModalProps {
  visible: boolean;
  item?: InventoryItem;
  categories: string[];
  availableTags: string[];
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => void;
  onAddCategory: (category: string) => void;
  onAddTag: (tag: string) => void;
  onDelete?: (itemId: string) => void;
}

export function InventoryModal({ 
  visible, 
  item, 
  categories, 
  availableTags,
  onClose, 
  onSave, 
  onAddCategory,
  onAddTag,
  onDelete
}: InventoryModalProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 400 || screenHeight < 700;
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [date, setDate] = useState(new Date());
  const [tags, setTags] = useState<string[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setQuantity(item.quantity.toString());
      setDate(new Date(item.date));
      setTags(item.tags || []);
    } else {
      setName('');
      setCategory('');
      setQuantity('1');
      setDate(new Date());
      setTags([]);
    }
    setShowNewCategory(false);
    setNewCategory('');
  }, [item, visible, categories]);

  const handleSave = () => {
    if (!name.trim() || !category.trim()) return;

    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) return;

    onSave({
      name: name.trim(),
      category: category.trim(),
      quantity: numQuantity,
      date: date.toISOString().split('T')[0],
      tags: tags.length > 0 ? tags : undefined,
    });
    onClose();
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    onAddCategory(newCategory.trim());
    setCategory(newCategory.trim());
    setShowNewCategory(false);
    setNewCategory('');
  };

  const handleDelete = () => {
    if (item && onDelete) {
      onDelete(item.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleOverlayPress = () => {
    onClose();
  };

  const handleModalPress = (event: any) => {
    event.stopPropagation();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modal: {
      backgroundColor: colors.background,
      borderRadius: 24,
      padding: 24,
      width: '100%',
      maxWidth: isSmallScreen ? screenWidth - 32 : 380,
      maxHeight: screenHeight * 0.8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
      minWidth: 32,
      minHeight: 32,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
    },
    content: {
      gap: 20,
    },
    inputGroup: {
      gap: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      fontSize: 14,
      color: colors.text,
      minHeight: 48,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    categoryContainer: {
      gap: 8,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    categoryButton: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      minHeight: 36,
      justifyContent: 'center',
      alignItems: 'center',
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
      fontSize: 10,
      fontWeight: '500',
      textTransform: 'uppercase',
    },
    categoryTextActive: {
      color: colors.background,
    },
    categoryTextInactive: {
      color: colors.textSecondary,
    },
    addCategoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      minHeight: 32,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    addCategoryText: {
      fontSize: 10,
      fontWeight: '500',
      color: colors.textSecondary,
      marginLeft: 3,
      textTransform: 'uppercase',
    },
    newCategoryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    newCategoryInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 12,
      color: colors.text,
      minHeight: 36,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      minHeight: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButtonText: {
      color: colors.background,
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    button: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      minHeight: 48,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    primaryButtonText: {
      color: colors.background,
    },
    secondaryButtonText: {
      color: colors.textSecondary,
    },
    deleteButton: {
      backgroundColor: colors.error,
      paddingVertical: isSmallScreen ? 10 : 12,
      paddingHorizontal: isSmallScreen ? 14 : 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 24,
      minHeight: 40,
    },
    deleteButtonText: {
      color: colors.background,
      fontSize: isSmallScreen ? 12 : 14,
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
      textTransform: 'none',
      letterSpacing: 0.3,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={handleOverlayPress}>
        <Pressable 
          style={styles.modal} 
          onPress={handleModalPress}
          android_disableSound={true}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {item ? 'Edit Item' : 'New Item'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter item name"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="1"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                inputMode="numeric"
              />
            </View>

            <View style={styles.categoryContainer}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      category === cat ? styles.categoryButtonActive : styles.categoryButtonInactive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        category === cat ? styles.categoryTextActive : styles.categoryTextInactive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.addCategoryButton}
                  onPress={() => setShowNewCategory(!showNewCategory)}
                >
                  <Plus size={12} color={colors.textSecondary} />
                  <Text style={styles.addCategoryText}>Add</Text>
                </TouchableOpacity>
              </View>
              {showNewCategory && (
                <View style={styles.newCategoryContainer}>
                  <TextInput
                    style={styles.newCategoryInput}
                    value={newCategory}
                    onChangeText={setNewCategory}
                    placeholder="New category"
                    placeholderTextColor={colors.textMuted}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <DatePicker
              date={date}
              onDateChange={setDate}
              label="Date"
            />

            <TagSelector
              selectedTags={tags}
              availableTags={availableTags}
              onTagsChange={setTags}
              onAddTag={onAddTag}
            />
          </View>

          {item && onDelete && (
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => setShowDeleteConfirm(true)}
            >
              <Text style={styles.deleteButtonText}>Delete Item</Text>
            </TouchableOpacity>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onClose}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleSave}>
              <Text style={[styles.buttonText, styles.primaryButtonText]}>Save</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>

      <ConfirmationModal
        visible={showDeleteConfirm}
        title="Delete Item"
        message={`Are you sure you want to delete "${item?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmStyle="destructive"
        icon="delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Modal>
  );
}