import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Colors';
import { FocusItem } from '@/utils/storage';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';
import { TagSelector } from '@/components/TagSelector';
import { X } from 'lucide-react-native';

interface FocusModalProps {
  visible: boolean;
  item?: FocusItem;
  availableTags: string[];
  onClose: () => void;
  onSave: (item: Omit<FocusItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddTag: (tag: string) => void;
  onDelete?: (itemId: string) => void;
}

export function FocusModal({ visible, item, availableTags, onClose, onSave, onAddTag, onDelete }: FocusModalProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 400 || screenHeight < 700;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [period, setPeriod] = useState<'today' | 'tomorrow' | 'this-week' | 'this-month' | 'this-quarter' | 'this-year' | 'custom'>('today');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || '');
      setPeriod(item.period);
      setPriority(item.priority);
      setTags(item.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setPeriod('today');
      setPriority('medium');
      setTags([]);
    }
  }, [item, visible]);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      period,
      priority,
      completed: item?.completed || false,
      tags: tags.length > 0 ? tags : undefined,
    });
    onClose();
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

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'this-week', label: 'This Week' },
    { key: 'this-month', label: 'This Month' },
    { key: 'this-quarter', label: 'This Quarter' },
    { key: 'this-year', label: 'This Year' },
    { key: 'custom', label: 'Custom' },
  ] as const;

  const priorities = [
    { key: 'high', label: 'High', color: colors.error },
    { key: 'medium', label: 'Medium', color: colors.warning },
    { key: 'low', label: 'Low', color: colors.success },
  ] as const;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
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
      maxHeight: screenHeight * 0.85,
      ...Shadows.xl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      fontWeight: Typography.weight.bold,
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
    label: {
      fontSize: 12,
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
      color: colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.text,
      minHeight: 48,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    periodContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    periodButton: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1,
      minHeight: 40,
      justifyContent: 'center',
      alignItems: 'center',
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
      fontSize: 10,
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    periodTextActive: {
      color: colors.background,
    },
    periodTextInactive: {
      color: colors.textSecondary,
    },
    priorityContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    priorityButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 14,
      borderWidth: 1,
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    priorityButtonActive: {
      borderColor: colors.primary,
    },
    priorityButtonInactive: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    priorityText: {
      fontSize: 10,
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    priorityTextActive: {
      color: colors.background,
    },
    priorityTextInactive: {
      color: colors.textSecondary,
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
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
    },
    primaryButtonText: {
      color: colors.background,
    },
    secondaryButtonText: {
      color: colors.textSecondary,
    },
    deleteButton: {
      backgroundColor: colors.error,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20,
      minHeight: 40,
    },
    deleteButtonText: {
      color: colors.background,
      fontSize: 12,
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
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
              {item ? 'Edit Focus' : 'New Focus'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter focus title"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add a description..."
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time Period</Text>
              <View style={styles.periodContainer}>
                {periods.map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.periodButton,
                      period === key ? styles.periodButtonActive : styles.periodButtonInactive,
                    ]}
                    onPress={() => setPeriod(key)}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        period === key ? styles.periodTextActive : styles.periodTextInactive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityContainer}>
                {priorities.map(({ key, label, color }) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.priorityButton,
                      priority === key 
                        ? { ...styles.priorityButtonActive, backgroundColor: color } 
                        : styles.priorityButtonInactive,
                    ]}
                    onPress={() => setPriority(key)}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        priority === key ? styles.priorityTextActive : styles.priorityTextInactive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

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
              <Text style={styles.deleteButtonText}>Delete Focus Item</Text>
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
        title="Delete Focus Item"
        message={`Are you sure you want to delete "${item?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmStyle="destructive"
        icon="delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Modal>
  );
}