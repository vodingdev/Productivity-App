import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Colors';
import { Task } from '@/utils/storage';
import { DatePicker } from '@/components/DatePicker';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';
import { TagSelector } from '@/components/TagSelector';
import { X } from 'lucide-react-native';

interface TaskModalProps {
  visible: boolean;
  task?: Task;
  availableTags: string[];
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onAddTag: (tag: string) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskModal({ visible, task, availableTags, onClose, onSave, onAddTag, onDelete }: TaskModalProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 400 || screenHeight < 700;
  
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [zone, setZone] = useState<'bank' | 'today' | 'tomorrow'>('bank');
  const [tags, setTags] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNote(task.note || '');
      setDate(new Date(task.date));
      setZone(task.zone);
      setTags(task.tags || []);
    } else {
      setTitle('');
      setNote('');
      setDate(new Date());
      setZone('bank');
      setTags([]);
    }
  }, [task, visible]);

  // Auto-set date when zone changes
  useEffect(() => {
    if (!task) { // Only auto-set for new tasks, not when editing
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (zone === 'today') {
        setDate(today);
      } else if (zone === 'tomorrow') {
        setDate(tomorrow);
      }
      // For 'bank', keep the current date selection
    }
  }, [zone, task]);

  const handleSave = () => {
    if (!title.trim()) return;

    // Auto-assign zone based on date
    let finalZone = zone;
    const taskDate = date.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (taskDate === today) {
      finalZone = 'today';
    } else if (taskDate === tomorrow) {
      finalZone = 'tomorrow';
    }
    // If date is neither today nor tomorrow, keep the selected zone (bank or other)

    onSave({
      title: title.trim(),
      note: note.trim() || undefined,
      date: date.toISOString().split('T')[0],
      zone: finalZone,
      completed: task?.completed || false,
      tags: tags.length > 0 ? tags : undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
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

  const zones = [
    { key: 'bank', label: 'Bank' },
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
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
      maxHeight: screenHeight * 0.8,
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
    zoneContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    zoneButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 14,
      borderWidth: 1,
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    zoneButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    zoneButtonInactive: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    zoneText: {
      fontSize: 9,
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    zoneTextActive: {
      color: colors.background,
    },
    zoneTextInactive: {
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
              {task ? 'Edit Task' : 'New Task'}
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
                placeholder="Enter task title"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Note (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={note}
                onChangeText={setNote}
                placeholder="Add a note..."
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>

            {zone === 'bank' && (
              <View style={styles.inputGroup}>
                <DatePicker
                  date={date}
                  onDateChange={setDate}
                  label="Date"
                />
              </View>
            )}

            <TagSelector
              selectedTags={tags}
              availableTags={availableTags}
              onTagsChange={setTags}
              onAddTag={onAddTag}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Zone</Text>
              <View style={styles.zoneContainer}>
                {zones.map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.zoneButton,
                      zone === key ? styles.zoneButtonActive : styles.zoneButtonInactive,
                    ]}
                    onPress={() => {
                      setZone(key);
                      // Auto-set date for today/tomorrow when creating new tasks
                      if (!task) {
                        if (key === 'today') {
                          setDate(new Date());
                        } else if (key === 'tomorrow') {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          setDate(tomorrow);
                        }
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.zoneText,
                        zone === key ? styles.zoneTextActive : styles.zoneTextInactive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {task && onDelete && (
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => setShowDeleteConfirm(true)}
            >
              <Text style={styles.deleteButtonText}>Delete Task</Text>
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
        title="Delete Task"
        message={`Are you sure you want to delete "${task?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmStyle="destructive"
        icon="delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Modal>
  );
}