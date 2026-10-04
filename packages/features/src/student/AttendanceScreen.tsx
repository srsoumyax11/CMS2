import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Card, Button, Input, FormRenderer, FieldConfig, DataList } from '@campus/ui';
import { colors, spacing, typography, radius } from '@campus/design-tokens';
import { useTranslation } from '@campus/i18n';
import { OfflineQueueManager } from '@campus/api-client';
import { z } from 'zod';

export interface SubjectAttendance {
  subjectCode: string;
  subjectName: string;
  attended: number;
  total: number;
  percentage: number;
  lowAttendanceWarning?: boolean;
}

export interface AttendanceScreenProps {
  subjects?: SubjectAttendance[];
  onMarkAttendanceCode?: (code: string) => Promise<void>;
  onApplyLeave?: (payload: { reason: string; startDate: string; endDate: string }) => Promise<void>;
  onRaiseDispute?: (payload: { subjectCode: string; date: string; reason: string }) => Promise<void>;
  queueManager?: OfflineQueueManager;
}

const DEFAULT_SUBJECTS: SubjectAttendance[] = [
  { subjectCode: 'CS101', subjectName: 'Data Structures & Algorithms', attended: 28, total: 32, percentage: 87.5 },
  { subjectCode: 'MA102', subjectName: 'Linear Algebra & Calculus', attended: 18, total: 28, percentage: 64.2, lowAttendanceWarning: true },
  { subjectCode: 'PH103', subjectName: 'Applied Physics Laboratory', attended: 22, total: 24, percentage: 91.6 },
  { subjectCode: 'EE104', subjectName: 'Basic Electrical Engineering', attended: 19, total: 26, percentage: 73.0, lowAttendanceWarning: true },
];

const APPLY_LEAVE_FIELDS: FieldConfig[] = [
  { name: 'reason', label: 'Reason for Medical / Duty Leave', type: 'text', required: true, placeholder: 'e.g. High fever & doctor recommendation' },
  { name: 'startDate', label: 'Start Date', type: 'text', required: true, placeholder: 'YYYY-MM-DD' },
  { name: 'endDate', label: 'End Date', type: 'text', required: true, placeholder: 'YYYY-MM-DD' },
];

const ApplyLeaveSchema = z.object({
  reason: z.string().min(3, 'Reason required'),
  startDate: z.string().min(5, 'Start date required'),
  endDate: z.string().min(5, 'End date required'),
});

type LeaveFormValues = z.infer<typeof ApplyLeaveSchema>;

export const AttendanceScreen: React.FC<AttendanceScreenProps> = ({
  subjects = DEFAULT_SUBJECTS,
  onMarkAttendanceCode,
  onApplyLeave,
  onRaiseDispute,
  queueManager,
}) => {
  const { t } = useTranslation();
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [disputeSubject, setDisputeSubject] = useState<SubjectAttendance | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDate, setDisputeDate] = useState('');

  const handleMarkCodeSubmit = async () => {
    if (!qrCodeInput.trim() || qrCodeInput.length !== 6) {
      setStatusNotice('Please enter a valid 6-digit attendance code.');
      return;
    }

    // Do NOT queue rotating codes offline. Check network/offline status.
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setStatusNotice('Connect to mark attendance');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onMarkAttendanceCode) {
        await onMarkAttendanceCode(qrCodeInput);
        setStatusNotice(`Attendance code "${qrCodeInput}" verified!`);
        setQrCodeInput('');
      } else {
        setStatusNotice(`Attendance code "${qrCodeInput}" verified!`);
        setQrCodeInput('');
      }
    } catch {
      setStatusNotice('Connect to mark attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveSubmit = async (values: LeaveFormValues) => {
    if (onApplyLeave) await onApplyLeave(values);
    setStatusNotice(`Leave application submitted for ${values.startDate} to ${values.endDate}.`);
    setShowLeaveModal(false);
  };

  const handleConfirmDispute = async () => {
    if (!disputeSubject || !disputeReason.trim() || !disputeDate.trim()) return;
    if (onRaiseDispute) {
      await onRaiseDispute({
        subjectCode: disputeSubject.subjectCode,
        date: disputeDate,
        reason: disputeReason,
      });
    }
    setStatusNotice(`Dispute raised for ${disputeSubject.subjectCode} on ${disputeDate}.`);
    setDisputeSubject(null);
    setDisputeReason('');
    setDisputeDate('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Code / QR Attendance Card */}
      <Card style={styles.codeCard}>
        <Text style={styles.cardHeader}>Scan QR / Enter Session Code</Text>
        <Text style={styles.cardSub}>Enter the 6-digit rotating code displayed by your lecturer.</Text>
        <View style={styles.inputRow}>
          <Input
            label="6-Digit Attendance Code"
            placeholder="6-Digit Code"
            value={qrCodeInput}
            onChangeText={setQrCodeInput}
            maxLength={6}
            testID="input-attendance-code"
          />
          <Button
            label="Verify Code"
            onPress={handleMarkCodeSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting || qrCodeInput.length !== 6}
            testID="btn-verify-attendance-code"
          />
        </View>
        {statusNotice && <Text style={styles.noticeText} testID="attendance-status-notice">{statusNotice}</Text>}
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionHeader}>
        <Text style={styles.sectionTitle}>Course Attendance Breakup</Text>
        <Button
          label="Apply Leave"
          variant="secondary"
          onPress={() => setShowLeaveModal(true)}
          testID="btn-open-apply-leave"
        />
      </View>

      {/* Subject Wise Cards */}
      {subjects.map((sub) => (
        <Card key={sub.subjectCode} style={styles.subjectCard}>
          <View style={styles.subHeaderRow}>
            <View>
              <Text style={styles.subCode}>{sub.subjectCode}</Text>
              <Text style={styles.subName}>{sub.subjectName}</Text>
            </View>
            <View style={[styles.percentBadge, sub.percentage < 75 ? styles.badgeDanger : styles.badgeSuccess]}>
              <Text style={[styles.percentText, sub.percentage < 75 ? styles.textDanger : styles.textSuccess]}>
                {sub.percentage.toFixed(1)}%
              </Text>
            </View>
          </View>

          <Text style={styles.statLine}>
            Classes Attended: <Text style={styles.boldText}>{sub.attended}</Text> / {sub.total}
          </Text>

          {sub.lowAttendanceWarning && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Low Attendance Warning: Below mandatory 75% threshold!
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.disputeLink}
            onPress={() => setDisputeSubject(sub)}
            testID={`btn-dispute-${sub.subjectCode}`}
          >
            <Text style={styles.disputeText}>Raise Attendance Dispute ➔</Text>
          </TouchableOpacity>
        </Card>
      ))}

      {/* Apply Leave Modal */}
      {showLeaveModal && (
        <Modal transparent animationType="slide" visible={showLeaveModal}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Apply Medical / Duty Leave</Text>
              <FormRenderer<LeaveFormValues>
                fields={APPLY_LEAVE_FIELDS}
                schema={ApplyLeaveSchema}
                onSubmit={handleLeaveSubmit}
                submitLabel="Submit Leave Request"
              />
              <Button label="Cancel" variant="secondary" onPress={() => setShowLeaveModal(false)} />
            </Card>
          </View>
        </Modal>
      )}

      {/* Dispute Modal */}
      {disputeSubject && (
        <Modal transparent animationType="fade" visible={Boolean(disputeSubject)}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Raise Dispute: {disputeSubject.subjectCode}</Text>
              <Input
                label="Date of Class"
                placeholder="YYYY-MM-DD"
                value={disputeDate}
                onChangeText={setDisputeDate}
                testID="input-dispute-date"
              />
              <Input
                label="Reason for Dispute"
                placeholder="Explain discrepancy..."
                value={disputeReason}
                onChangeText={setDisputeReason}
                multiline
                numberOfLines={3}
                testID="input-dispute-reason"
              />
              <View style={styles.modalActions}>
                <Button label="Cancel" variant="secondary" onPress={() => setDisputeSubject(null)} />
                <Button
                  label="Submit Dispute"
                  variant="danger"
                  onPress={handleConfirmDispute}
                  disabled={!disputeDate.trim() || !disputeReason.trim()}
                  testID="btn-confirm-dispute"
                />
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
  codeCard: { padding: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.primary[50] },
  cardHeader: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.primary[900] },
  cardSub: { fontSize: typography.fontSize.xs, color: colors.primary[700], marginVertical: spacing.xs },
  inputRow: { gap: spacing.xs, marginTop: spacing.xs },
  noticeText: { fontSize: typography.fontSize.xs, fontWeight: 'bold', color: colors.primary[800], marginTop: spacing.xs },
  actionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: spacing.sm },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[800] },
  subjectCard: { padding: spacing.md, marginBottom: spacing.sm },
  subHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  subCode: { fontSize: typography.fontSize.xs, fontWeight: 'bold', color: colors.gray[500] },
  subName: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.gray[900] },
  percentBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs / 2, borderRadius: radius.full },
  badgeSuccess: { backgroundColor: colors.success.light },
  badgeDanger: { backgroundColor: colors.danger.light },
  percentText: { fontSize: typography.fontSize.sm, fontWeight: 'bold' },
  textSuccess: { color: colors.success.dark },
  textDanger: { color: colors.danger.dark },
  statLine: { fontSize: typography.fontSize.sm, color: colors.gray[700], marginVertical: spacing.xs },
  boldText: { fontWeight: 'bold', color: colors.gray[900] },
  warningBox: { backgroundColor: colors.warning.light, padding: spacing.xs, borderRadius: radius.sm, marginVertical: spacing.xs },
  warningText: { fontSize: typography.fontSize.xs, color: colors.warning.dark, fontWeight: 'bold' },
  disputeLink: { marginTop: spacing.xs },
  disputeText: { fontSize: typography.fontSize.xs, fontWeight: 'bold', color: colors.primary[600] },
  modalOverlay: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'center', padding: spacing.md },
  modalCard: { padding: spacing.lg, gap: spacing.sm },
  modalTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[900], marginBottom: spacing.xs },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.xs, marginTop: spacing.md },
});
