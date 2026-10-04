import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Button } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { useAuthStore } from '../../src/store/authStore';

export default function DashboardScreen() {
  const { user, activeRole, clearSession } = useAuthStore();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.welcomeText}>Welcome, {user?.fullName || 'User'}!</Text>
        <Text style={styles.roleBadge}>Active Role: {activeRole || 'Student'}</Text>
        <Text style={styles.infoText}>User Code: {user?.userCode || 'STU-1001'}</Text>
        <View style={styles.buttonWrapper}>
          <Button label="Logout" onPress={clearSession} variant="secondary" />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.gray[50],
  },
  card: {
    padding: spacing.lg,
  },
  welcomeText: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  roleBadge: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    marginBottom: spacing.lg,
  },
  buttonWrapper: {
    marginTop: spacing.md,
  },
});
