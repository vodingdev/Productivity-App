import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { InventoryItem } from '@/utils/storage';
import { Package, Calendar, Hash, Tag } from 'lucide-react-native';

interface InventoryCardProps {
  item: InventoryItem;
  onPress: () => void;
}

export function InventoryCard({ item, onPress }: InventoryCardProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];

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
    title: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 20,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
    },
    quantityText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 4,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
    category: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.primary + '20',
    },
    categoryText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.primary,
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
        <Package size={24} color={colors.primary} />
        <Text style={styles.title}>{item.name}</Text>
        <View style={styles.quantityContainer}>
          <Hash size={12} color={colors.textSecondary} />
          <Text style={styles.quantityText}>{item.quantity}</Text>
        </View>
      </View>
      
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
        <View style={styles.dateContainer}>
          <Calendar size={12} color={colors.textMuted} />
          <Text style={styles.dateText}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.category}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}