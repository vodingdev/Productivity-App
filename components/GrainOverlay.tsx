import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

export function GrainOverlay() {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];

  const styles = StyleSheet.create({
    grain: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.grain,
      pointerEvents: 'none',
      opacity: 0.8,
    },
  });

  return <View style={styles.grain} />;
}