import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Switch, Pressable, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography } from '@/constants/Colors';
import { Subscription, PaymentRecord } from '@/utils/storage';
import { DatePicker } from '@/components/DatePicker';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';
import { TagSelector } from '@/components/TagSelector';
import { X, Calendar, DollarSign, FileText, ToggleLeft, ToggleRight } from 'lucide-react-native';

interface SubscriptionModalProps {
  visible: boolean;
  subscription?: Subscription;
  availableTags: string[];
  onClose: () => void;
  onSave: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddTag: (tag: string) => void;
  onDelete?: (subscriptionId: string) => void;
}

export function SubscriptionModal({ visible, subscription, availableTags, onClose, onSave, onAddTag, onDelete }: SubscriptionModalProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 400 || screenHeight < 700;
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [initialDueDate, setInitialDueDate] = useState(new Date());
  const [nextDueDate, setNextDueDate] = useState(new Date());
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (subscription) {
      setName(subscription.name);
      setAmount(subscription.amount.toString());
      setInitialDueDate(new Date(subscription.initialDueDate));
      setNextDueDate(new Date(subscription.nextDueDate));
      setIsActive(subscription.isActive);
      setNotes(subscription.notes || '');
      setTags(subscription.tags || []);
    } else {
      setName('');
      setAmount('');
      setInitialDueDate(new Date());
      setNextDueDate(new Date());
      setIsActive(true);
      setNotes('');
      setTags([]);
    }
  }, [subscription, visible]);

  const handleSave = () => {
    if (!name.trim() || !amount.trim()) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    onSave({
      name: name.trim(),
      amount: numAmount,
      initialDueDate: initialDueDate.toISOString().split('T')[0],
      nextDueDate: subscription ? nextDueDate.toISOString().split('T')[0] : initialDueDate.toISOString().split('T')[0],
      isActive,
      notes: notes.trim() || undefined,
      paymentHistory: subscription?.paymentHistory || [],
      tags: tags.length > 0 ? tags : undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (subscription && onDelete) {
      onDelete(subscription.id);
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
      padding: isSmallScreen ? 16 : 20,
    },
    modal: {
      backgroundColor: colors.background,
      borderRadius: 24,
      padding: isSmallScreen ? 24 : 28,
      width: '100%',
      maxWidth: isSmallScreen ? screenWidth - 32 : 400,
      maxHeight: isSmallScreen ? screenHeight - 100 : '85%',
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
      marginBottom: isSmallScreen ? 24 : 28,
    },
    title: {
      fontSize: isSmallScreen ? 18 : 20,
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
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: isSmallScreen ? 14 : 16,
      fontSize: isSmallScreen ? 14 : 16,
      color: colors.text,
      marginBottom: isSmallScreen ? 16 : 20,
      minHeight: 48,
    },
    textArea: {
      height: isSmallScreen ? 80 : 100,
      textAlignVertical: 'top',
    },
    label: {
      fontSize: isSmallScreen ? 12 : 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: isSmallScreen ? 6 : 8,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: isSmallScreen ? 16 : 20,
      marginBottom: isSmallScreen ? 16 : 20,
      minHeight: 72,
    },
    switchLabel: {
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: '600',
      color: colors.text,
    },
    switchSubLabel: {
      fontSize: isSmallScreen ? 10 : 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    paymentHistoryContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: isSmallScreen ? 16 : 20,
      marginBottom: isSmallScreen ? 16 : 20,
    },
    paymentHistoryTitle: {
      fontSize: isSmallScreen ? 12 : 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: isSmallScreen ? 6 : 8,
    },
    paymentRecord: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: isSmallScreen ? 3 : 4,
    },
    paymentDate: {
      fontSize: isSmallScreen ? 10 : 12,
      color: colors.textSecondary,
    },
    paymentAmount: {
      fontSize: isSmallScreen ? 10 : 12,
      fontWeight: '500',
      color: colors.text,
    },
    noPayments: {
      fontSize: isSmallScreen ? 10 : 12,
      color: colors.textMuted,
      fontStyle: 'italic',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 24,
      gap: 16,
    },
    button: {
      flex: 1,
      paddingVertical: isSmallScreen ? 16 : 18,
      paddingHorizontal: isSmallScreen ? 20 : 24,
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
      fontSize: isSmallScreen ? 14 : 16,
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
              {subscription ? 'Edit Subscription' : 'New Subscription'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          <View style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Netflix, Spotify, etc."
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Monthly Amount</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
            </View>

            <DatePicker
              date={subscription ? nextDueDate : initialDueDate}
              onDateChange={subscription ? setNextDueDate : setInitialDueDate}
              label={subscription ? "Next Due Date" : "Initial Due Date"}
            />

            <View style={styles.switchContainer}>
              <View>
                <Text style={styles.switchLabel}>
                  {isActive ? 'Active' : 'Inactive'}
                </Text>
                <Text style={styles.switchSubLabel}>
                  {isActive ? 'Subscription is currently active' : 'Subscription is paused/cancelled'}
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={colors.background}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes about this subscription..."
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

            {subscription && subscription.paymentHistory.length > 0 && (
              <View style={styles.paymentHistoryContainer}>
                <Text style={styles.paymentHistoryTitle}>Payment History</Text>
                {subscription.paymentHistory.slice(-5).reverse().map((payment) => (
                  <View key={payment.id} style={styles.paymentRecord}>
                    <Text style={styles.paymentDate}>
                      {new Date(payment.paidDate).toLocaleDateString()}
                      {payment.wasOverdue && ' (Late)'}
                    </Text>
                    <Text style={styles.paymentAmount}>
                      ${payment.amount.toFixed(2)}
                    </Text>
                  </View>
                ))}
                {subscription.paymentHistory.length > 5 && (
                  <Text style={styles.noPayments}>
                    ... and {subscription.paymentHistory.length - 5} more
                  </Text>
                )}
              </View>
            )}
          </View>
          </ScrollView>

          {subscription && onDelete && (
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => setShowDeleteConfirm(true)}
            >
              <Text style={styles.deleteButtonText}>Delete Subscription</Text>
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
        title="Delete Subscription"
        message={`Are you sure you want to delete "${subscription?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmStyle="destructive"
        icon="delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Modal>
  );
}