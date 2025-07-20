import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Tag, Plus, X } from 'lucide-react-native';

interface TagSelectorProps {
  selectedTags: string[];
  availableTags: string[];
  onTagsChange: (tags: string[]) => void;
  onAddTag: (tag: string) => void;
  label?: string;
}

export function TagSelector({ 
  selectedTags = [], 
  availableTags = [], 
  onTagsChange, 
  onAddTag,
  label = "Tags" 
}: TagSelectorProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleAddNewTag = () => {
    if (!newTag.trim()) return;
    const trimmedTag = newTag.trim();
    
    if (!availableTags.includes(trimmedTag)) {
      onAddTag(trimmedTag);
    }
    
    if (!selectedTags.includes(trimmedTag)) {
      onTagsChange([...selectedTags, trimmedTag]);
    }
    
    setNewTag('');
    setShowNewTag(false);
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    label: {
      fontSize: 11,
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
      color: colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    selectedTagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: selectedTags.length > 0 ? 16 : 0,
    },
    selectedTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 18,
      gap: 8,
    },
    selectedTagText: {
      fontSize: 13,
      fontFamily: 'Inter-Medium',
      fontWeight: Typography.weight.medium,
      color: colors.background,
    },
    removeTagButton: {
      padding: 2,
    },
    availableTagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    availableTag: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    availableTagText: {
      fontSize: 13,
      fontFamily: 'Inter-Medium',
      fontWeight: Typography.weight.medium,
      color: colors.textSecondary,
    },
    addTagButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      backgroundColor: colors.surface,
      gap: 8,
    },
    addTagText: {
      fontSize: 13,
      fontFamily: 'Inter-Medium',
      fontWeight: Typography.weight.medium,
      color: colors.textSecondary,
    },
    newTagContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 16,
    },
    newTagInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 14,
      fontSize: 13,
      color: colors.text,
      minHeight: 40,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      minHeight: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButtonText: {
      color: colors.background,
      fontSize: 12,
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
      textTransform: 'uppercase',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      {selectedTags.length > 0 && (
        <View style={styles.selectedTagsContainer}>
          {selectedTags.map(tag => (
            <View key={tag} style={styles.selectedTag}>
              <Tag size={10} color={colors.background} strokeWidth={2} />
              <Text style={styles.selectedTagText}>{tag}</Text>
              <TouchableOpacity 
                style={styles.removeTagButton}
                onPress={() => handleRemoveTag(tag)}
              >
                <X size={12} color={colors.background} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.availableTagsContainer}>
        {availableTags
          .filter(tag => !selectedTags.includes(tag))
          .map(tag => (
            <TouchableOpacity
              key={tag}
              style={styles.availableTag}
              onPress={() => handleTagToggle(tag)}
            >
              <Text style={styles.availableTagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        
        <TouchableOpacity
          style={styles.addTagButton}
          onPress={() => setShowNewTag(!showNewTag)}
        >
          <Plus size={12} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.addTagText}>Add Tag</Text>
        </TouchableOpacity>
      </View>

      {showNewTag && (
        <View style={styles.newTagContainer}>
          <TextInput
            style={styles.newTagInput}
            value={newTag}
            onChangeText={setNewTag}
            placeholder="Enter tag name"
            placeholderTextColor={colors.textMuted}
            autoFocus
            onSubmitEditing={handleAddNewTag}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddNewTag}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}