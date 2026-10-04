import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, ViewStyle } from 'react-native';
import { Card, Button, Input } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';

export interface ActiveSosIncident {
  id: string;
  studentName: string;
  roomNumber: string;
  location: string;
  triggeredAt: string;
  status: 'active' | 'acknowledged' | 'escalated' | 'closed';
  acknowledgedBy?: string;
}

export interface SosControlRoomProps {
  incidents?: ActiveSosIncident[];
  onAcknowledge?: (id: string) => Promise<void>;
  onAddUpdate?: (id: string, note: string) => Promise<void>;
  onEscalate?: (id: string) => Promise<void>;
  onClose?: (id: string) => Promise<void>;
}

const DEFAULT_INCIDENTS: ActiveSosIncident[] = [
  { id: 'sos_901', studentName: 'Michael Brown', roomNumber: 'Hostel B - 302', location: 'Block B 3rd Floor East Wing', triggeredAt: '2 mins ago', status: 'active' },
];

export const SosControlRoom: React.FC<SosControlRoomProps> = ({
  incidents = DEFAULT_INCIDENTS,
  onAcknowledge,
  onAddUpdate,
  onEscalate,
  onClose,
}) => {
  const [incidentList, setIncidentList] = useState<ActiveSosIncident[]>(incidents);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [updateNote, setUpdateNote] = useState('');
  const [noteModalId, setNoteModalId] = useState<string | null>(null);

  const handleAcknowledge = async (id: string) => {
    if (busyId === id) return; // single flight check
    setBusyId(id);
    try {
      if (onAcknowledge) await onAcknowledge(id);
      setIncidentList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'acknowledged', acknowledgedBy: 'Warden On Duty' } : item))
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleEscalate = async (id: string) => {
    if (busyId === id) return;
    setBusyId(id);
    try {
      if (onEscalate) await onEscalate(id);
      setIncidentList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'escalated' } : item))
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleClose = async (id: string) => {
    if (busyId === id) return;
    setBusyId(id);
    try {
      if (onClose) await onClose(id);
      setIncidentList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'closed' } : item))
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveUpdate = async () => {
    if (!noteModalId || !updateNote.trim()) return;
    if (onAddUpdate) await onAddUpdate(noteModalId, updateNote);
    setNoteModalId(null);
    setUpdateNote('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>🚨 SOS Control Room & Live Monitor</Text>

      {incidentList.map((inc) => {
        const cardStyle: ViewStyle = {
          ...styles.incidentCard,
          ...(inc.status === 'active' ? styles.cardActive : styles.cardAck),
        };
        return (
          <Card key={inc.id} style={cardStyle}>
            <View style={styles.rowBetween}>
              <Text style={styles.studentName}>{inc.studentName}</Text>
              <View style={[styles.badge, inc.status === 'active' ? styles.badgeDanger : styles.badgeInfo]}>
                <Text style={styles.badgeText}>{inc.status.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.infoLine}>📍 Location: {inc.location} ({inc.roomNumber})</Text>
            <Text style={styles.infoLine}>⏰ Alert Triggered: {inc.triggeredAt}</Text>
            {inc.acknowledgedBy && <Text style={styles.ackBy}>Confirmed by: {inc.acknowledgedBy}</Text>}

            <View style={styles.actionRow}>
              {inc.status === 'active' && (
                <Button
                  label="Acknowledge SOS"
                  variant="danger"
                  onPress={() => handleAcknowledge(inc.id)}
                  isLoading={busyId === inc.id}
                  disabled={busyId === inc.id}
                  testID={`btn-ack-sos-${inc.id}`}
                />
              )}
              {inc.status !== 'closed' && (
                <>
                  <Button
                    label="Add Update Note"
                    variant="secondary"
                    onPress={() => setNoteModalId(inc.id)}
                    testID={`btn-note-sos-${inc.id}`}
                  />
                  <Button
                    label="Escalate"
                    variant="secondary"
                    onPress={() => handleEscalate(inc.id)}
                    disabled={busyId === inc.id}
                    testID={`btn-escalate-sos-${inc.id}`}
                  />
                  <Button
                    label="Close Incident"
                    onPress={() => handleClose(inc.id)}
                    disabled={busyId === inc.id}
                    testID={`btn-close-sos-${inc.id}`}
                  />
                </>
              )}
            </View>
          </Card>
        );
      })}

      {noteModalId && (
        <Modal transparent animationType="slide" visible={Boolean(noteModalId)}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add Incident Log Note</Text>
              <Input
                label="Update Note"
                placeholder="e.g. Medical team dispatched to Block B room 302"
                value={updateNote}
                onChangeText={setUpdateNote}
                multiline
              />
              <View style={styles.modalActions}>
                <Button label="Cancel" variant="secondary" onPress={() => setNoteModalId(null)} />
                <Button label="Save Note" onPress={handleSaveUpdate} disabled={!updateNote.trim()} />
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
  incidentCard: { padding: spacing.md, marginBottom: spacing.sm },
  cardActive: { borderLeftWidth: 4, borderLeftColor: colors.danger.main, backgroundColor: colors.danger.light },
  cardAck: { borderLeftWidth: 4, borderLeftColor: colors.info.main },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  studentName: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.gray[900] },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 12 },
  badgeDanger: { backgroundColor: colors.danger.main },
  badgeInfo: { backgroundColor: colors.info.main },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: colors.white },
  infoLine: { fontSize: typography.fontSize.xs, color: colors.gray[800], marginVertical: 2 },
  ackBy: { fontSize: typography.fontSize.xs, fontWeight: 'bold', color: colors.info.dark, marginTop: spacing.xs },
  actionRow: { flexWrap: 'wrap', flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md },
  modalOverlay: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'center', padding: spacing.md },
  modalCard: { padding: spacing.lg, gap: spacing.sm },
  modalTitle: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.gray[900] },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.xs, marginTop: spacing.md },
});
