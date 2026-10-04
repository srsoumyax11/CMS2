import React from 'react';
import { StyleSheet, ScrollView, Text } from 'react-native';
import { ApprovalInbox, ApprovalItem } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';

export interface DisputeInboxProps {
  disputes?: ApprovalItem[];
  onApprove?: (itemIds: string[]) => Promise<void>;
  onReject?: (itemId: string, reason: string) => Promise<void>;
}

const DEFAULT_DISPUTES: ApprovalItem[] = [
  { id: 'disp_301', title: 'Dispute: Linear Algebra (MA102)', applicantName: 'John Doe', details: 'Class Date: Oct 1 | Reason: System glitch during QR scan', submittedAt: '2026-10-02' },
];

export const DisputeInbox: React.FC<DisputeInboxProps> = ({
  disputes = DEFAULT_DISPUTES,
  onApprove,
  onReject,
}) => {
  const handleApprove = async (ids: string[]) => {
    if (onApprove) {
      await onApprove(ids);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    if (onReject) {
      await onReject(id, reason);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Attendance Dispute Inbox</Text>
      <ApprovalInbox
        items={disputes}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[800], marginBottom: spacing.xs },
});
