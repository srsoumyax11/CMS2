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
import { Tokens } from '../../src/theme/tokens';

interface DisputeItem {
  id: string;
  studentName: string;
  rollNo: string;
  subject: string;
  sessionDate: string;
  reason: string;
  proofAttached: boolean;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

export default function FacultyDisputesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [disputes, setDisputes] = useState<DisputeItem[]>([
    {
      id: 'DISP-801',
      studentName: 'Soham Chakraborty',
      rollNo: '2024-CS-089',
      subject: 'CS-501: Advanced Algorithms',
      sessionDate: 'Sep 28, 2026 (10:00 AM)',
      reason: 'Attended inter-college hackathon event. Medical/Od proof attached.',
      proofAttached: true,
      status: 'Pending',
    },
    {
      id: 'DISP-792',
      studentName: 'Vikrant Singh',
      rollNo: '2024-CS-012',
      subject: 'CS-504: Distributed Systems',
      sessionDate: 'Sep 25, 2026 (02:00 PM)',
      reason: 'QR Scanner camera app crash during session check-in.',
      proofAttached: false,
      status: 'Pending',
    },
  ]);

  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [decisionType, setDecisionType] = useState<'accept' | 'reject' | null>(null);
  const [remark, setRemark] = useState('');

  const handleConfirmDecision = () => {
    if (!selectedDispute || !decisionType) return;
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === selectedDispute.id
          ? { ...d, status: decisionType === 'accept' ? 'Accepted' : 'Rejected' }
          : d
      )
    );
    setSelectedDispute(null);
    setDecisionType(null);
    setRemark('');
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Attendance Disputes Inbox</Text>

        {disputes.map((d) => (
          <View key={d.id} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dispId}>{d.id} • {d.subject}</Text>
                <Text style={[styles.studentName, { color: textPrimary }]}>{d.studentName}</Text>
                <Text style={styles.studentSub}>{d.rollNo} • Session: {d.sessionDate}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      d.status === 'Accepted'
                        ? Tokens.colors.secondary
                        : d.status === 'Rejected'
                        ? Tokens.colors.accentRed
                        : Tokens.colors.accentOrange,
                  },
                ]}
              >
                <Text style={styles.statusBadgeText}>{d.status}</Text>
              </View>
            </View>

            <Text style={[styles.reasonText, { color: textPrimary }]}>"{d.reason}"</Text>

            {d.proofAttached && (
              <TouchableOpacity
                style={styles.proofBox}
                onPress={() => alert('Opening verified medical certificate PDF preview...')}
              >
                <Ionicons name="document-attach" size={18} color={Tokens.colors.primary} />
                <Text style={styles.proofText}>View Attached Medical Certificate PDF</Text>
              </TouchableOpacity>
            )}

            {d.status === 'Pending' && (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: Tokens.colors.secondary }]}
                  onPress={() => {
                    setSelectedDispute(d);
                    setDecisionType('accept');
                  }}
                >
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                  <Text style={styles.actionBtnText}>Accept & Update Attendance</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: Tokens.colors.accentRed }]}
                  onPress={() => {
                    setSelectedDispute(d);
                    setDecisionType('reject');
                  }}
                >
                  <Ionicons name="close" size={16} color="#FFF" />
                  <Text style={styles.actionBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Decision Modal */}
      <Modal visible={!!selectedDispute} animationType="fade" transparent onRequestClose={() => setSelectedDispute(null)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>
              {decisionType === 'accept' ? 'Accept Dispute & Update Attendance' : 'Reject Attendance Dispute'}
            </Text>
            <Text style={{ fontSize: 12, color: Tokens.colors.textMuted, marginTop: 4 }}>
              Student: {selectedDispute?.studentName} ({selectedDispute?.rollNo})
            </Text>

            <Text style={styles.inputLabel}>Faculty Remark / Explanation</Text>
            <TextInput
              style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border, height: 60 }]}
              placeholder="e.g. Medical slip verified. Attendance updated to Present."
              placeholderTextColor={Tokens.colors.textMuted}
              multiline
              value={remark}
              onChangeText={setRemark}
            />

            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: decisionType === 'accept' ? Tokens.colors.secondary : Tokens.colors.accentRed },
              ]}
              onPress={handleConfirmDecision}
            >
              <Text style={styles.submitBtnText}>
                Confirm {decisionType === 'accept' ? 'Acceptance' : 'Rejection'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedDispute(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  scrollContent: { paddingBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  card: { padding: 14, borderWidth: 2, borderRadius: 8, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  dispId: { fontSize: 11, fontWeight: 'bold', color: Tokens.colors.primary },
  studentName: { fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  studentSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  reasonText: { fontSize: 13, fontStyle: 'italic', marginTop: 8 },
  proofBox: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#EFF6FF', padding: 8, borderRadius: 6 },
  proofText: { fontSize: 12, fontWeight: 'bold', color: Tokens.colors.primary, marginLeft: 6 },
  actionsRow: { flexDirection: 'row', marginTop: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 6, marginRight: 6 },
  actionBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 11, marginLeft: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', padding: 18, borderWidth: 2, borderRadius: 8 },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  inputLabel: { fontSize: 12, fontWeight: 'bold', marginTop: 12, color: Tokens.colors.textMuted },
  modalInput: { borderWidth: 1, borderRadius: 6, padding: 10, fontSize: 13, marginTop: 6 },
  submitBtn: { paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 14 },
  submitBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { paddingVertical: 10, alignItems: 'center', marginTop: 6 },
  cancelBtnText: { color: Tokens.colors.textMuted, fontSize: 12 },
});
