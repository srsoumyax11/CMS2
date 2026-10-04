import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { colors, spacing, typography } from '@campus/design-tokens';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  onRetry,
  retryLabel = 'Retry',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {onRetry ? (
        <View style={styles.buttonWrapper}>
          <Button label={retryLabel} onPress={onRetry} variant="secondary" testID="btn-datalist-retry" />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as TextStyle['fontWeight'],
    color: colors.gray[800],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  buttonWrapper: {
    marginTop: spacing.sm,
  },
});
