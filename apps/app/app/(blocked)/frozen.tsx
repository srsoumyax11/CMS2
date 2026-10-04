import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';

export default function FrozenScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Account Frozen</Text>
        <Text style={styles.description}>
          Your account has been temporarily frozen due to administrative action or security audit.
        </Text>
        <Text style={styles.helpdeskText}>
          Helpdesk Contact: helpdesk@campus.edu | Phone: +91 1800-123-4567
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.gray[50],
  },
  card: {
    padding: spacing.lg,
    borderColor: colors.danger.main,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.danger.main,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.gray[700],
    marginBottom: spacing.lg,
  },
  helpdeskText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    fontWeight: '500',
  },
});
