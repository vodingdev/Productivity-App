import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { FinanceEntry } from '@/utils/storage';
import { TrendingUp, TrendingDown, Calendar, Tag } from 'lucide-react-native';

interface FinanceCardProps {
  entry: FinanceEntry;
  onPress: () => void;
}

export function FinanceCard({ entry, onPress }: FinanceCardProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];

  const isIncome = entry.type === 'income';
  const amountColor = isIncome ? colors.success : colors.error;

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
    icon: {
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
      color: amountColor,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 16,
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
    type: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: isIncome ? colors.success + '20' : colors.error + '20',
    },
    typeText: {
      fontSize: 12,
      fontWeight: '500',
      color: amountColor,
      textTransform: 'capitalize',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 16,
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
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.icon}>
          {isIncome ? (
            <TrendingUp size={24} color={colors.success} />
          ) : (
            <TrendingDown size={24} color={colors.error} />
          )}
        </View>
        <Text style={styles.title}>{entry.title}</Text>
        <Text style={styles.amount}>
          {isIncome ? '+' : '-'}${Math.abs(entry.amount).toFixed(2)}
        </Text>
      </View>
      
      {entry.tags && entry.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {entry.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Tag size={8} color={colors.primary} strokeWidth={2} />
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Calendar size={12} color={colors.textMuted} />
          <Text style={styles.dateText}>
            {new Date(entry.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.type}>
          <Text style={styles.typeText}>{entry.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}