import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusTimeline, Card } from '@campus/ui';
import { colors, spacing } from '@campus/design-tokens';

export default function StatusScreen() {
  const steps = [
    { id: '1', title: 'Self Signup Completed', status: 'completed' as const },
    { id: '2', title: 'Role Application Submitted', description: 'Student Role Requested', status: 'completed' as const },
    { id: '3', title: 'Approver Review', description: 'Pending Academic Office approval', status: 'active' as const },
    { id: '4', title: 'Role Activated', status: 'pending' as const },
  ];

  return (
    <View style={styles.container}>
      <Card>
        <StatusTimeline steps={steps} />
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
});
