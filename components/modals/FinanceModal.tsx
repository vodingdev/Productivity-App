import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography } from '@/constants/Colors';
import { FinanceEntry } from '@/utils/storage';
import { DatePicker } from '@/components/DatePicker';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';
import { TagSelector } from '@/components/TagSelector';
import { X, TrendingUp, TrendingDown } from 'lucide-react-native';

interface FinanceModalProps {
  visible: boolean;
  entry?: FinanceEntry;
  availableTags: string[];
  onClose: () => void;
  onSave: (entry: Omit<FinanceEntry, 'id' | 'createdAt'>) => void;
  onAddTag: (tag: string) => void;
  onDelete?: (entryId: string) => void;
}

export function FinanceModal({ visible, entry, availableTags, onClose, onSave, onAddTag, onDelete }: FinanceModalProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 400 || screenHeight < 700;
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date());
  const [tags, setTags] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setAmount(Math.abs(entry.amount).toString());
      setType(entry.type);
      setDate(new Date(entry.date));
      setTags(entry.tags || []);
    } else {
      setTitle('');
      setAmount('');
      setType('expense');
      setDate(new Date());
      setTags([]);
    }
  }, [entry, visible]);

  const handleSave = () => {
    if (!title.trim() || !amount.trim()) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    onSave({
      title: title.trim(),
      amount: numAmount,
      type,
      date: date.toISOString().split('T')[0],
      tags: tags.length > 0 ? tags : undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (entry && onDelete) {
      onDelete(entry.id);
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
      maxHeight: screenHeight * 0.75,
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
    typeContainer: {
      flexDirection: 'row',
      gap: 16,
    },
    typeButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 14,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      minHeight: 48,
    },
    typeButtonActive: {
      backgroundColor: colors.primary,
    },
    typeButtonInactive: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    typeText: {
      fontSize: 11,
      fontWeight: '600',
      marginLeft: 6,
      textTransform: 'uppercase',
    },
    typeTextActive: {
      color: colors.background,
    },
    typeTextInactive: {
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
              {entry ? 'Edit Entry' : 'New Entry'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter description"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'income' ? styles.typeButtonActive : styles.typeButtonInactive,
                  ]}
                  onPress={() => setType('income')}
                >
                  <TrendingUp 
                    size={16} 
                    color={type === 'income' ? colors.background : colors.success} 
                  />
                  <Text
                    style={[
                      styles.typeText,
                      type === 'income' ? styles.typeTextActive : styles.typeTextInactive,
                    ]}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'expense' ? styles.typeButtonActive : styles.typeButtonInactive,
                  ]}
                  onPress={() => setType('expense')}
                >
                  <TrendingDown 
                    size={16} 
                    color={type === 'expense' ? colors.background : colors.error} 
                  />
                  <Text
                    style={[
                      styles.typeText,
                      type === 'expense' ? styles.typeTextActive : styles.typeTextInactive,
                    ]}
                  >
                    Expense
                  </Text>
                </TouchableOpacity>
              </View>
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

          {entry && onDelete && (
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => setShowDeleteConfirm(true)}
            >
              <Text style={styles.deleteButtonText}>Delete Entry</Text>
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
        title="Delete Entry"
        message={`Are you sure you want to delete "${entry?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmStyle="destructive"
        icon="delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Modal>
  );
}