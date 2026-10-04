import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { colors, spacing, typography, radius } from '@campus/design-tokens';

export interface TimelineStep {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'active' | 'pending' | 'rejected';
  timestamp?: string;
}

export interface StatusTimelineProps {
  steps: TimelineStep[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ steps }) => {
  const getStepColor = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return colors.success.main;
      case 'active':
        return colors.primary[600];
      case 'rejected':
        return colors.danger.main;
      case 'pending':
      default:
        return colors.gray[300];
    }
  };

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const color = getStepColor(step.status);

        return (
          <View key={step.id} style={styles.stepRow}>
            <View style={styles.indicatorColumn}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              {!isLast ? <View style={[styles.line, { backgroundColor: color }]} /> : null}
            </View>
            <View style={styles.contentColumn}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              {step.description ? <Text style={styles.stepDescription}>{step.description}</Text> : null}
              {step.timestamp ? <Text style={styles.timestamp}>{step.timestamp}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  indicatorColumn: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: spacing.md + spacing.xs,
  },
  dot: {
    width: spacing.sm + spacing.xs,
    height: spacing.sm + spacing.xs,
    borderRadius: radius.full,
  },
  line: {
    width: spacing.xs / 2,
    flex: 1,
    marginTop: spacing.xs,
  },
  contentColumn: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as TextStyle['fontWeight'],
    color: colors.gray[900],
  },
  stepDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginTop: spacing.xs / 2,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[400],
    marginTop: spacing.xs,
  },
});
