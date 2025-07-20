import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Colors';
import { FocusItem } from '@/utils/storage';
import { CircleCheck as CheckCircle, Circle, Target, Calendar, Clock, Tag } from 'lucide-react-native';

interface FocusCardProps {
  item: FocusItem;
  onPress: () => void;
  onToggleComplete: () => void;
}

export function FocusCard({ item, onPress, onToggleComplete }: FocusCardProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];

  const getPriorityColor = () => {
    switch (item.priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.textMuted;
    }
  };

  const getPeriodLabel = () => {
    switch (item.period) {
      case 'today':
        return 'Today';
      case 'tomorrow':
        return 'Tomorrow';
      case 'this-week':
        return 'This Week';
      case 'this-month':
        return 'This Month';
      case 'this-quarter':
        return 'This Quarter';
      case 'this-year':
        return 'This Year';
      case 'custom':
        return 'Custom';
      default:
        return item.period;
    }
  };

  const getPeriodIcon = () => {
    switch (item.period) {
      case 'today':
      case 'tomorrow':
        return Clock;
      case 'this-week':
      case 'this-month':
      case 'this-quarter':
      case 'this-year':
        return Calendar;
      default:
        return Target;
    }
  };

  const PeriodIcon = getPeriodIcon();
  const priorityColor = getPriorityColor();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: item.completed ? colors.borderLight : colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      opacity: item.completed ? 0.7 : 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: item.description ? 20 : 16,
    },
    checkButton: {
      marginRight: 20,
      marginTop: 2,
      padding: 6,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontFamily: 'Inter-Semibold',
      fontWeight: '600',
      color: item.completed ? colors.textMuted : colors.text,
      textDecorationLine: item.completed ? 'line-through' : 'none',
      marginBottom: 4,
    },
    priorityBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: priorityColor + '20',
    },
    priorityText: {
      fontSize: 10,
      fontFamily: 'Inter-Semibold',
      fontWeight: '600',
      color: priorityColor,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 20,
      paddingLeft: 50,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 50,
    },
    periodContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    periodText: {
      fontSize: 12,
      color: colors.textMuted,
      marginLeft: 4,
    },
    updatedText: {
      fontSize: 12,
      color: colors.textMuted,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      paddingLeft: 50,
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

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.checkButton} 
          onPress={onToggleComplete}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          {item.completed ? (
            <CheckCircle size={24} color={colors.success} strokeWidth={2} />
          ) : (
            <Circle size={24} color={colors.textMuted} strokeWidth={2} />
          )}
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
        </View>
      </View>
      
      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}
      
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Tag size={8} color={colors.primary} strokeWidth={2} />
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.footer}>
        <View style={styles.periodContainer}>
          <PeriodIcon size={12} color={colors.textMuted} strokeWidth={2} />
          <Text style={styles.periodText}>{getPeriodLabel()}</Text>
        </View>
        <Text style={styles.updatedText}>
          {new Date(item.updatedAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}