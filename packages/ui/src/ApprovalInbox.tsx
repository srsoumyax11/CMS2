import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { DataList } from './DataList';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { colors, spacing, typography, radius } from '@campus/design-tokens';

export interface ApprovalItem {
  id: string;
  title: string;
  applicantName: string;
  details: string;
  submittedAt: string;
}

export interface BulkActionResult {
  itemId: string;
  success: boolean;
  error?: string;
}

export interface ApprovalInboxProps {
  items: ApprovalItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onApprove: (itemIds: string[]) => Promise<BulkActionResult[] | void>;
  onReject: (itemId: string, reason: string) => Promise<void>;
}

export const ApprovalInbox: React.FC<ApprovalInboxProps> = ({
  items,
  isLoading = false,
  onRefresh,
  onApprove,
  onReject,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectingItem, setRejectingItem] = useState<ApprovalItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvingItems, setApprovingItems] = useState<ApprovalItem[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkResults, setBulkResults] = useState<BulkActionResult[] | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirmApprove = async () => {
    if (!approvingItems || approvingItems.length === 0 || isProcessing) return;
    setIsProcessing(true);
    const targetIds = approvingItems.map((i) => i.id);

    try {
      const results = await onApprove(targetIds);
      if (Array.isArray(results)) {
        setBulkResults(results);
      }
      setSelectedIds([]);
      setApprovingItems(null);
      if (onRefresh) onRefresh();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem || !rejectReason.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      await onReject(rejectingItem.id, rejectReason);
      setRejectingItem(null);
      setRejectReason('');
      if (onRefresh) onRefresh();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {selectedIds.length > 0 && (
        <Card style={styles.bulkBar}>
          <Text style={styles.bulkText}>{selectedIds.length} items selected</Text>
          <Button
            label="Approve Selected"
            onPress={() => {
              const selectedItems = items.filter((i) => selectedIds.includes(i.id));
              setApprovingItems(selectedItems);
            }}
            isLoading={isProcessing}
            disabled={isProcessing}
            testID="btn-bulk-approve"
          />
        </Card>
      )}

      {bulkResults && (
        <Card style={styles.resultsCard} testID="bulk-approve-results">
          <Text style={styles.resultsTitle}>Approval Results Summary</Text>
          {bulkResults.map((r) => (
            <View key={r.itemId} style={styles.resultRow}>
              <Text style={styles.resultId}>ID: {r.itemId}</Text>
              <Text style={r.success ? styles.successText : styles.failureText}>
                {r.success ? '✓ Approved' : `✗ Failed: ${r.error || 'Unknown error'}`}
              </Text>
            </View>
          ))}
          <Button
            label="Dismiss Results"
            variant="secondary"
            onPress={() => setBulkResults(null)}
            testID="btn-dismiss-results"
          />
        </Card>
      )}

      <DataList<ApprovalItem>
        data={items}
        isLoading={isLoading}
        onRefresh={onRefresh}
        emptyTitle="No Pending Approvals"
        emptyDescription="There are currently no items awaiting your approval."
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <Card style={styles.itemCard} key={item.id}>
              <View style={styles.itemHeader}>
                <TouchableOpacity
                  style={[styles.checkbox, isSelected && styles.checkboxSelected]}
                  onPress={() => toggleSelect(item.id)}
                  testID={`checkbox-select-${item.id}`}
                >
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.applicant}>{item.applicantName}</Text>
                </View>
              </View>

              <Text style={styles.details}>{item.details}</Text>
              <Text style={styles.timestamp}>{item.submittedAt}</Text>

              <View style={styles.actionRow}>
                <Button
                  label="Reject"
                  variant="danger"
                  onPress={() => setRejectingItem(item)}
                  disabled={isProcessing}
                  testID={`btn-reject-${item.id}`}
                />
                <Button
                  label="Approve"
                  onPress={() => setApprovingItems([item])}
                  isLoading={isProcessing}
                  disabled={isProcessing}
                  testID={`btn-approve-${item.id}`}
                />
              </View>
            </Card>
          );
        }}
      />

      {/* Confirmation Modal for Approve */}
      {approvingItems && (
        <Modal transparent animationType="fade" visible={Boolean(approvingItems)}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Confirm Approval</Text>
              <Text style={styles.modalSubtitle}>
                {approvingItems.length === 1
                  ? `Are you sure you want to approve "${approvingItems[0].title}" from ${approvingItems[0].applicantName}?`
                  : `Are you sure you want to approve ${approvingItems.length} selected requests?`}
              </Text>
              <View style={styles.modalActions}>
                <Button
                  label="Cancel"
                  variant="secondary"
                  onPress={() => setApprovingItems(null)}
                  disabled={isProcessing}
                />
                <Button
                  label="Confirm Approval"
                  onPress={handleConfirmApprove}
                  isLoading={isProcessing}
                  disabled={isProcessing}
                  testID="btn-confirm-approve"
                />
              </View>
            </Card>
          </View>
        </Modal>
      )}

      {/* Rejection Modal with mandatory reason */}
      {rejectingItem && (
        <Modal transparent animationType="fade" visible={Boolean(rejectingItem)}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Reject Request</Text>
              <Text style={styles.modalSubtitle}>
                Rejecting: {rejectingItem.title} ({rejectingItem.applicantName})
              </Text>
              <Input
                label="Rejection Reason (Required)"
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                numberOfLines={3}
                testID="input-reject-reason"
              />
              <View style={styles.modalActions}>
                <Button
                  label="Cancel"
                  variant="secondary"
                  onPress={() => setRejectingItem(null)}
                  disabled={isProcessing}
                />
                <Button
                  label="Confirm Rejection"
                  variant="danger"
                  onPress={handleConfirmReject}
                  isLoading={isProcessing}
                  disabled={isProcessing || !rejectReason.trim()}
                  testID="btn-confirm-reject"
                />
              </View>
            </Card>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  bulkBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.primary[50],
  },
  bulkText: { fontWeight: 'bold', color: colors.primary[600] },
  resultsCard: { padding: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.warning.light },
  resultsTitle: { fontSize: typography.fontSize.sm, fontWeight: 'bold', color: colors.gray[900], marginBottom: spacing.xs },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.xs / 2 },
  resultId: { fontSize: typography.fontSize.xs, color: colors.gray[700] },
  successText: { fontSize: typography.fontSize.xs, fontWeight: 'bold', color: colors.success.dark },
  failureText: { fontSize: typography.fontSize.xs, fontWeight: 'bold', color: colors.danger.main },
  itemCard: { padding: spacing.md, marginBottom: spacing.sm },
  itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  checkbox: {
    width: spacing.xl,
    height: spacing.xl,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.gray[400],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxSelected: { backgroundColor: colors.primary[600], borderColor: colors.primary[600] },
  checkmark: { color: colors.white, fontWeight: 'bold', fontSize: typography.fontSize.sm },
  headerInfo: { flex: 1 },
  itemTitle: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.gray[900] },
  applicant: { fontSize: typography.fontSize.xs, color: colors.gray[600] },
  details: { fontSize: typography.fontSize.sm, color: colors.gray[700], marginVertical: spacing.xs },
  timestamp: { fontSize: typography.fontSize.xs, color: colors.gray[400], marginBottom: spacing.sm },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.xs },
  modalOverlay: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'center', padding: spacing.md },
  modalCard: { padding: spacing.lg },
  modalTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[900], marginBottom: spacing.xs },
  modalSubtitle: { fontSize: typography.fontSize.xs, color: colors.gray[600], marginBottom: spacing.md },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.xs, marginTop: spacing.md },
});
