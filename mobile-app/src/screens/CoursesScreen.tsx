// Boilerplate Courses tab – placeholder only
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme/colors';

export function CoursesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="book-outline" size={64} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>Courses</Text>
      <Text style={styles.message}>Coming soon. Courses will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xxl,
  },
  iconWrap: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
