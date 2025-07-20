import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Colors';
import { Task } from '@/utils/storage';
import { CircleCheck as CheckCircle, Circle, Calendar, Zap, Tag } from 'lucide-react-native';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
}

export function TaskCard({ task, onPress, onToggleComplete }: TaskCardProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];

  const getZoneColor = () => {
    switch (task.zone) {
      case 'today':
        return colors.primary;
      case 'tomorrow':
        return colors.warning;
      case 'overdue':
        return colors.error;
      case 'bank':
        return colors.secondary;
      default:
        return colors.textMuted;
    }
  };

  const getZoneIcon = () => {
    switch (task.zone) {
      case 'today':
        return Zap;
      case 'tomorrow':
        return Calendar;
      case 'overdue':
        return Calendar;
      case 'bank':
        return Calendar;
      default:
        return Calendar;
    }
  };

  const ZoneIcon = getZoneIcon();
  const zoneColor = getZoneColor();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: task.completed ? colors.borderLight : colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      opacity: task.completed ? 0.7 : 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: task.note ? 20 : 16,
    },
    checkButton: {
      marginRight: 20,
      marginTop: 2,
      padding: 6,
    },
    title: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Semibold',
      fontWeight: '600',
      color: task.completed ? colors.textMuted : colors.text,
      textDecorationLine: task.completed ? 'line-through' : 'none',
    },
    note: {
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
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateText: {
      fontSize: 12,
      color: colors.textMuted,
      marginLeft: 4,
    },
    zone: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: zoneColor + '20',
    },
    zoneText: {
      fontSize: 12,
      fontWeight: '500',
      color: zoneColor,
      textTransform: 'uppercase',
      marginLeft: 4,
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
          {task.completed ? (
            <CheckCircle size={24} color={colors.success} strokeWidth={2} />
          ) : (
            <Circle size={24} color={colors.textMuted} strokeWidth={2} />
          )}
        </TouchableOpacity>
        <Text style={styles.title}>{task.title}</Text>
      </View>
      
      {task.note && (
        <Text style={styles.note}>{task.note}</Text>
      )}
      
      {task.tags && task.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {task.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Tag size={8} color={colors.primary} strokeWidth={2} />
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Calendar size={12} color={colors.textMuted} strokeWidth={2} />
          <Text style={styles.dateText}>
            {new Date(task.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        <View style={styles.zone}>
          <ZoneIcon size={12} color={zoneColor} strokeWidth={2} />
          <Text style={styles.zoneText}>{task.zone}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}