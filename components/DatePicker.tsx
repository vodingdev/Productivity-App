import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react-native';

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
  label?: string;
}

export function DatePicker({ date, onDateChange, label }: DatePickerProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 400 || screenHeight < 700;
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(date);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDatePress = () => {
    setSelectedDate(date);
    setShowPicker(true);
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    onDateChange(selectedDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setSelectedDate(date);
    setShowPicker(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate.getDate() === day;
      const isToday = isCurrentMonth && today.getDate() === day;
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            styles.dayButton,
            isSelected && styles.selectedDay,
            isToday && !isSelected && styles.todayDay,
          ]}
          onPress={() => handleDateSelect(day)}
        >
          <Text
            style={[
              styles.dayText,
              isSelected && styles.selectedDayText,
              isToday && !isSelected && styles.todayDayText,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontFamily: 'Inter-Semibold',
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      minHeight: 48,
    },
    dateText: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: colors.text,
      marginLeft: 12,
    },
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: isSmallScreen ? 16 : 20,
    },
    modal: {
      backgroundColor: colors.background,
      borderRadius: 24,
      padding: isSmallScreen ? 24 : 28,
      width: '100%',
      maxWidth: isSmallScreen ? screenWidth - 32 : 350,
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
      marginBottom: 24,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      fontWeight: '700',
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
    monthHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      paddingHorizontal: 12,
    },
    monthButton: {
      padding: 12,
      borderRadius: 12,
      minWidth: 48,
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    monthText: {
      fontSize: 16,
      fontFamily: 'Inter-Semibold',
      fontWeight: '600',
      color: colors.text,
    },
    weekDays: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    weekDay: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
    },
    weekDayText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      fontWeight: '500',
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    calendar: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 24,
    },
    dayCell: {
      width: '14.28%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dayButton: {
      borderRadius: 10,
      margin: 2,
    },
    selectedDay: {
      backgroundColor: colors.primary,
    },
    todayDay: {
      backgroundColor: colors.primary + '20',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    dayText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      fontWeight: '500',
      color: colors.text,
    },
    selectedDayText: {
      color: colors.background,
      fontWeight: '600',
    },
    todayDayText: {
      color: colors.primary,
      fontWeight: '600',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16,
    },
    button: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 24,
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
      fontSize: 16,
      fontFamily: 'Inter-Semibold',
      fontWeight: '600',
    },
    primaryButtonText: {
      color: colors.background,
    },
    secondaryButtonText: {
      color: colors.textSecondary,
    },
  });

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.dateButton} onPress={handleDatePress}>
        <Calendar size={20} color={colors.primary} strokeWidth={2} />
        <Text style={styles.dateText}>
          {date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </Text>
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={handleCancel}>
          <Pressable 
            style={styles.modal} 
            onPress={(e) => e.stopPropagation()}
            android_disableSound={true}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Select Date</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
                <X size={20} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.monthHeader}>
              <TouchableOpacity 
                style={styles.monthButton} 
                onPress={() => navigateMonth('prev')}
              >
                <ChevronLeft size={20} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
              
              <Text style={styles.monthText}>
                {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </Text>
              
              <TouchableOpacity 
                style={styles.monthButton} 
                onPress={() => navigateMonth('next')}
              >
                <ChevronRight size={20} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDays}>
              {weekDays.map((day, index) => (
                <View key={index} style={styles.weekDay}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            <View style={styles.calendar}>
              {renderCalendar()}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleCancel}>
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleConfirm}>
                <Text style={[styles.buttonText, styles.primaryButtonText]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}