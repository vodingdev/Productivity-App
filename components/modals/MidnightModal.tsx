import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Pressable, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Colors';
import { Task } from '@/utils/storage';
import { Clock, ArrowRight, Calendar, Archive, CircleCheck as CheckCircle } from 'lucide-react-native';

interface MidnightModalProps {
  visible: boolean;
  overdueTasks: Task[];
  onClose: () => void;
  onReassign: (taskIds: string[], newZone: 'today' | 'tomorrow' | 'bank') => void;
  onReassignAll: (newZone: 'today' | 'tomorrow' | 'bank') => void;
}

export function MidnightModal({ 
  visible, 
  overdueTasks, 
  onClose, 
  onReassign, 
  onReassignAll 
}: MidnightModalProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 400 || screenHeight < 700;

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
      padding: isSmallScreen ? Spacing.xl : Spacing['4xl'],
    },
    modal: {
      backgroundColor: colors.background,
      borderRadius: BorderRadius['3xl'],
      padding: isSmallScreen ? Spacing['3xl'] : Spacing['5xl'],
      width: '100%',
      maxWidth: isSmallScreen ? screenWidth - 32 : 420,
      maxHeight: isSmallScreen ? screenHeight - 100 : '85%',
      ...Shadows.xl,
    },
    header: {
      alignItems: 'center',
      marginBottom: isSmallScreen ? Spacing['3xl'] : Spacing['5xl'],
    },
    iconContainer: {
      width: isSmallScreen ? 60 : 80,
      height: isSmallScreen ? 60 : 80,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.warning + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: isSmallScreen ? Spacing.xl : Spacing['3xl'],
    },
    title: {
      fontSize: isSmallScreen ? Typography['2xl'] : Typography['4xl'],
      fontFamily: 'Inter-Bold',
      fontWeight: Typography.weight.bold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: isSmallScreen ? Spacing.md : Spacing.lg,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: isSmallScreen ? Typography.base : Typography.lg,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: Typography.lineHeight.relaxed * (isSmallScreen ? Typography.base : Typography.lg),
    },
    taskCount: {
      fontSize: isSmallScreen ? Typography.lg : Typography.xl,
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
      color: colors.warning,
      textAlign: 'center',
      marginVertical: isSmallScreen ? Spacing.xl : Spacing['3xl'],
      backgroundColor: colors.warning + '15',
      paddingVertical: isSmallScreen ? Spacing.md : Spacing.lg,
      paddingHorizontal: isSmallScreen ? Spacing.xl : Spacing['2xl'],
      borderRadius: BorderRadius.lg,
    },
    taskList: {
      maxHeight: isSmallScreen ? 150 : 200,
      marginBottom: isSmallScreen ? Spacing.xl : Spacing['4xl'],
    },
    taskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: isSmallScreen ? Spacing.md : Spacing.lg,
      paddingHorizontal: isSmallScreen ? Spacing.lg : Spacing.xl,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      marginBottom: isSmallScreen ? Spacing.sm : Spacing.md,
      borderWidth: 0.5,
      borderColor: colors.border,
      minHeight: 44,
    },
    taskTitle: {
      flex: 1,
      fontSize: isSmallScreen ? Typography.sm : Typography.base,
      fontFamily: 'Inter-Medium',
      fontWeight: Typography.weight.medium,
      color: colors.text,
      marginLeft: isSmallScreen ? Spacing.md : Spacing.lg,
    },
    taskDate: {
      fontSize: isSmallScreen ? Typography.xs : Typography.sm,
      fontFamily: 'Inter-Regular',
      color: colors.textMuted,
    },
    quickActions: {
      marginBottom: isSmallScreen ? Spacing.xl : Spacing['4xl'],
    },
    quickActionsTitle: {
      fontSize: isSmallScreen ? Typography.sm : Typography.base,
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
      color: colors.text,
      marginBottom: isSmallScreen ? Spacing.md : Spacing.lg,
      textAlign: 'center',
    },
    quickActionButtons: {
      flexDirection: 'row',
      gap: isSmallScreen ? Spacing.md : Spacing.lg,
    },
    quickActionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: isSmallScreen ? Spacing.md : Spacing.lg,
      paddingHorizontal: isSmallScreen ? Spacing.lg : Spacing.xl,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      gap: isSmallScreen ? Spacing.sm : Spacing.md,
      minHeight: 44,
    },
    todayButton: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
    },
    tomorrowButton: {
      backgroundColor: colors.warning + '20',
      borderColor: colors.warning,
    },
    bankButton: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    quickActionText: {
      fontSize: isSmallScreen ? Typography.xs : Typography.sm,
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
    },
    todayButtonText: {
      color: colors.primary,
    },
    tomorrowButtonText: {
      color: colors.warning,
    },
    bankButtonText: {
      color: colors.textSecondary,
    },
    buttonContainer: {
      gap: isSmallScreen ? Spacing.md : Spacing.lg,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: isSmallScreen ? Spacing.xl : Spacing['2xl'],
      paddingHorizontal: isSmallScreen ? Spacing.xl : Spacing['3xl'],
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      minHeight: 44,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    buttonText: {
      fontSize: isSmallScreen ? Typography.base : Typography.lg,
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

  if (overdueTasks.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={handleOverlayPress}>
        <Pressable 
          style={styles.modal} 
          onPress={handleModalPress}
          android_disableSound={true}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Clock size={isSmallScreen ? 30 : 40} color={colors.warning} strokeWidth={2} />
            </View>
            <Text style={styles.title}>Good Morning!</Text>
            <Text style={styles.subtitle}>
              You have unfinished tasks from yesterday that need attention
            </Text>
            <Text style={styles.taskCount}>
              {overdueTasks.length} task{overdueTasks.length !== 1 ? 's' : ''} pending
            </Text>
          </View>

          <ScrollView 
            style={styles.taskList} 
            showsVerticalScrollIndicator={false}
          >
            {overdueTasks.slice(0, 5).map(task => (
              <View key={task.id} style={styles.taskItem}>
                <CheckCircle size={isSmallScreen ? 14 : 16} color={colors.textMuted} strokeWidth={2} />
                <Text style={styles.taskTitle} numberOfLines={1}>
                  {task.title}
                </Text>
                <Text style={styles.taskDate}>
                  {new Date(task.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
            ))}
            {overdueTasks.length > 5 && (
              <Text style={[styles.taskDate, { textAlign: 'center', marginTop: isSmallScreen ? Spacing.md : Spacing.lg }]}>
                ... and {overdueTasks.length - 5} more
              </Text>
            )}
          </ScrollView>

          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>Move all tasks to:</Text>
            <View style={styles.quickActionButtons}>
              <TouchableOpacity 
                style={[styles.quickActionButton, styles.todayButton]} 
                onPress={() => onReassignAll('today')}
              >
                <Calendar size={isSmallScreen ? 14 : 16} color={colors.primary} strokeWidth={2} />
                <Text style={[styles.quickActionText, styles.todayButtonText]}>
                  Today
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.quickActionButton, styles.tomorrowButton]} 
                onPress={() => onReassignAll('tomorrow')}
              >
                <Calendar size={isSmallScreen ? 14 : 16} color={colors.warning} strokeWidth={2} />
                <Text style={[styles.quickActionText, styles.tomorrowButtonText]}>
                  Tomorrow
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.quickActionButton, styles.bankButton]} 
                onPress={() => onReassignAll('bank')}
              >
                <Archive size={isSmallScreen ? 14 : 16} color={colors.textSecondary} strokeWidth={2} />
                <Text style={[styles.quickActionText, styles.bankButtonText]}>
                  Bank
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={onClose}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                I'll decide later
              </Text>
              <ArrowRight size={isSmallScreen ? 16 : 20} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}