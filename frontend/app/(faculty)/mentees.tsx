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

interface Mentee {
  rollNo: string;
  name: string;
  cgpa: number;
  attendancePercent: number;
  riskLevel: 'Normal' | 'Warning' | 'Critical';
  lastMeeting: string;
  notesCount: number;
}

export default function FacultyMenteesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [mentees, setMentees] = useState<Mentee[]>([
    {
      rollNo: '2024-CS-089',
      name: 'Soham Chakraborty',
      cgpa: 8.82,
      attendancePercent: 91.5,
      riskLevel: 'Normal',
      lastMeeting: 'Sep 20, 2026',
      notesCount: 3,
    },
    {
      rollNo: '2024-CS-012',
      name: 'Vikrant Singh',
      cgpa: 6.10,
      attendancePercent: 71.0,
      riskLevel: 'Warning',
      lastMeeting: 'Aug 14, 2026',
      notesCount: 1,
    },
    {
      rollNo: '2024-CS-078',
      name: 'Devendra Kumar',
      cgpa: 5.40,
      attendancePercent: 62.5,
      riskLevel: 'Critical',
      lastMeeting: 'None',
      notesCount: 0,
    },
  ]);

  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedMentee) return;
    setMentees((prev) =>
      prev.map((m) =>
        m.rollNo === selectedMentee.rollNo
          ? { ...m, notesCount: m.notesCount + 1, lastMeeting: 'Today' }
          : m
      )
    );
    setSelectedMentee(null);
    setNewNote('');
    alert('Private mentor counseling note saved!');
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Assigned Mentees Roster ({mentees.length})</Text>

        {mentees.map((m) => (
          <View key={m.rollNo} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.menteeName, { color: textPrimary }]}>{m.name}</Text>
                <Text style={styles.menteeSub}>{m.rollNo} • Last Session: {m.lastMeeting}</Text>
              </View>

              <View
                style={[
                  styles.riskBadge,
                  {
                    backgroundColor:
                      m.riskLevel === 'Normal'
                        ? Tokens.colors.secondary
                        : m.riskLevel === 'Warning'
                        ? Tokens.colors.accentOrange
                        : Tokens.colors.accentRed,
                  },
                ]}
              >
                <Text style={styles.riskBadgeText}>{m.riskLevel}</Text>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>CGPA</Text>
                <Text style={[styles.metricVal, { color: textPrimary }]}>{m.cgpa}</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Attendance</Text>
                <Text style={[styles.metricVal, { color: m.attendancePercent < 75 ? Tokens.colors.accentRed : Tokens.colors.secondary }]}>
                  {m.attendancePercent}%
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Mentor Notes</Text>
                <Text style={[styles.metricVal, { color: Tokens.colors.primary }]}>{m.notesCount} Notes</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Tokens.colors.primary }]}
                onPress={() => setSelectedMentee(m)}
              >
                <Ionicons name="create-outline" size={16} color="#FFF" />
                <Text style={styles.actionBtnText}>Add Counseling Note</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Tokens.colors.accentPurple }]}
                onPress={() => alert(`Sent official parent meeting request to ${m.name}'s guardian.`)}
              >
                <Ionicons name="mail-outline" size={16} color="#FFF" />
                <Text style={styles.actionBtnText}>Request Parent Meet</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Note Logger Modal */}
      <Modal visible={!!selectedMentee} animationType="fade" transparent onRequestClose={() => setSelectedMentee(null)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>Log Private Mentor Note</Text>
            <Text style={{ fontSize: 12, color: Tokens.colors.textMuted, marginTop: 4 }}>
              Mentee: {selectedMentee?.name} ({selectedMentee?.rollNo})
            </Text>

            <Text style={styles.inputLabel}>Mentorship Session Summary & Advice</Text>
            <TextInput
              style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border, height: 75 }]}
              placeholder="e.g. Discussed attendance drop in CS-501. Advised extra tutorial practice."
              placeholderTextColor={Tokens.colors.textMuted}
              multiline
              value={newNote}
              onChangeText={setNewNote}
            />

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Tokens.colors.primary }]} onPress={handleAddNote}>
              <Text style={styles.submitBtnText}>Save Confidential Note</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedMentee(null)}>
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
  menteeName: { fontSize: 15, fontWeight: 'bold' },
  menteeSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 1 },
  riskBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  riskBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  metricItem: { alignItems: 'center' },
  metricLabel: { fontSize: 10, color: Tokens.colors.textMuted },
  metricVal: { fontSize: 13, fontWeight: 'bold', marginTop: 2 },
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
