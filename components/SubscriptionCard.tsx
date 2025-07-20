import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Subscription } from '@/utils/storage';
import { formatDaysUntilDue, getStatusColor, isOverdue } from '@/utils/subscriptionUtils';
import { Calendar, DollarSign, Clock, CircleCheck as CheckCircle, Circle, Tag } from 'lucide-react-native';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress: () => void;
  onMarkPaid: () => void;
}

export function SubscriptionCard({ subscription, onPress, onMarkPaid }: SubscriptionCardProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  const statusColor = getStatusColor(subscription.nextDueDate, colors);
  const overdue = isOverdue(subscription.nextDueDate);

  const handleMarkPaid = () => {
    setConfirmationVisible(true);
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: subscription.isActive ? colors.border : colors.borderLight,
      opacity: subscription.isActive ? 1 : 0.6,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: subscription.isActive ? statusColor : colors.textMuted,
      marginRight: 20,
    },
    title: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    amount: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    inactiveLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
      marginLeft: 8,
    },
    dueDateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    dueDateText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 16,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
      color: statusColor,
      marginLeft: 16,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    paymentHistory: {
      fontSize: 12,
      color: colors.textMuted,
    },
    markPaidButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    markPaidButtonDisabled: {
      backgroundColor: colors.surfaceSecondary,
    },
    markPaidText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    markPaidTextDisabled: {
      color: colors.textMuted,
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

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.header}>
          <View style={styles.statusIndicator} />
          <Text style={styles.title}>{subscription.name}</Text>
          <Text style={styles.amount}>${subscription.amount.toFixed(2)}</Text>
          {!subscription.isActive && (
            <Text style={styles.inactiveLabel}>INACTIVE</Text>
          )}
        </View>

        <View style={styles.dueDateContainer}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={styles.dueDateText}>
            Due: {new Date(subscription.nextDueDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Clock size={14} color={statusColor} />
          <Text style={styles.statusText}>
            {formatDaysUntilDue(subscription.nextDueDate)}
          </Text>
        </View>

        {subscription.tags && subscription.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {subscription.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Tag size={8} color={colors.primary} strokeWidth={2} />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.paymentHistory}>
            {subscription.paymentHistory.length} payment{subscription.paymentHistory.length !== 1 ? 's' : ''}
          </Text>
          
          {subscription.isActive && (
            <TouchableOpacity
              style={[
                styles.markPaidButton,
                !subscription.isActive && styles.markPaidButtonDisabled,
              ]}
              onPress={handleMarkPaid}
              disabled={!subscription.isActive}
            >
              <CheckCircle size={14} color={colors.background} />
              <Text style={[
                styles.markPaidText,
                !subscription.isActive && styles.markPaidTextDisabled,
              ]}>
                Mark Paid
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      <ConfirmationModal
        visible={confirmationVisible}
        title="Mark as Paid"
        message={`Mark ${subscription.name} as paid for $${subscription.amount.toFixed(2)}?`}
        confirmText="Mark Paid"
        confirmStyle="primary"
        icon="warning"
        onConfirm={() => {
          onMarkPaid();
          setConfirmationVisible(false);
        }}
        onCancel={() => setConfirmationVisible(false)}
      />
    </>
  );
}