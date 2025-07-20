import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/Colors';
import { SquareCheck as CheckSquare, DollarSign, Package, StickyNote, Settings as Gear } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, Spacing.lg),
          paddingTop: Spacing.xl,
          height: Platform.OS === 'ios' ? 104 : 92 + Math.max(insets.bottom, 0),
          ...Shadows.lg,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: Typography.xs,
          fontFamily: Typography.family.displayBold,
          fontWeight: Typography.weight.bold,
          marginTop: Spacing.md,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        },
        tabBarIconStyle: {
          marginTop: Spacing.sm,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ size, color, focused }) => (
            <CheckSquare 
              size={focused ? size + 2 : size} 
              color={color} 
              strokeWidth={focused ? 3 : 2.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finance',
          tabBarIcon: ({ size, color, focused }) => (
            <DollarSign 
              size={focused ? size + 2 : size} 
              color={color} 
              strokeWidth={focused ? 3 : 2.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ size, color, focused }) => (
            <Package 
              size={focused ? size + 2 : size} 
              color={color} 
              strokeWidth={focused ? 3 : 2.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ size, color, focused }) => (
            <StickyNote 
              size={focused ? size + 2 : size} 
              color={color} 
              strokeWidth={focused ? 3 : 2.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color, focused }) => (
            <Gear 
              size={focused ? size + 2 : size} 
              color={color} 
              strokeWidth={focused ? 3 : 2.5}
            />
          ),
        }}
      />
    </Tabs>
  );
}