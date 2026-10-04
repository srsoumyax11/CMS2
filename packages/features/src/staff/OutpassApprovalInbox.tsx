import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, ApprovalInbox, ApprovalItem } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';

export interface OutpassApprovalInboxProps {
  pendingOutpasses?: ApprovalItem[];
  overdueOutpasses?: ApprovalItem[];
  onApprove?: (itemIds: string[]) => Promise<void>;
  onReject?: (itemId: string, reason: string) => Promise<void>;
}

const DEFAULT_PENDING: ApprovalItem[] = [
  { id: 'out_101', title: 'Weekend Pass', applicantName: 'Alex Johnson', details: 'Room B-204 | Return: Oct 6, 8:00 PM', submittedAt: '2026-10-04' },
  { id: 'out_102', title: 'Emergency Home Visit', applicantName: 'Sarah Miller', details: 'Room C-102 | Medical Reason', submittedAt: '2026-10-04' },
];

const DEFAULT_OVERDUE: ApprovalItem[] = [
  { id: 'out_099', title: 'Overdue Outpass', applicantName: 'David Smith', details: 'Room A-110 | Expected: Oct 3, 6:00 PM', submittedAt: '2026-10-03' },
];

export const OutpassApprovalInbox: React.FC<OutpassApprovalInboxProps> = ({
  pendingOutpasses = DEFAULT_PENDING,
  overdueOutpasses = DEFAULT_OVERDUE,
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
      {overdueOutpasses.length > 0 && (
        <Card style={styles.overdueBanner}>
          <Text style={styles.overdueTitle}>⚠️ Overdue Outpasses ({overdueOutpasses.length})</Text>
          {overdueOutpasses.map((item) => (
            <View key={item.id} style={styles.overdueRow}>
              <Text style={styles.overdueItemText}>{item.title} — {item.applicantName} ({item.details})</Text>
            </View>
          ))}
        </Card>
      )}

      <Text style={styles.sectionTitle}>Pending Outpass Approvals</Text>
      <ApprovalInbox
        items={pendingOutpasses}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md },
  overdueBanner: { backgroundColor: colors.danger.light, padding: spacing.md, marginBottom: spacing.md },
  overdueTitle: { fontSize: typography.fontSize.sm, fontWeight: 'bold', color: colors.danger.dark, marginBottom: spacing.xs },
  overdueRow: { marginVertical: 2 },
  overdueItemText: { fontSize: typography.fontSize.xs, color: colors.danger.dark },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[800], marginBottom: spacing.xs },
});
