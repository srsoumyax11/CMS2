import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Card } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Account Setup & Role Request</Text>
        <Text style={styles.description}>
          Your account is currently registered. Select a role and submit requested proof to request active access.
        </Text>
        <Button label="View Application Status" onPress={() => router.push('/(onboarding)/status')} />
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
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    marginBottom: spacing.lg,
  },
});
