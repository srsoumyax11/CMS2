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

interface RoleRequest {
  id: string;
  applicantName: string;
  contact: string;
  requestedRole: 'student' | 'faculty' | 'warden' | 'parent';
  claimedIdentifier: string;
  docProofName: string;
  isPreVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminRoleApprovalsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [requests, setRequests] = useState<RoleRequest[]>([
    {
      id: 'REQ-901',
      applicantName: 'Vikrant Singh',
      contact: 'vikrant.s@gmail.com • +91 9123456789',
      requestedRole: 'student',
      claimedIdentifier: 'Admission No: 2024-CS-012',
      docProofName: 'Student_ID_Proof_Vikrant.pdf',
      isPreVerified: true,
      status: 'pending',
    },
    {
      id: 'REQ-894',
      applicantName: 'Dr. S. K. Gupta',
      contact: 'sk.gupta@gmail.com',
      requestedRole: 'faculty',
      claimedIdentifier: 'Employee ID: EMP-5012 (Physics Dept)',
      docProofName: 'Appointment_Letter_Gupta.pdf',
      isPreVerified: false,
      status: 'pending',
    },
  ]);

  const [selectedReq, setSelectedReq] = useState<RoleRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleApproveSingle = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    );
    alert('Role Request Approved! Granted user_code and activated account.');
  };

  const handleBulkApprove = () => {
    setRequests((prev) =>
      prev.map((r) => (r.isPreVerified && r.status === 'pending' ? { ...r, status: 'approved' } : r))
    );
    alert('Bulk Approved all pre-verified applicants!');
  };

  const handleReject = () => {
    if (!selectedReq) return;
    setRequests((prev) =>
      prev.map((r) => (r.id === selectedReq.id ? { ...r, status: 'rejected' } : r))
    );
    setSelectedReq(null);
    setRejectReason('');
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header Summary & Bulk Action */}
      <View style={[styles.headerCard, { backgroundColor: surface, borderColor: border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>Self-Signup Identity Verification</Text>
          <Text style={styles.headerSub}>{pendingCount} Pending Role Approval Requests</Text>
        </View>

        <TouchableOpacity
          style={[styles.bulkBtn, { backgroundColor: Tokens.colors.secondary }]}
          onPress={handleBulkApprove}
        >
          <Ionicons name="checkmark-done" size={16} color="#FFF" />
          <Text style={styles.bulkBtnText}>Bulk Approve</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Role Request Queue</Text>

        {requests.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reqId}>{item.id} • {item.requestedRole.toUpperCase()}</Text>
                <Text style={[styles.applicantName, { color: textPrimary }]}>{item.applicantName}</Text>
                <Text style={styles.contactText}>{item.contact}</Text>
              </View>

              <View
                style={[
                  styles.verifyBadge,
                  { backgroundColor: item.isPreVerified ? Tokens.colors.secondary : Tokens.colors.accentOrange },
                ]}
              >
                <Text style={styles.verifyBadgeText}>
                  {item.isPreVerified ? 'Pre-Verified Match ✓' : 'Manual Verification'}
                </Text>
              </View>
            </View>

            <View style={styles.identifierBox}>
              <Ionicons name="id-card-outline" size={16} color={Tokens.colors.primary} />
              <Text style={[styles.identifierText, { color: textPrimary }]}>{item.claimedIdentifier}</Text>
            </View>

            <TouchableOpacity
              style={styles.docBox}
              onPress={() => alert(`Previewing uploaded document: ${item.docProofName}`)}
            >
              <Ionicons name="document-text-outline" size={16} color={Tokens.colors.primary} />
              <Text style={styles.docText}>View Uploaded Evidence PDF</Text>
            </TouchableOpacity>

            {item.status === 'pending' ? (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.approveBtn, { backgroundColor: Tokens.colors.secondary }]}
                  onPress={() => handleApproveSingle(item.id)}
                >
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                  <Text style={styles.approveBtnText}>Approve & Grant Code</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.rejectBtn, { backgroundColor: Tokens.colors.accentRed }]}
                  onPress={() => setSelectedReq(item)}
                >
                  <Ionicons name="close" size={16} color="#FFF" />
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.statusBanner, { backgroundColor: item.status === 'approved' ? '#ECFDF5' : '#FEF2F2' }]}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: item.status === 'approved' ? Tokens.colors.secondary : Tokens.colors.accentRed }}>
                  Status: {item.status.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Reject Modal */}
      <Modal visible={!!selectedReq} animationType="fade" transparent onRequestClose={() => setSelectedReq(null)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>Reject Role Request</Text>
            <Text style={{ fontSize: 12, color: Tokens.colors.textMuted, marginTop: 4 }}>
              Applicant: {selectedReq?.applicantName}
            </Text>

            <Text style={styles.inputLabel}>Rejection Reason / Guidance for Applicant</Text>
            <TextInput
              style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border, height: 60 }]}
              placeholder="e.g. Uploaded ID proof is blurry / Identifier mismatch."
              placeholderTextColor={Tokens.colors.textMuted}
              multiline
              value={rejectReason}
              onChangeText={setRejectReason}
            />

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Tokens.colors.accentRed }]} onPress={handleReject}>
              <Text style={styles.submitBtnText}>Confirm Rejection</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedReq(null)}>
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
  headerCard: { padding: 14, borderWidth: 2, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 15, fontWeight: 'bold' },
  headerSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2 },
  bulkBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  bulkBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 11, marginLeft: 4 },
  scrollContent: { paddingBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  card: { padding: 14, borderWidth: 2, borderRadius: 8, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reqId: { fontSize: 11, fontWeight: 'bold', color: Tokens.colors.primary },
  applicantName: { fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  contactText: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 1 },
  verifyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  verifyBadgeText: { fontSize: 9, fontWeight: 'bold', color: '#FFFFFF' },
  identifierBox: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#F8FAFC', padding: 8, borderRadius: 6 },
  identifierText: { fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  docBox: { flexDirection: 'row', alignItems: 'center', marginTop: 6, backgroundColor: '#EFF6FF', padding: 8, borderRadius: 6 },
  docText: { fontSize: 12, fontWeight: 'bold', color: Tokens.colors.primary, marginLeft: 6 },
  actionsRow: { flexDirection: 'row', marginTop: 12 },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 6, marginRight: 8 },
  approveBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
  rejectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
  rejectBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
  statusBanner: { marginTop: 10, padding: 8, borderRadius: 4, alignItems: 'center' },
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
