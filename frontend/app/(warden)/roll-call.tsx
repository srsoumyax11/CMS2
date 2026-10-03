import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
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

interface RollCallStudent {
  rollNo: string;
  name: string;
  roomNo: string;
  status: 'Present' | 'Absent' | 'Outpass';
}

interface Visitor {
  id: string;
  visitorName: string;
  relation: string;
  studentRoll: string;
  entryTime: string;
  passId: string;
  active: boolean;
}

export default function WardenRollCallScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [activeTab, setActiveTab] = useState<'rollcall' | 'visitors'>('rollcall');

  // Roll Call State
  const [students, setStudents] = useState<RollCallStudent[]>([
    { rollNo: '2024-CS-089', name: 'Soham Chakraborty', roomNo: 'B-304', status: 'Present' },
    { rollNo: '2024-CS-044', name: 'Rahul Sharma', roomNo: 'B-304', status: 'Present' },
    { rollNo: '2024-CS-012', name: 'Vikrant Singh', roomNo: 'B-108', status: 'Absent' },
    { rollNo: '2024-EC-045', name: 'Rohan Mehta', roomNo: 'B-212', status: 'Outpass' },
  ]);

  const [submitted, setSubmitted] = useState(false);

  // Visitor Logger Modal
  const [visitorModalVisible, setVisitorModalVisible] = useState(false);
  const [vName, setVName] = useState('');
  const [vRelation, setVRelation] = useState('');
  const [vStudentRoll, setVStudentRoll] = useState('');

  const [visitors, setVisitors] = useState<Visitor[]>([
    {
      id: 'V-801',
      visitorName: 'Mr. Suresh Chakraborty',
      relation: 'Father',
      studentRoll: '2024-CS-089',
      entryTime: '05:30 PM',
      passId: 'GP-9012',
      active: true,
    },
  ]);

  const handleToggleStatus = (rollNo: string, nextStatus: 'Present' | 'Absent' | 'Outpass') => {
    setStudents((prev) => prev.map((s) => (s.rollNo === rollNo ? { ...s, status: nextStatus } : s)));
  };

  const handleAddVisitor = () => {
    if (!vName.trim() || !vStudentRoll.trim()) return;
    const newV: Visitor = {
      id: `V-${Math.floor(100 + Math.random() * 900)}`,
      visitorName: vName,
      relation: vRelation || 'Guardian',
      studentRoll: vStudentRoll.toUpperCase(),
      entryTime: 'Just Now',
      passId: `GP-${Math.floor(1000 + Math.random() * 9000)}`,
      active: true,
    };
    setVisitors([newV, ...visitors]);
    setVName('');
    setVRelation('');
    setVStudentRoll('');
    setVisitorModalVisible(false);
  };

  const handleCheckoutVisitor = (id: string) => {
    setVisitors((prev) => prev.map((v) => (v.id === id ? { ...v, active: false } : v)));
  };

  const presentCount = students.filter((s) => s.status === 'Present').length;
  const absentCount = students.filter((s) => s.status === 'Absent').length;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Top Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'rollcall' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('rollcall')}
        >
          <Text style={[styles.tabText, activeTab === 'rollcall' && styles.tabTextActive]}>Night Roll Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'visitors' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('visitors')}
        >
          <Text style={[styles.tabText, activeTab === 'visitors' && styles.tabTextActive]}>Visitor Gate Log</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'rollcall' ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Summary Box */}
          <View style={[styles.summaryCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: Tokens.colors.secondary }]}>{presentCount}</Text>
              <Text style={styles.summaryLabel}>Present</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: Tokens.colors.accentRed }]}>{absentCount}</Text>
              <Text style={styles.summaryLabel}>Absent Alert</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: Tokens.colors.primary }]}>{students.length - presentCount - absentCount}</Text>
              <Text style={styles.summaryLabel}>On Outpass</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Room-by-Room Resident Checklist</Text>

          {students.map((s) => (
            <View key={s.rollNo} style={[styles.studentCard, { backgroundColor: surface, borderColor: border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.studentName, { color: textPrimary }]}>{s.name}</Text>
                <Text style={styles.studentSub}>Room {s.roomNo} • {s.rollNo}</Text>
              </View>

              <View style={styles.statusChipsRow}>
                {(['Present', 'Absent', 'Outpass'] as const).map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.statusChip,
                      s.status === st && {
                        backgroundColor:
                          st === 'Present'
                            ? Tokens.colors.secondary
                            : st === 'Absent'
                            ? Tokens.colors.accentRed
                            : Tokens.colors.primary,
                      },
                    ]}
                    onPress={() => handleToggleStatus(s.rollNo, st)}
                  >
                    <Text style={[styles.statusChipText, s.status === st && { color: '#FFF' }]}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.submitRollCallBtn, { backgroundColor: submitted ? Tokens.colors.secondary : Tokens.colors.primary }]}
            onPress={() => {
              setSubmitted(true);
              alert('Night Roll Call submitted! Notifications sent for absent students.');
            }}
          >
            <Ionicons name="checkmark-done" size={20} color="#FFF" />
            <Text style={styles.submitRollCallText}>{submitted ? 'Roll Call Submitted ✓' : 'Submit Night Roll Call'}</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={[styles.addVisitorBtn, { backgroundColor: Tokens.colors.primary }]}
            onPress={() => setVisitorModalVisible(true)}
          >
            <Ionicons name="person-add-outline" size={18} color="#FFF" />
            <Text style={styles.addVisitorBtnText}>Register New Hostel Visitor</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Active Visitor Entry Log</Text>

          {visitors.map((v) => (
            <View key={v.id} style={[styles.visitorCard, { backgroundColor: surface, borderColor: border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={[styles.studentName, { color: textPrimary }]}>{v.visitorName}</Text>
                  <Text style={styles.studentSub}>{v.relation} of Student {v.studentRoll}</Text>
                  <Text style={styles.timeText}>Entry Time: {v.entryTime} • Pass: {v.passId}</Text>
                </View>

                {v.active ? (
                  <TouchableOpacity
                    style={[styles.checkoutBtn, { backgroundColor: Tokens.colors.accentOrange }]}
                    onPress={() => handleCheckoutVisitor(v.id)}
                  >
                    <Text style={styles.checkoutBtnText}>Mark Exit</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.checkedOutBadge, { backgroundColor: Tokens.colors.borderDark }]}>
                    <Text style={{ fontSize: 10, color: '#FFF', fontWeight: 'bold' }}>Checked Out</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Visitor Entry Modal */}
      <Modal visible={visitorModalVisible} animationType="fade" transparent onRequestClose={() => setVisitorModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>Issue Visitor Entry Gate Pass</Text>

            <Text style={styles.inputLabel}>Visitor Full Name</Text>
            <TextInput
              style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border }]}
              placeholder="e.g. Suresh Chakraborty"
              placeholderTextColor={Tokens.colors.textMuted}
              value={vName}
              onChangeText={setVName}
            />

            <Text style={styles.inputLabel}>Relation with Student</Text>
            <TextInput
              style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border }]}
              placeholder="Father / Mother / Guardian / Friend"
              placeholderTextColor={Tokens.colors.textMuted}
              value={vRelation}
              onChangeText={setVRelation}
            />

            <Text style={styles.inputLabel}>Student Admission / Roll Number</Text>
            <TextInput
              style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border }]}
              placeholder="e.g. 2024-CS-089"
              placeholderTextColor={Tokens.colors.textMuted}
              value={vStudentRoll}
              onChangeText={setVStudentRoll}
            />

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Tokens.colors.primary }]} onPress={handleAddVisitor}>
              <Text style={styles.submitBtnText}>Generate Pass & Log Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setVisitorModalVisible(false)}>
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
  tabsRow: { flexDirection: 'row', marginBottom: 12 },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: Tokens.colors.borderDark,
    borderRadius: 6,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  tabText: { fontSize: 12, fontWeight: '600', color: Tokens.colors.textMuted },
  tabTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  scrollContent: { paddingBottom: 20 },
  summaryCard: { flexDirection: 'row', padding: 12, borderWidth: 2, borderRadius: 8, marginBottom: 12, justifyContent: 'space-around', alignItems: 'center' },
  summaryItem: { alignItems: 'center' },
  summaryVal: { fontSize: 18, fontWeight: 'bold' },
  summaryLabel: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2 },
  summaryDivider: { width: 1, height: '60%', backgroundColor: Tokens.colors.borderLight },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  studentCard: { padding: 12, borderWidth: 2, borderRadius: 8, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  studentName: { fontSize: 14, fontWeight: 'bold' },
  studentSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2 },
  statusChipsRow: { flexDirection: 'row' },
  statusChip: { paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderRadius: 4, marginLeft: 4 },
  statusChipText: { fontSize: 10, fontWeight: 'bold', color: Tokens.colors.textMuted },
  submitRollCallBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, marginTop: 10 },
  submitRollCallText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  addVisitorBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, marginBottom: 12 },
  addVisitorBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  visitorCard: { padding: 12, borderWidth: 2, borderRadius: 8, marginBottom: 10 },
  timeText: { fontSize: 10, color: Tokens.colors.textMuted, marginTop: 4 },
  checkoutBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  checkoutBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  checkedOutBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', padding: 18, borderWidth: 2, borderRadius: 8 },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  inputLabel: { fontSize: 12, fontWeight: 'bold', marginTop: 10, color: Tokens.colors.textMuted },
  modalInput: { borderWidth: 1, borderRadius: 6, padding: 10, fontSize: 13, marginTop: 6 },
  submitBtn: { paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 14 },
  submitBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { paddingVertical: 10, alignItems: 'center', marginTop: 6 },
  cancelBtnText: { color: Tokens.colors.textMuted, fontSize: 12 },
});
