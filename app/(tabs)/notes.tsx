import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography, Spacing, Shadows } from '@/constants/Colors';
import { Note, storage } from '@/utils/storage';
import { NoteCard } from '@/components/NoteCard';
import { NoteModal } from '@/components/modals/NoteModal';
import { Plus, StickyNote as StickyNoteIcon } from 'lucide-react-native';

export default function NotesScreen() {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState<Note[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [scrollY] = useState(new Animated.Value(0));
  const [isScrolled, setIsScrolled] = useState(false);

  const loadNotes = async () => {
    const [loadedNotes, loadedTags] = await Promise.all([
      storage.getNotes(),
      storage.getTags()
    ]);
    setNotes(loadedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    setTags(loadedTags);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadNotes();
    }, [])
  );

  const handleSaveNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    let updatedNotes: Note[];
    
    if (editingNote) {
      updatedNotes = notes.map(note =>
        note.id === editingNote.id
          ? { 
              ...note, 
              ...noteData, 
              updatedAt: now 
            }
          : note
      );
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        ...noteData,
        createdAt: now,
        updatedAt: now,
      };
      updatedNotes = [...notes, newNote];
    }
    
    setNotes(updatedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    await storage.saveNotes(updatedNotes);
    setEditingNote(undefined);
  };

  const handleDeleteNote = async (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    await storage.saveNotes(updatedNotes);
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
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
    },
    statsContainerCompact: {
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
      fontSize: 14,
      color: colors.textMuted,
    },
    statLabelCompact: {
      fontSize: 12,
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
  });

  return (
    <View style={styles.container}>
      <Animated.View style={styles.headerContainer}>
        <View style={[styles.header, isScrolled && styles.headerCompact]}>
          <Text style={[styles.headerTitle, isScrolled && styles.headerTitleCompact]}>Notes</Text>
          {!isScrolled && (
            <Text style={styles.headerSubtitle}>
              Quick notes and reminders
            </Text>
          )}
          
          <View style={[styles.statsContainer, isScrolled && styles.statsContainerCompact]}>
            <View style={[styles.statIcon, isScrolled && styles.statIconCompact]}>
              <StickyNoteIcon size={isScrolled ? 20 : 24} color={colors.warning} />
            </View>
            <Text style={[styles.statNumber, isScrolled && styles.statNumberCompact]}>{notes.length}</Text>
            <Text style={[styles.statLabel, isScrolled && styles.statLabelCompact]}>Total Notes</Text>
          </View>
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
          <Text style={styles.contentTitle}>Your Notes</Text>
          <Text style={styles.contentSubtitle}>
            {notes.length} note{notes.length !== 1 ? 's' : ''} • Sorted by last updated
          </Text>
        </View>

        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No notes yet. Tap + to create your first note.</Text>
          </View>
        ) : (
          notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onPress={() => {
                setEditingNote(note);
                setModalVisible(true);
              }}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingNote(undefined);
          setModalVisible(true);
        }}
      >
        <Plus size={24} color={colors.background} />
      </TouchableOpacity>

      <NoteModal
        visible={modalVisible}
        note={editingNote}
        availableTags={tags}
        onClose={() => {
          setModalVisible(false);
          setEditingNote(undefined);
        }}
        onSave={handleSaveNote}
        onAddTag={handleAddTag}
        onDelete={handleDeleteNote}
      />
    </View>
  );
}