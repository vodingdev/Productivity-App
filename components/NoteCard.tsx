import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Note } from '@/utils/storage';
import { StickyNote, Clock, Tag } from 'lucide-react-native';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
}

export function NoteCard({ note, onPress }: NoteCardProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 20,
    },
    content: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateText: {
      fontSize: 12,
      color: colors.textMuted,
      marginLeft: 4,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 16,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '15',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 12,
      gap: 6,
    },
    tagText: {
      fontSize: 11,
      fontFamily: 'Inter-Medium',
      fontWeight: '500',
      color: colors.primary,
    },
  });

  const truncatedContent = note.content.length > 100 
    ? note.content.substring(0, 100) + '...'
    : note.content;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <StickyNote size={24} color={colors.warning} />
        <Text style={styles.title}>{note.title}</Text>
      </View>
      
      {note.content && (
        <Text style={styles.content}>{truncatedContent}</Text>
      )}
      
      {note.tags && note.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {note.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Tag size={8} color={colors.primary} strokeWidth={2} />
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.footer}>
        <Clock size={12} color={colors.textMuted} />
        <Text style={styles.dateText}>
          {new Date(note.updatedAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}