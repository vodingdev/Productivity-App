import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Pressable, Dimensions, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Colors';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';
import { X, Plus, CreditCard as Edit3, Trash2, Tag } from 'lucide-react-native';

interface TagManagementModalProps {
  visible: boolean;
  tags: string[];
  onClose: () => void;
  onSaveTags: (tags: string[]) => void;
}

export function TagManagementModal({ visible, tags, onClose, onSaveTags }: TagManagementModalProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 400 || screenHeight < 700;
  
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState<{ index: number; value: string } | null>(null);
  const [showAddInput, setShowAddInput] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    if (visible) {
      setLocalTags([...tags]);
      setNewTag('');
      setEditingTag(null);
      setShowAddInput(false);
    }
  }, [visible, tags]);

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;
    
    if (localTags.includes(trimmedTag)) {
      Alert.alert('Duplicate Tag', 'This tag already exists.');
      return;
    }

    setLocalTags([...localTags, trimmedTag]);
    setNewTag('');
    setShowAddInput(false);
  };

  const handleEditTag = (index: number) => {
    setEditingTag({ index, value: localTags[index] });
  };

  const handleSaveEdit = () => {
    if (!editingTag) return;
    
    const trimmedTag = editingTag.value.trim();
    if (!trimmedTag) return;

    if (localTags.includes(trimmedTag) && localTags[editingTag.index] !== trimmedTag) {
      Alert.alert('Duplicate Tag', 'This tag already exists.');
      return;
    }

    const updatedTags = [...localTags];
    updatedTags[editingTag.index] = trimmedTag;
    setLocalTags(updatedTags);
    setEditingTag(null);
  };

  const handleDeleteTag = (index: number) => {
    const tagToDelete = localTags[index];
    setConfirmationModal({
      visible: true,
      title: 'Delete Tag',
      message: `Are you sure you want to delete "${tagToDelete}"? This will remove it from all items that use this tag.`,
      onConfirm: () => {
        const updatedTags = localTags.filter((_, i) => i !== index);
        setLocalTags(updatedTags);
        setConfirmationModal(prev => ({ ...prev, visible: false }));
      },
    });
  };

  const handleSave = () => {
    onSaveTags(localTags);
    onClose();
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
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: isSmallScreen ? 16 : 20,
    },
    modal: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: isSmallScreen ? 20 : 24,
      width: '100%',
      maxWidth: isSmallScreen ? screenWidth - 32 : 400,
      maxHeight: isSmallScreen ? screenHeight - 100 : '80%',
      ...Shadows.xl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isSmallScreen ? 20 : 24,
    },
    title: {
      fontSize: isSmallScreen ? 18 : 20,
      fontFamily: 'Inter-Bold',
      fontWeight: Typography.weight.bold,
      color: colors.text,
    },
    closeButton: {
      padding: 8,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
    },
    content: {
      flex: 1,
    },
    addSection: {
      marginBottom: 20,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      backgroundColor: colors.surface,
      gap: 8,
    },
    addButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      fontWeight: Typography.weight.medium,
      color: colors.textSecondary,
    },
    addInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
    },
    addInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: colors.text,
      minHeight: 44,
    },
    addInputButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addInputButtonText: {
      color: colors.background,
      fontSize: 14,
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
    },
    tagsSection: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 14,
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
      color: colors.text,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tagsList: {
      flex: 1,
    },
    tagItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tagIcon: {
      marginRight: 12,
    },
    tagText: {
      flex: 1,
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      fontWeight: Typography.weight.medium,
      color: colors.text,
    },
    tagInput: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 6,
      padding: 8,
      fontSize: 14,
      color: colors.text,
      marginRight: 8,
    },
    tagActions: {
      flexDirection: 'row',
      gap: 8,
    },
    tagActionButton: {
      padding: 8,
      borderRadius: 6,
      minWidth: 32,
      minHeight: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    editButton: {
      backgroundColor: colors.warning + '20',
    },
    deleteButton: {
      backgroundColor: colors.error + '20',
    },
    saveButton: {
      backgroundColor: colors.success + '20',
    },
    cancelButton: {
      backgroundColor: colors.textMuted + '20',
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 12,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      minHeight: 44,
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
      fontSize: 16,
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
    },
    primaryButtonText: {
      color: colors.background,
    },
    secondaryButtonText: {
      color: colors.textSecondary,
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
            <Text style={styles.title}>Manage Tags</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.addSection}>
              {!showAddInput ? (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowAddInput(true)}
                >
                  <Plus size={16} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={styles.addButtonText}>Add New Tag</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.addInputContainer}>
                  <TextInput
                    style={styles.addInput}
                    value={newTag}
                    onChangeText={setNewTag}
                    placeholder="Enter tag name"
                    placeholderTextColor={colors.textMuted}
                    autoFocus
                    onSubmitEditing={handleAddTag}
                  />
                  <TouchableOpacity style={styles.addInputButton} onPress={handleAddTag}>
                    <Text style={styles.addInputButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Your Tags ({localTags.length})</Text>
              
              {localTags.length === 0 ? (
                <View style={styles.emptyState}>
                  <Tag size={40} color={colors.textMuted} strokeWidth={1.5} />
                  <Text style={styles.emptyText}>
                    No tags yet. Add your first tag to start organizing your items.
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.tagsList} showsVerticalScrollIndicator={false}>
                  {localTags.map((tag, index) => (
                    <View key={index} style={styles.tagItem}>
                      <View style={styles.tagIcon}>
                        <Tag size={16} color={colors.primary} strokeWidth={2} />
                      </View>
                      
                      {editingTag?.index === index ? (
                        <>
                          <TextInput
                            style={styles.tagInput}
                            value={editingTag.value}
                            onChangeText={(text) => setEditingTag({ ...editingTag, value: text })}
                            autoFocus
                            onSubmitEditing={handleSaveEdit}
                          />
                          <View style={styles.tagActions}>
                            <TouchableOpacity
                              style={[styles.tagActionButton, styles.saveButton]}
                              onPress={handleSaveEdit}
                            >
                              <Plus size={14} color={colors.success} strokeWidth={2} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.tagActionButton, styles.cancelButton]}
                              onPress={() => setEditingTag(null)}
                            >
                              <X size={14} color={colors.textMuted} strokeWidth={2} />
                            </TouchableOpacity>
                          </View>
                        </>
                      ) : (
                        <>
                          <Text style={styles.tagText}>{tag}</Text>
                          <View style={styles.tagActions}>
                            <TouchableOpacity
                              style={[styles.tagActionButton, styles.editButton]}
                              onPress={() => handleEditTag(index)}
                            >
                              <Edit3 size={14} color={colors.warning} strokeWidth={2} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.tagActionButton, styles.deleteButton]}
                              onPress={() => handleDeleteTag(index)}
                            >
                              <Trash2 size={14} color={colors.error} strokeWidth={2} />
                            </TouchableOpacity>
                          </View>
                        </>
                      )}
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onClose}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleSave}>
              <Text style={[styles.buttonText, styles.primaryButtonText]}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>

      <ConfirmationModal
        visible={confirmationModal.visible}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="Delete"
        confirmStyle="destructive"
        icon="delete"
        onConfirm={confirmationModal.onConfirm}
        onCancel={() => setConfirmationModal(prev => ({ ...prev, visible: false }))}
      />
    </Modal>
  );
}