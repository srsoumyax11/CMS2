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

interface OutpassRequest {
  id: string;
  studentName: string;
  rollNo: string;
  roomNo: string;
  category: 'Local' | 'Overnight' | 'Emergency';
  reason: string;
  leaveTime: string;
  returnTime: string;
  parentStatus: 'Approved' | 'Pending' | 'Not Required';
  status: 'pending_warden' | 'active' | 'overdue' | 'approved';
  guardianPhone: string;
  attendancePercent: number;
}

export default function WardenOutpassScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [activeTab, setActiveTab] = useState<'pending_warden' | 'active' | 'overdue' | 'approved'>('pending_warden');

  // Selected Outpass for Modal Decision
  const [selectedItem, setSelectedItem] = useState<OutpassRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [remark, setRemark] = useState('');

  const [requests, setRequests] = useState<OutpassRequest[]>([
    {
      id: 'OP-501',
      studentName: 'Aditya Verma',
      rollNo: '2024-CS-089',
      roomNo: 'B-304',
      category: 'Overnight',
      reason: 'Attending cousin wedding ceremony in hometown',
      leaveTime: 'Oct 04, 05:00 PM',
      returnTime: 'Oct 06, 08:00 AM',
      parentStatus: 'Approved',
      status: 'pending_warden',
      guardianPhone: '+91 98765 43210',
      attendancePercent: 88.5,
    },
    {
      id: 'OP-498',
      studentName: 'Vikrant Singh',
      rollNo: '2024-CS-012',
      roomNo: 'B-108',
      category: 'Local',
      reason: 'Medical checkup at City Health Clinic',
      leaveTime: 'Oct 03, 02:00 PM',
      returnTime: 'Oct 03, 08:00 PM',
      parentStatus: 'Not Required',
      status: 'overdue',
      guardianPhone: '+91 91234 56789',
      attendancePercent: 72.0,
    },
    {
      id: 'OP-490',
      studentName: 'Rohan Mehta',
      rollNo: '2024-EC-045',
      roomNo: 'B-212',
      category: 'Local',
      reason: 'Buying course project electronics components',
      leaveTime: 'Oct 03, 04:00 PM',
      returnTime: 'Oct 03, 09:00 PM',
      parentStatus: 'Not Required',
      status: 'active',
      guardianPhone: '+91 98111 22334',
      attendancePercent: 91.2,
    },
  ]);

  const filtered = requests.filter((r) => r.status === activeTab);

  const handleDecision = () => {
    if (!selectedItem || !actionType) return;
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === selectedItem.id) {
          return {
            ...r,
            status: actionType === 'approve' ? 'approved' : 'approved',
          };
        }
        return r;
      })
    );
    setSelectedItem(null);
    setActionType(null);
    setRemark('');
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Filter Tabs Bar */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'pending_warden' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('pending_warden')}
        >
          <Text style={[styles.tabText, activeTab === 'pending_warden' && styles.tabTextActive]}>Pending</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'active' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>Checked Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'overdue' && { backgroundColor: Tokens.colors.accentRed }]}
          onPress={() => setActiveTab('overdue')}
        >
          <Text style={[styles.tabText, activeTab === 'overdue' && styles.tabTextActive]}>Overdue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'approved' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('approved')}
        >
          <Text style={[styles.tabText, activeTab === 'approved' && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filtered.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: surface, borderColor: border }]}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color={Tokens.colors.secondary} />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>No Outpass Requests Found</Text>
            <Text style={styles.emptySub}>All student outpasses in this queue have been processed.</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <View key={item.id} style={[styles.card, { backgroundColor: surface, borderColor: item.status === 'overdue' ? Tokens.colors.accentRed : border }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.studentName, { color: textPrimary }]}>{item.studentName}</Text>
                  <Text style={styles.studentSub}>{item.rollNo} • Room {item.roomNo}</Text>
                </View>

                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: item.category === 'Emergency' ? Tokens.colors.accentRed : Tokens.colors.primary },
                  ]}
                >
                  <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>
              </View>

              <Text style={[styles.reasonText, { color: textPrimary }]}>"{item.reason}"</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Leave Time:</Text>
                  <Text style={[styles.metaVal, { color: textPrimary }]}>{item.leaveTime}</Text>
                </View>

                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Return Time:</Text>
                  <Text style={[styles.metaVal, { color: item.status === 'overdue' ? Tokens.colors.accentRed : textPrimary }]}>{item.returnTime}</Text>
                </View>
              </View>

              <View style={styles.parentRow}>
                <Text style={styles.metaLabel}>Parent Consent:</Text>
                <Text style={[styles.parentStatus, { color: item.parentStatus === 'Approved' ? Tokens.colors.secondary : Tokens.colors.accentOrange }]}>
                  {item.parentStatus}
                </Text>
                <Text style={[styles.attendanceText, { color: item.attendancePercent < 75 ? Tokens.colors.accentRed : Tokens.colors.secondary }]}>
                  Attendance: {item.attendancePercent}%
                </Text>
              </View>

              {item.status === 'pending_warden' && (
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.decisionBtn, { backgroundColor: Tokens.colors.secondary }]}
                    onPress={() => {
                      setSelectedItem(item);
                      setActionType('approve');
                    }}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                    <Text style={styles.decisionBtnText}>Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.decisionBtn, { backgroundColor: Tokens.colors.accentRed }]}
                    onPress={() => {
                      setSelectedItem(item);
                      setActionType('reject');
                    }}
                  >
                    <Ionicons name="close" size={16} color="#FFF" />
                    <Text style={styles.decisionBtnText}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.callBtn, { borderColor: border }]}
                    onPress={() => alert(`Calling Parent ${item.guardianPhone}`)}
                  >
                    <Ionicons name="call-outline" size={16} color={Tokens.colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Decision Remark Modal */}
      <Modal visible={!!selectedItem} animationType="fade" transparent onRequestClose={() => setSelectedItem(null)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>
              {actionType === 'approve' ? 'Approve Outpass' : 'Reject Outpass'}
            </Text>
            <Text style={{ fontSize: 12, color: Tokens.colors.textMuted, marginTop: 4 }}>
              Student: {selectedItem?.studentName} ({selectedItem?.rollNo})
            </Text>

            <Text style={styles.inputLabel}>Warden Remarks / Instructions</Text>
            <TextInput
              style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border }]}
              placeholder={actionType === 'approve' ? 'e.g. Approved. Carry valid ID card.' : 'Enter reason for rejection...'}
              placeholderTextColor={Tokens.colors.textMuted}
              multiline
              value={remark}
              onChangeText={setRemark}
            />

            <TouchableOpacity
              style={[
                styles.submitModalBtn,
                { backgroundColor: actionType === 'approve' ? Tokens.colors.secondary : Tokens.colors.accentRed },
              ]}
              onPress={handleDecision}
            >
              <Text style={styles.submitModalBtnText}>Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setSelectedItem(null)}>
              <Text style={styles.cancelModalBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  tabsRow: { flexDirection: 'row', marginBottom: 12 },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: Tokens.colors.borderDark,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  tabText: { fontSize: 11, fontWeight: '600', color: Tokens.colors.textMuted },
  tabTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  scrollContent: { paddingBottom: 20 },
  card: { padding: 14, borderWidth: 2, borderRadius: 8, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  studentName: { fontSize: 15, fontWeight: 'bold' },
  studentSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 1 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  categoryBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  reasonText: { fontSize: 13, fontStyle: 'italic', marginTop: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  metaCol: { flex: 1 },
  metaLabel: { fontSize: 10, color: Tokens.colors.textMuted },
  metaVal: { fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  parentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  parentStatus: { fontSize: 11, fontWeight: 'bold', marginLeft: 6, flex: 1 },
  attendanceText: { fontSize: 11, fontWeight: 'bold' },
  actionsRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  decisionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 6, marginRight: 8 },
  decisionBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
  callBtn: { width: 36, height: 36, borderWidth: 2, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  emptyCard: { padding: 24, borderWidth: 2, borderRadius: 8, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 12 },
  emptySub: { fontSize: 12, color: Tokens.colors.textMuted, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', padding: 18, borderWidth: 2, borderRadius: 8 },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  inputLabel: { fontSize: 12, fontWeight: 'bold', marginTop: 12, color: Tokens.colors.textMuted },
  modalInput: { borderWidth: 1, borderRadius: 6, padding: 10, fontSize: 13, marginTop: 6, height: 70 },
  submitModalBtn: { paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 14 },
  submitModalBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  cancelModalBtn: { paddingVertical: 10, alignItems: 'center', marginTop: 6 },
  cancelModalBtnText: { color: Tokens.colors.textMuted, fontSize: 12 },
});
