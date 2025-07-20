import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography } from '@/constants/Colors';
import { Note } from '@/utils/storage';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';
import { TagSelector } from '@/components/TagSelector';
import { X } from 'lucide-react-native';

interface NoteModalProps {
  visible: boolean;
  note?: Note;
  availableTags: string[];
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddTag: (tag: string) => void;
  onDelete?: (noteId: string) => void;
}

export function NoteModal({ visible, note, availableTags, onClose, onSave, onAddTag, onDelete }: NoteModalProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 400 || screenHeight < 700;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
    }
  }, [note, visible]);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      content: content.trim(),
      tags: tags.length > 0 ? tags : undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (note && onDelete) {
      onDelete(note.id);
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
      maxHeight: screenHeight * 0.7,
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
    textArea: {
      height: 140,
      textAlignVertical: 'top',
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
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
              {note ? 'Edit Note' : 'New Note'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter note title"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Content</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={content}
                onChangeText={setContent}
                placeholder="Write your note..."
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>

            <TagSelector
              selectedTags={tags}
              availableTags={availableTags}
              onTagsChange={setTags}
              onAddTag={onAddTag}
            />
          </View>

          {note && onDelete && (
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => setShowDeleteConfirm(true)}
            >
              <Text style={styles.deleteButtonText}>Delete Note</Text>
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
        title="Delete Note"
        message={`Are you sure you want to delete "${note?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmStyle="destructive"
        icon="delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Modal>
  );
}