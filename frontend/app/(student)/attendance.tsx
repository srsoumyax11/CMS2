import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { QRModal } from '../../src/components/QRModal';
import { Tokens } from '../../src/theme/tokens';

interface SubjectAttendance {
  code: string;
  name: string;
  attended: number;
  total: number;
  pct: number;
}

const SUBJECTS: SubjectAttendance[] = [
  { code: 'CS301', name: 'Data Structures & Algorithms', attended: 25, total: 34, pct: 73.5 },
  { code: 'CS302', name: 'Operating Systems', attended: 28, total: 32, pct: 87.5 },
  { code: 'CS303', name: 'Database Management Systems', attended: 30, total: 34, pct: 88.2 },
  { code: 'CS304L', name: 'Computer Networks Lab', attended: 18, total: 20, pct: 90.0 },
];

export default function AttendanceScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [selectedSub, setSelectedSub] = useState<SubjectAttendance | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const handleScanSuccess = (code: string) => {
    alert(`Attendance marked successfully for QR code: ${code}`);
  };

  const handleOpenDispute = (sub: SubjectAttendance) => {
    setSelectedSub(sub);
    setDisputeReason('');
    setDisputeSuccess(false);
    setDisputeModalVisible(true);
  };

  const handleSubmitDispute = () => {
    if (!disputeReason.trim()) return;
    setDisputeSuccess(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Top Banner with Overall % and Live Scan Button */}
      <View style={[styles.topCard, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.topCardLeft}>
          <Text style={styles.overallLabel}>Overall Attendance</Text>
          <Text style={[styles.overallVal, { color: Tokens.colors.secondary }]}>84.8%</Text>
          <Text style={styles.overallSub}>Eligible for Term End Examinations ✓</Text>
        </View>

        <TouchableOpacity
          style={[styles.scanBtn, { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setScanModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />
          <Text style={styles.scanBtnText}>Scan Class QR</Text>
        </TouchableOpacity>
      </View>

      {/* Subject-Wise Breakdown List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Subject Attendance Breakdown</Text>

        {SUBJECTS.map((sub) => {
          const isLow = sub.pct < 75;
          return (
            <View
              key={sub.code}
              style={[
                styles.subCard,
                {
                  backgroundColor: surface,
                  borderColor: isLow ? Tokens.colors.accentYellow : border,
                  borderWidth: isLow ? Tokens.borderWidths.thick : Tokens.borderWidths.flat,
                },
              ]}
            >
              <View style={styles.subHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.subCode, { color: Tokens.colors.primary }]}>{sub.code}</Text>
                  <Text style={[styles.subName, { color: textPrimary }]}>{sub.name}</Text>
                </View>
                <Text style={[styles.pctText, { color: isLow ? Tokens.colors.accentYellow : Tokens.colors.secondary }]}>
                  {sub.pct}%
                </Text>
              </View>

              {/* Progress Bar Container */}
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${sub.pct}%`,
                      backgroundColor: isLow ? Tokens.colors.accentYellow : Tokens.colors.secondary,
                    },
                  ]}
                />
              </View>

              <View style={styles.subFooter}>
                <Text style={styles.countText}>Attended: {sub.attended} / {sub.total} Conducted</Text>
                <TouchableOpacity onPress={() => handleOpenDispute(sub)}>
                  <Text style={[styles.disputeBtnText, { color: Tokens.colors.accentOrange }]}>Dispute Attendance</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Attendance Dispute Modal */}
      <Modal visible={disputeModalVisible} animationType="fade" transparent onRequestClose={() => setDisputeModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textPrimary }]}>Dispute Attendance ({selectedSub?.code})</Text>
              <TouchableOpacity onPress={() => setDisputeModalVisible(false)}>
                <Ionicons name="close-circle" size={22} color={Tokens.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {!disputeSuccess ? (
              <>
                <Text style={styles.modalSub}>Submit medical slip proof or leave approval reference to dispute marked absence.</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Reason / Reference</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
                    placeholder="e.g. Medical clinic visit on Sept 28th"
                    placeholderTextColor="#94A3B8"
                    value={disputeReason}
                    onChangeText={setDisputeReason}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: Tokens.colors.accentOrange }]}
                  onPress={handleSubmitDispute}
                >
                  <Text style={styles.submitBtnText}>Submit Dispute for Faculty Review</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: Tokens.spacing.md }}>
                <Ionicons name="checkmark-circle" size={48} color={Tokens.colors.secondary} />
                <Text style={[styles.modalTitle, { color: textPrimary, marginTop: Tokens.spacing.sm }]}>Dispute Submitted</Text>
                <Text style={styles.modalSub}>Faculty ({selectedSub?.code}) has been notified to review your dispute.</Text>
                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: Tokens.colors.primary, width: '100%', marginTop: Tokens.spacing.md }]}
                  onPress={() => setDisputeModalVisible(false)}
                >
                  <Text style={styles.submitBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* QR Camera Scanner Modal */}
      <QRModal
        visible={scanModalVisible}
        mode="SCAN"
        title="Scan Faculty Class QR"
        onScanResult={handleScanSuccess}
        onClose={() => setScanModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topCard: {
    padding: Tokens.spacing.md,
    borderBottomWidth: Tokens.borderWidths.flat,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topCardLeft: { flex: 1 },
  overallLabel: { fontSize: 11, color: Tokens.colors.textMuted, fontWeight: '700' },
  overallVal: { fontSize: 24, fontWeight: '900' },
  overallSub: { fontSize: 11, color: Tokens.colors.secondary, fontWeight: '700' },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.radii.sm,
  },
  scanBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  listContent: { padding: Tokens.spacing.md, gap: Tokens.spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '900' },
  subCard: { padding: Tokens.spacing.md, borderRadius: Tokens.radii.md },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Tokens.spacing.sm },
  subCode: { fontSize: 12, fontWeight: '900' },
  subName: { fontSize: 14, fontWeight: '800' },
  pctText: { fontSize: 18, fontWeight: '900' },
  progressBg: { height: 8, backgroundColor: '#CBD5E1', borderRadius: 4, overflow: 'hidden', marginBottom: Tokens.spacing.sm },
  progressFill: { height: '100%', borderRadius: 4 },
  subFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countText: { fontSize: 11, color: Tokens.colors.textMuted },
  disputeBtnText: { fontSize: 11, fontWeight: '800' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: Tokens.spacing.md },
  modalCard: { width: '100%', maxWidth: 400, borderRadius: Tokens.radii.lg, padding: Tokens.spacing.lg, borderWidth: Tokens.borderWidths.flat },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Tokens.spacing.sm },
  modalTitle: { fontSize: 16, fontWeight: '900' },
  modalSub: { fontSize: 12, color: Tokens.colors.textMuted, marginBottom: Tokens.spacing.md },
  inputGroup: { marginBottom: Tokens.spacing.md },
  label: { fontSize: 12, fontWeight: '700', color: Tokens.colors.textMuted, marginBottom: 6 },
  input: { paddingHorizontal: Tokens.spacing.md, paddingVertical: Tokens.spacing.sm, borderRadius: Tokens.radii.sm, borderWidth: Tokens.borderWidths.flat, fontSize: 14, textAlignVertical: 'top' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Tokens.spacing.md, borderRadius: Tokens.radii.sm, gap: Tokens.spacing.sm, marginTop: Tokens.spacing.xs },
  submitBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
});
