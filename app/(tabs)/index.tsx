import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Colors';
import { Task, storage } from '@/utils/storage';
import { dateUtils } from '@/utils/dateUtils';
import { TaskCard } from '@/components/TaskCard';
import { TaskModal } from '@/components/modals/TaskModal';
import { MidnightModal } from '@/components/modals/MidnightModal';
import { Plus, Calendar, Clock, Target, Archive, CircleCheck as CheckCircle, Circle, Zap, TrendingUp, Trash2 } from 'lucide-react-native';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';
import { router } from 'expo-router';

type TaskView = 'today' | 'tomorrow' | 'bank' | 'completed' | 'overdue';

export default function TasksScreen() {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [midnightModalVisible, setMidnightModalVisible] = useState(false);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [activeView, setActiveView] = useState<TaskView>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
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
  const [scrollY] = useState(new Animated.Value(0));
  const [isScrolled, setIsScrolled] = useState(false);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const [loadedTasks, loadedSubscriptions, loadedTags] = await Promise.all([
        storage.getTasks(),
        storage.getSubscriptions(),
        storage.getTags()
      ]);
      
      // Auto-update task zones based on current date
      const updatedTasks = dateUtils.updateTaskZones(loadedTasks);
      
      // Save updated tasks if zones changed
      const hasChanges = updatedTasks.some((task, index) => 
        task.zone !== loadedTasks[index]?.zone
      );
      if (hasChanges) {
        await storage.saveTasks(updatedTasks);
      }
      
      setTasks(updatedTasks);
      setSubscriptions(loadedSubscriptions);
      setTags(loadedTags);
      await checkMidnightModal(updatedTasks);
    } finally {
      setIsLoading(false);
    }
  };

  const checkMidnightModal = async (allTasks: Task[]) => {
    const lastCheck = await storage.getLastMidnightCheck();
    
    if (dateUtils.shouldShowMidnightModal(lastCheck)) {
      const overdue = allTasks.filter(task => 
        !task.completed && 
        task.zone === 'overdue'
      );
      
      if (overdue.length > 0) {
        setOverdueTasks(overdue);
        setMidnightModalVisible(true);
      } else {
        // Mark as checked even if no overdue tasks
        await storage.saveLastMidnightCheck(dateUtils.getToday());
      }
    }
  };

  const handleCloseMidnightModal = async () => {
    setMidnightModalVisible(false);
    await storage.saveLastMidnightCheck(dateUtils.getToday());
  };

  const handleReassignOverdue = async (taskIds: string[], newZone: 'today' | 'tomorrow' | 'bank') => {
    const today = dateUtils.getToday();
    const tomorrow = dateUtils.getTomorrow();
    
    const updatedTasks = tasks.map(task =>
      taskIds.includes(task.id)
        ? { 
            ...task, 
            zone: newZone,
            date: newZone === 'today' ? today : 
                  newZone === 'tomorrow' ? tomorrow :
                  task.date // Keep original date for bank
          }
        : task
    );
    
    setTasks(updatedTasks);
    await storage.saveTasks(updatedTasks);
    await storage.saveLastMidnightCheck(dateUtils.getToday());
  };

  const handleReassignAllOverdue = async (newZone: 'today' | 'tomorrow' | 'bank') => {
    const taskIds = overdueTasks.map(task => task.id);
    await handleReassignOverdue(taskIds, newZone);
    setMidnightModalVisible(false);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    // Auto-assign zone based on date (calendar-like behavior)
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let finalTaskData = { ...taskData };
    
    // Override zone based on date for automatic organization
    if (finalTaskData.date === today) {
      finalTaskData.zone = 'today';
    } else if (finalTaskData.date === tomorrow) {
      finalTaskData.zone = 'tomorrow';
    }
    // If date is neither today nor tomorrow, keep the selected zone (bank or other)
    
    let updatedTasks: Task[];
    
    if (editingTask) {
      updatedTasks = tasks.map(task =>
        task.id === editingTask.id
          ? { ...task, ...finalTaskData }
          : task
      );
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        ...finalTaskData,
        createdAt: new Date().toISOString(),
      };
      updatedTasks = [...tasks, newTask];
    }
    
    setTasks(updatedTasks);
    await storage.saveTasks(updatedTasks);
    setEditingTask(undefined);
  };

  const handleDeleteTask = async (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    await storage.saveTasks(updatedTasks);
  };

  const handleAddTag = async (newTag: string) => {
    if (!tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      await storage.saveTags(updatedTags);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadTasks();
    }, [])
  );

  const handleToggleComplete = async (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    await storage.saveTasks(updatedTasks);
  };

  const handlePurgeCompleted = async () => {
    setConfirmationModal({
      visible: true,
      title: 'Purge Completed Tasks',
      message: 'Are you sure you want to delete all completed tasks? This action cannot be undone.',
      onConfirm: async () => {
        const updatedTasks = tasks.filter(task => !task.completed);
        setTasks(updatedTasks);
        await storage.saveTasks(updatedTasks);
        setConfirmationModal(prev => ({ ...prev, visible: false }));
      },
    });
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

  const getFilteredTasks = () => {
    switch (activeView) {
      case 'today':
        return tasks.filter(task => task.zone === 'today');
      case 'tomorrow':
        return tasks.filter(task => task.zone === 'tomorrow');
      case 'bank':
        return tasks.filter(task => task.zone === 'bank');
      case 'completed':
        return tasks.filter(task => task.completed);
      case 'overdue':
        return tasks.filter(task => task.zone === 'overdue' && !task.completed);
      default:
        return [];
    }
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'today':
        return 'Today';
      case 'tomorrow':
        return 'Tomorrow';
      case 'bank':
        return 'Task Bank';
      case 'completed':
        return 'Completed';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Tasks';
    }
  };

  const getViewSubtitle = () => {
    switch (activeView) {
      case 'today':
        return dateUtils.formatDisplayDate(dateUtils.getToday());
      case 'tomorrow':
        return dateUtils.formatDisplayDate(dateUtils.getTomorrow());
      case 'bank':
        return 'Future planning zone';
      case 'completed':
        return 'All completed tasks';
      case 'overdue':
        return 'Past due tasks';
      default:
        return '';
    }
  };

  const activeTasks = tasks.filter(t => !t.completed).length;
  const completedToday = tasks.filter(t => 
    t.completed && dateUtils.isToday(t.date)
  ).length;
  const numOverdueTasks = tasks.filter(t => 
    t.zone === 'overdue' && !t.completed
  ).length;
  
  const filteredItems = getFilteredTasks();

  const viewButtons = [
    { key: 'today', label: 'Today', icon: Zap, count: tasks.filter(t => t.zone === 'today' && !t.completed).length },
    { key: 'tomorrow', label: 'Tomorrow', icon: Clock, count: tasks.filter(t => t.zone === 'tomorrow' && !t.completed).length },
    { key: 'focus', label: 'Focus', icon: Target, count: 0, action: () => router.push('/focus') },
    { key: 'bank', label: 'Bank', icon: Archive, count: tasks.filter(t => t.zone === 'bank' && !t.completed).length },
  ] as const;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    loadingText: {
      fontSize: Typography.lg,
      fontFamily: 'Inter-Medium',
      color: colors.textSecondary,
      marginTop: Spacing.xl,
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
      fontFamily: 'Inter-Bold',
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
      flexDirection: 'row',
      gap: 16,
    },
    statsContainerCompact: {
      marginTop: 8,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
    },
    statCardCompact: {
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
      fontSize: 12,
      color: colors.textMuted,
    },
    statLabelCompact: {
      fontSize: 10,
    },
    viewSelector: {
      backgroundColor: colors.background,
      paddingVertical: 20,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    viewSelectorCompact: {
      paddingVertical: 12,
    },
    viewButtons: {
      paddingHorizontal: 20,
    },
    viewButtonsScroll: {
      gap: 12,
    },
    viewButton: {
      flexDirection: 'column',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 16,
      borderWidth: 1,
      minWidth: 88,
      justifyContent: 'center',
      marginHorizontal: 6,
      minHeight: 68,
    },
    viewButtonCompact: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      minHeight: 52,
    },
    activeViewButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    inactiveViewButton: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    viewButtonContent: {
      alignItems: 'center',
      gap: 4,
    },
    viewButtonText: {
      fontSize: 10,
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    activeViewButtonText: {
      color: colors.background,
    },
    inactiveViewButtonText: {
      color: colors.textSecondary,
    },
    viewButtonCount: {
      fontSize: 10,
      fontFamily: 'Inter-Bold',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      minWidth: 16,
      textAlign: 'center',
      fontWeight: Typography.weight.bold,
      marginTop: 2,
    },
    activeViewButtonCount: {
      backgroundColor: colors.background + '40',
      color: colors.background,
    },
    inactiveViewButtonCount: {
      backgroundColor: colors.surfaceSecondary,
      color: colors.textMuted,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      flex: 1,
      padding: 24,
      paddingBottom: Platform.OS === 'android' ? insets.bottom + 72 + 24 : 108,
    },
    tasksContainer: {
      gap: 20,
    },
    emptyState: {
      padding: 48,
      alignItems: 'center',
    },
    emptyIcon: {
      marginBottom: 20,
      opacity: 0.4,
    },
    emptyTitle: {
      fontSize: Typography.xl,
      fontFamily: 'Inter-Bold',
      fontWeight: Typography.weight.bold,
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: Typography.base,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 24,
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
    purgeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.error + '15',
      borderWidth: 1,
      borderColor: colors.error + '40',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 20,
      gap: 12,
    },
    purgeButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-Semibold',
      fontWeight: '600',
      color: colors.error,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
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
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    const todayTasks = tasks.filter(t => t.zone === 'today' && !t.completed);
    const overdueTasks = tasks.filter(t => t.zone === 'overdue' && !t.completed);
    
    // Get subscriptions due this week
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dueThisWeek = subscriptions.filter(sub => {
      if (!sub.isActive) return false;
      const dueDate = new Date(sub.nextDueDate);
      return dueDate >= today && dueDate <= weekFromNow;
    }).sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
    
    // Message banks for variety
    const greetingBank = {
      morning: [
        "Morning, dude! ☀️",
        "Rise and grind! ☀️",
        "Good morning, champion! ☀️",
        "Morning, legend! ☀️",
        "Wakey wakey, time to slay! ☀️",
        "Morning sunshine! ☀️",
        "Up and at 'em! ☀️"
      ],
      afternoon: [
        "Afternoon, dude! 🚀",
        "Midday momentum! 🚀",
        "Afternoon warrior! 🚀",
        "Power through the afternoon! 🚀",
        "Afternoon excellence! 🚀",
        "Keep crushing it! 🚀",
        "Afternoon energy! 🚀"
      ],
      evening: [
        "Evening, dude! 🌙",
        "Evening grind time! 🌙",
        "Night owl mode! 🌙",
        "Evening productivity! 🌙",
        "Sunset hustle! 🌙",
        "Evening focus! 🌙",
        "Nighttime excellence! 🌙"
      ]
    };

    const overdueMessages = [
      "You've got {count} overdue task{plural} that need attention first.",
      "{count} task{plural} are waiting for you - time to tackle the backlog!",
      "Heads up: {count} overdue item{plural} need{singular} your focus.",
      "{count} task{plural} are past due - let's get caught up!",
      "Priority alert: {count} overdue task{plural} need{singular} handling.",
      "Backlog check: {count} task{plural} are waiting for action."
    ];

    const todayMessages = [
      "{count} task{plural} on deck for today - let's crush {them}!",
      "Today's lineup: {count} task{plural} ready to dominate!",
      "{count} mission{plural} for today - time to execute!",
      "Your daily targets: {count} task{plural} to conquer!",
      "Today's agenda: {count} task{plural} waiting for your magic!",
      "{count} task{plural} locked and loaded for today!"
    ];

    const clearDayMessages = [
      "Your today list is clear - perfect time to plan ahead or tackle something from your bank!",
      "Clean slate today! Time to get ahead of the game or dive into your task bank!",
      "Today's wide open - great opportunity to plan tomorrow or knock out some banked tasks!",
      "No scheduled tasks today - perfect for strategic planning or bank clearing!",
      "Free day ahead! Time to either prep for tomorrow or tackle your task reserves!",
      "Clear runway today - ideal for future planning or bank task execution!"
    ];

    const subscriptionTodayMessages = [
      "Also, {count} subscription{plural} {verb} due TODAY.",
      "Don't forget: {count} subscription{plural} need{singular} payment today!",
      "Payment alert: {count} subscription{plural} {verb} due right now!",
      "Today's bills: {count} subscription{plural} waiting for payment!",
      "Subscription reminder: {count} payment{plural} due today!"
    ];

    const subscriptionWeekMessages = [
      "Heads up: {name} is due {day}{extra}.",
      "Coming up: {name} payment on {day}{extra}.",
      "Subscription alert: {name} due {day}{extra}.",
      "Mark your calendar: {name} needs payment {day}{extra}.",
      "Upcoming bill: {name} is due {day}{extra}."
    ];

    const motivationalClosers = [
      "Time to make it happen! 💪",
      "Let's get after it! 💪",
      "Time to dominate! 💪",
      "Let's crush this! 💪",
      "Time to execute! 💪",
      "Let's make moves! 💪",
      "Time to level up! 💪"
    ];

    const successClosers = [
      "You're on top of your game! 💪",
      "Crushing it as always! 💪",
      "You're absolutely killing it! 💪",
      "Master of your domain! 💪",
      "Total boss mode! 💪",
      "You're unstoppable! 💪",
      "Peak performance! 💪"
    ];

    // Helper function to get random message from array
    const getRandom = (array) => array[Math.floor(Math.random() * array.length)];

    // Helper function to format plurals and pronouns
    const formatMessage = (template, count, name = '', day = '', extra = '') => {
      return template
        .replace('{count}', count.toString())
        .replace('{plural}', count > 1 ? 's' : '')
        .replace('{singular}', count === 1 ? 's' : '')
        .replace('{them}', count > 1 ? 'them' : 'it')
        .replace('{verb}', count > 1 ? 'are' : 'is')
        .replace('{name}', name)
        .replace('{day}', day)
        .replace('{extra}', extra);
    };

    let greeting = '';
    let motivation = '';
    
    // Time-based greeting
    let greetingArray;
    if (hour < 12) {
      greetingArray = greetingBank.morning;
    } else if (hour < 17) {
      greetingArray = greetingBank.afternoon;
    } else {
      greetingArray = greetingBank.evening;
    }
    greeting = getRandom(greetingArray);
    
    // Task status
    if (overdueTasks.length > 0) {
      const overdueMsg = getRandom(overdueMessages);
      motivation += ` ${formatMessage(overdueMsg, overdueTasks.length)}`;
    }
    
    if (todayTasks.length > 0) {
      const todayMsg = getRandom(todayMessages);
      motivation += ` ${formatMessage(todayMsg, todayTasks.length)}`;
    } else if (overdueTasks.length === 0) {
      const clearMsg = getRandom(clearDayMessages);
      motivation += ` ${clearMsg}`;
    }
    
    // Subscription alerts
    if (dueThisWeek.length > 0) {
      const dueTodayCount = dueThisWeek.filter(sub => {
        const dueDate = new Date(sub.nextDueDate);
        const todayStr = today.toDateString();
        return dueDate.toDateString() === todayStr;
      }).length;
      
      if (dueTodayCount > 0) {
        const subTodayMsg = getRandom(subscriptionTodayMessages);
        motivation += ` ${formatMessage(subTodayMsg, dueTodayCount)}`;
      } else {
        const nextDue = dueThisWeek[0];
        const dueDate = new Date(nextDue.nextDueDate);
        const dayName = dueDate.toLocaleDateString('en-US', { weekday: 'long' });
        const extra = dueThisWeek.length > 1 ? ` (plus ${dueThisWeek.length - 1} more this week)` : '';
        const subWeekMsg = getRandom(subscriptionWeekMessages);
        motivation += ` ${formatMessage(subWeekMsg, 1, nextDue.name, dayName, extra)}`;
      }
    }
    
    // Motivational close
    let closer;
    if (todayTasks.length === 0 && overdueTasks.length === 0) {
      closer = getRandom(successClosers);
    } else {
      closer = getRandom(motivationalClosers);
    }
    motivation += ` ${closer}`;
    
    return greeting + motivation;
  };

  const getEmptyStateContent = () => {
    switch (activeView) {
      case 'today':
        return {
          icon: Zap,
          title: 'No tasks for today',
          text: 'You\'re crushing it! Add a new task or check your task bank for future planning.'
        };
      case 'tomorrow':
        return {
          icon: Clock,
          title: 'No tasks for tomorrow',
          text: 'Tomorrow is wide open. Perfect time to plan ahead and stay on top of your game.'
        };
      case 'bank':
        return {
          icon: Archive,
          title: 'Your task bank is empty',
          text: 'Store tasks here for future planning when you\'re not ready to schedule them yet.'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          title: 'No completed tasks',
          text: 'Time to get things done! Completed tasks will show up here.'
        };
      case 'overdue':
        return {
          icon: Target,
          title: 'No overdue tasks',
          text: 'Solid work staying on top of everything! Keep that momentum going.'
        };
      default:
        return {
          icon: Circle,
          title: 'No tasks',
          text: 'Ready to get started? Add your first task.'
        };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your tasks...</Text>
      </View>
    );
  }

  const emptyState = getEmptyStateContent();

  return (
    <View style={styles.container}>
      <Animated.View style={styles.headerContainer}>
        <View style={[styles.header, isScrolled && styles.headerCompact]}>
          <Text style={[styles.headerTitle, isScrolled && styles.headerTitleCompact]}>Tasks</Text>
          {!isScrolled && (
            <Text style={styles.headerSubtitle}>
              {getGreeting()}
            </Text>
          )}
          
          <View style={[styles.statsContainer, isScrolled && styles.statsContainerCompact]}>
            <View style={[styles.statCard, isScrolled && styles.statCardCompact]}>
              <View style={[styles.statIcon, isScrolled && styles.statIconCompact]}>
                <TrendingUp size={isScrolled ? 16 : 20} color={colors.primary} />
              </View>
              <Text style={[styles.statNumber, isScrolled && styles.statNumberCompact]}>
                {activeTasks}
              </Text>
              <Text style={[styles.statLabel, isScrolled && styles.statLabelCompact]}>
                Active
              </Text>
            </View>
            
            <View style={[styles.statCard, isScrolled && styles.statCardCompact]}>
              <View style={[styles.statIcon, isScrolled && styles.statIconCompact]}>
                <CheckCircle size={isScrolled ? 16 : 20} color={colors.success} />
              </View>
              <Text style={[styles.statNumber, isScrolled && styles.statNumberCompact]}>
                {completedToday}
              </Text>
              <Text style={[styles.statLabel, isScrolled && styles.statLabelCompact]}>
                Done Today
              </Text>
            </View>

            {numOverdueTasks > 0 && (
              <View style={[styles.statCard, isScrolled && styles.statCardCompact]}>
                <View style={[styles.statIcon, isScrolled && styles.statIconCompact]}>
                  <Target size={isScrolled ? 16 : 20} color={colors.error} />
                </View>
                <Text style={[styles.statNumber, isScrolled && styles.statNumberCompact, { color: colors.error }]}>
                  {numOverdueTasks}
                </Text>
                <Text style={[styles.statLabel, isScrolled && styles.statLabelCompact]}>
                  Overdue
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.viewSelector, isScrolled && styles.viewSelectorCompact]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.viewButtonsScroll}
            style={styles.viewButtons}
          >
            {viewButtons.map(({ key, label, icon: Icon, count }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.viewButton,
                  isScrolled && styles.viewButtonCompact,
                  activeView === key ? styles.activeViewButton : styles.inactiveViewButton,
                ]}
                onPress={() => {
                  if (key === 'focus') {
                    router.push('/focus');
                  } else {
                    setActiveView(key);
                  }
                }}
              >
                <View style={styles.viewButtonContent}>
                  <Icon 
                    size={isScrolled ? 16 : 18} 
                    color={activeView === key ? colors.background : colors.textSecondary} 
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.viewButtonText,
                      activeView === key ? styles.activeViewButtonText : styles.inactiveViewButtonText,
                    ]}
                  >
                    {label}
                  </Text>
                  {count > 0 && (
                    <Text
                      style={[
                        styles.viewButtonCount,
                        activeView === key ? styles.activeViewButtonCount : styles.inactiveViewButtonCount,
                      ]}
                    >
                      {count}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
          <Text style={styles.contentTitle}>{getViewTitle()}</Text>
          <Text style={styles.contentSubtitle}>{getViewSubtitle()}</Text>
        </View>
        
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <emptyState.icon size={60} color={colors.textMuted} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>{emptyState.title}</Text>
            <Text style={styles.emptyText}>{emptyState.text}</Text>
          </View>
        ) : (
          <>
            {(activeView === 'completed' || activeView === 'overdue') && filteredItems.length > 0 && activeView === 'completed' && (
              <TouchableOpacity
                style={styles.purgeButton}
                onPress={handlePurgeCompleted}
              >
                <Trash2 size={16} color={colors.error} strokeWidth={2} />
                <Text style={styles.purgeButtonText}>Purge All Completed</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.tasksContainer}>
              {filteredItems.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onPress={() => {
                    setEditingTask(task);
                    setModalVisible(true);
                  }}
                  onToggleComplete={() => handleToggleComplete(task.id)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingTask(undefined);
          setModalVisible(true);
        }}
      >
        <Plus size={24} color={colors.background} strokeWidth={2} />
      </TouchableOpacity>

      <TaskModal
        visible={modalVisible}
        task={editingTask}
        availableTags={tags}
        onClose={() => {
          setModalVisible(false);
          setEditingTask(undefined);
        }}
        onSave={handleSaveTask}
        onAddTag={handleAddTag}
        onDelete={handleDeleteTask}
      />

      <MidnightModal
        visible={midnightModalVisible}
        overdueTasks={overdueTasks}
        onClose={handleCloseMidnightModal}
        onReassign={handleReassignOverdue}
        onReassignAll={handleReassignAllOverdue}
      />

      <ConfirmationModal
        visible={confirmationModal.visible}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="Delete All"
        confirmStyle="destructive"
        icon="delete"
        onConfirm={confirmationModal.onConfirm}
        onCancel={() => setConfirmationModal(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}