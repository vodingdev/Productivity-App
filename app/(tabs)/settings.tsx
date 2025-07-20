import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { storage } from '@/utils/storage';
import { TagManagementModal } from '@/components/modals/TagManagementModal';
import { 
  Moon, 
  Sun, 
  Smartphone, 
  Info, 
  Database,
  Shield,
  Bell,
  Tag
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { theme, effectiveTheme, setTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const insets = useSafeAreaInsets();
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagModalVisible, setTagModalVisible] = React.useState(false);

  const loadTags = async () => {
    const loadedTags = await storage.getTags();
    setTags(loadedTags);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadTags();
    }, [])
  );

  const handleSaveTags = async (newTags: string[]) => {
    setTags(newTags);
    await storage.saveTags(newTags);
  };

  const themeOptions = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'System', icon: Smartphone },
  ] as const;

  const settingsGroups = [
    {
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          title: 'Theme',
          subtitle: 'Choose your preferred theme',
          icon: effectiveTheme === 'dark' ? Moon : Sun,
          type: 'theme' as const,
        },
      ],
    },
    {
      title: 'Organization',
      items: [
        {
          id: 'tags',
          title: 'Manage Tags',
          subtitle: `${tags.length} tag${tags.length !== 1 ? 's' : ''} created`,
          icon: Tag,
          type: 'action' as const,
          onPress: () => setTagModalVisible(true),
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          id: 'storage',
          title: 'Local Storage',
          subtitle: 'All data is stored locally on your device',
          icon: Database,
          type: 'info' as const,
        },
        {
          id: 'privacy',
          title: 'Privacy',
          subtitle: 'No data is shared or synced to external servers',
          icon: Shield,
          type: 'info' as const,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          id: 'version',
          title: 'Version',
          subtitle: '1.0.0',
          icon: Info,
          type: 'info' as const,
        },
      ],
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'web' ? 20 : 60,
      paddingHorizontal: 24,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: Typography['4xl'],
      fontFamily: Typography.family.display,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      marginBottom: Spacing.lg,
      letterSpacing: -1.5,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    content: {
      flex: 1,
      paddingBottom: Platform.OS === 'android' ? insets.bottom + 72 + 8 : 8,
    },
    group: {
      marginBottom: 32,
    },
    groupTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 16,
      paddingHorizontal: 24,
    },
    settingItem: {
      backgroundColor: colors.background,
      paddingVertical: 20,
      paddingHorizontal: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    settingContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingIcon: {
      marginRight: 20,
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    settingSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    themeOptions: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      paddingVertical: 20,
      backgroundColor: colors.background,
      gap: 16,
    },
    themeOption: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
    },
    themeOptionActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    themeOptionInactive: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    themeOptionText: {
      fontSize: 14,
      fontWeight: '500',
      marginTop: 4,
    },
    themeOptionTextActive: {
      color: colors.background,
    },
    themeOptionTextInactive: {
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>
          Customize your experience
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingsGroups.map(group => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            
            {group.items.map(item => (
              <View key={item.id}>
                <TouchableOpacity 
                  style={styles.settingItem}
                  onPress={item.type === 'action' ? item.onPress : undefined}
                  disabled={item.type !== 'action'}
                >
                  <View style={styles.settingContent}>
                    <View style={styles.settingIcon}>
                      <item.icon size={24} color={colors.primary} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>{item.title}</Text>
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                
                {item.type === 'theme' && (
                  <View style={styles.themeOptions}>
                    {themeOptions.map(option => (
                      <TouchableOpacity
                        key={option.key}
                        style={[
                          styles.themeOption,
                          theme === option.key 
                            ? styles.themeOptionActive 
                            : styles.themeOptionInactive,
                        ]}
                        onPress={() => setTheme(option.key)}
                      >
                        <option.icon 
                          size={20} 
                          color={theme === option.key ? colors.background : colors.textSecondary} 
                        />
                        <Text
                          style={[
                            styles.themeOptionText,
                            theme === option.key 
                              ? styles.themeOptionTextActive 
                              : styles.themeOptionTextInactive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <TagManagementModal
        visible={tagModalVisible}
        tags={tags}
        onClose={() => setTagModalVisible(false)}
        onSaveTags={handleSaveTags}
      />
    </View>
  );
}