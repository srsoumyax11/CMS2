import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import { Card, Button, Input } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';

export interface ComplaintTicket {
  id: string;
  category: string;
  description: string;
  studentName: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  commentsCount: number;
  createdAt: string;
}

export interface ComplaintsBoardProps {
  tickets?: ComplaintTicket[];
  onAssign?: (id: string, staffName: string) => Promise<void>;
  onChangeStatus?: (id: string, status: ComplaintTicket['status']) => Promise<void>;
  onAddComment?: (id: string, comment: string) => Promise<void>;
}

const DEFAULT_TICKETS: ComplaintTicket[] = [
  { id: 'case_701', category: 'Hostel Maintenance', description: 'Water leakage in 2nd floor washroom', studentName: 'David Miller', status: 'open', commentsCount: 1, createdAt: '2026-10-03' },
  { id: 'case_702', category: 'WiFi / IT Network', description: 'No connectivity in Block C room 104', studentName: 'Jessica Taylor', status: 'assigned', assignedTo: 'IT Staff Ramesh', commentsCount: 3, createdAt: '2026-10-02' },
];

export const ComplaintsBoard: React.FC<ComplaintsBoardProps> = ({
  tickets = DEFAULT_TICKETS,
  onAssign,
  onChangeStatus,
  onAddComment,
}) => {
  const [boardTickets, setBoardTickets] = useState<ComplaintTicket[]>(tickets);
  const [assignModalId, setAssignModalId] = useState<string | null>(null);
  const [assigneeName, setAssigneeName] = useState('');
  const [commentModalId, setCommentModalId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleConfirmAssign = async () => {
    if (!assignModalId || !assigneeName.trim()) return;
    if (onAssign) await onAssign(assignModalId, assigneeName);
    setBoardTickets((prev) =>
      prev.map((t) => (t.id === assignModalId ? { ...t, assignedTo: assigneeName, status: 'assigned' } : t))
    );
    setAssignModalId(null);
    setAssigneeName('');
  };

  const handleStatusChange = async (id: string, newStatus: ComplaintTicket['status']) => {
    if (onChangeStatus) await onChangeStatus(id, newStatus);
    setBoardTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
  };

  const handleConfirmComment = async () => {
    if (!commentModalId || !commentText.trim()) return;
    if (onAddComment) await onAddComment(commentModalId, commentText);
    setBoardTickets((prev) =>
      prev.map((t) => (t.id === commentModalId ? { ...t, commentsCount: t.commentsCount + 1 } : t))
    );
    setCommentModalId(null);
    setCommentText('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>📋 Complaints Management Board</Text>

      {boardTickets.map((item) => (
        <Card key={item.id} style={styles.ticketCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.categoryBadge}>{item.category.toUpperCase()}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.descText}>{item.description}</Text>
          <Text style={styles.metaText}>Submitted by: {item.studentName} | {item.createdAt}</Text>
          {item.assignedTo && <Text style={styles.assignedText}>Assigned: {item.assignedTo}</Text>}

          <View style={styles.actionRow}>
            <Button
              label="Assign Staff"
              variant="secondary"
              onPress={() => setAssignModalId(item.id)}
              testID={`btn-assign-${item.id}`}
            />
            <Button
              label="Add Comment"
              variant="secondary"
              onPress={() => setCommentModalId(item.id)}
              testID={`btn-comment-${item.id}`}
            />
            {item.status !== 'resolved' && (
              <Button
                label="Mark Resolved"
                onPress={() => handleStatusChange(item.id, 'resolved')}
                testID={`btn-resolve-${item.id}`}
              />
            )}
          </View>
        </Card>
      ))}

      {assignModalId && (
        <Modal transparent animationType="slide" visible={Boolean(assignModalId)}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Assign Maintenance / Staff</Text>
              <Input
                label="Staff Name / ID"
                placeholder="e.g. Electrician Kumar"
                value={assigneeName}
                onChangeText={setAssigneeName}
              />
              <View style={styles.modalActions}>
                <Button label="Cancel" variant="secondary" onPress={() => setAssignModalId(null)} />
                <Button label="Assign" onPress={handleConfirmAssign} disabled={!assigneeName.trim()} />
              </View>
            </Card>
          </View>
        </Modal>
      )}

      {commentModalId && (
        <Modal transparent animationType="slide" visible={Boolean(commentModalId)}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add Response / Update Comment</Text>
              <Input
                label="Official Response"
                placeholder="e.g. Plumber dispatched, repair scheduled by 4:00 PM"
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <View style={styles.modalActions}>
                <Button label="Cancel" variant="secondary" onPress={() => setCommentModalId(null)} />
                <Button label="Post Comment" onPress={handleConfirmComment} disabled={!commentText.trim()} />
              </View>
            </Card>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md },
  headerTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[900], marginBottom: spacing.md },
  ticketCard: { padding: spacing.md, marginBottom: spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  categoryBadge: { fontSize: 10, fontWeight: 'bold', color: colors.primary[600] },
  statusBadge: { backgroundColor: colors.gray[200], paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: 'bold', color: colors.gray[800] },
  descText: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.gray[900], marginVertical: spacing.xs / 2 },
  metaText: { fontSize: typography.fontSize.xs, color: colors.gray[500] },
  assignedText: { fontSize: typography.fontSize.xs, fontWeight: 'bold', color: colors.primary[700], marginTop: 2 },
  actionRow: { flexWrap: 'wrap', flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md },
  modalOverlay: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'center', padding: spacing.md },
  modalCard: { padding: spacing.lg, gap: spacing.sm },
  modalTitle: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.gray[900] },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.xs, marginTop: spacing.md },
});
