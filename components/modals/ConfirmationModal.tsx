import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Colors';
import { TriangleAlert as AlertTriangle, Trash2 } from 'lucide-react-native';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: 'primary' | 'destructive';
  icon?: 'warning' | 'delete';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmStyle = 'primary',
  icon = 'warning',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 400 || screenHeight < 700;

  const handleOverlayPress = () => {
    onCancel();
  };

  const handleModalPress = (event: any) => {
    event.stopPropagation();
  };

  const getIconComponent = () => {
    switch (icon) {
      case 'delete':
        return <Trash2 size={isSmallScreen ? 18 : 22} color={colors.error} strokeWidth={2} />;
      case 'warning':
      default:
        return <AlertTriangle size={isSmallScreen ? 18 : 22} color={colors.warning} strokeWidth={2} />;
    }
  };

  const getIconBackgroundColor = () => {
    switch (icon) {
      case 'delete':
        return colors.error + '20';
      case 'warning':
      default:
        return colors.warning + '20';
    }
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
      borderRadius: BorderRadius['2xl'],
      padding: isSmallScreen ? Spacing.xl : Spacing['2xl'],
      width: '100%',
      maxWidth: isSmallScreen ? screenWidth - 32 : 380,
      ...Shadows.xl,
    },
    header: {
      alignItems: 'center',
      marginBottom: isSmallScreen ? Spacing.xl : Spacing['2xl'],
    },
    iconContainer: {
      width: isSmallScreen ? 40 : 48,
      height: isSmallScreen ? 40 : 48,
      borderRadius: BorderRadius.full,
      backgroundColor: getIconBackgroundColor(),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: isSmallScreen ? Spacing.md : Spacing.lg,
    },
    title: {
      fontSize: isSmallScreen ? Typography.lg : Typography.xl,
      fontFamily: 'Inter-Bold',
      fontWeight: Typography.weight.bold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: isSmallScreen ? Spacing.sm : Spacing.md,
      letterSpacing: -0.5,
    },
    message: {
      fontSize: isSmallScreen ? Typography.sm : Typography.base,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: Typography.lineHeight.relaxed * (isSmallScreen ? Typography.sm : Typography.base),
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: isSmallScreen ? Spacing.sm : Spacing.md,
    },
    button: {
      flex: 1,
      paddingVertical: isSmallScreen ? Spacing.md : Spacing.lg,
      paddingHorizontal: isSmallScreen ? Spacing.lg : Spacing.xl,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      minHeight: 40,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    destructiveButton: {
      backgroundColor: colors.error,
    },
    secondaryButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      fontSize: isSmallScreen ? Typography.sm : Typography.base,
      fontFamily: 'Inter-Semibold',
      fontWeight: Typography.weight.semibold,
    },
    primaryButtonText: {
      color: colors.background,
    },
    destructiveButtonText: {
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
            <View style={styles.iconContainer}>
              {getIconComponent()}
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                {cancelText}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                confirmStyle === 'destructive' ? styles.destructiveButton : styles.primaryButton
              ]} 
              onPress={onConfirm}
            >
              <Text style={[
                styles.buttonText, 
                confirmStyle === 'destructive' ? styles.destructiveButtonText : styles.primaryButtonText
              ]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}