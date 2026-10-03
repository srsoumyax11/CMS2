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

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  totalMarks: number;
  submittedCount: number;
  totalStudents: number;
}

interface Submission {
  id: string;
  studentName: string;
  rollNo: string;
  submittedTime: string;
  fileName: string;
  marks?: number;
  feedback?: string;
  graded: boolean;
}

export default function FacultyAssignmentsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [activeTab, setActiveTab] = useState<'assignments' | 'grading'>('assignments');

  // Create Assignment Modal State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [assTitle, setAssTitle] = useState('');
  const [assCourse, setAssCourse] = useState('CS-501');
  const [assMarks, setAssMarks] = useState('100');

  // Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [enteredMarks, setEnteredMarks] = useState('');
  const [enteredFeedback, setEnteredFeedback] = useState('');

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: 'ASN-101',
      title: 'Lab 3: Graph Algorithms & Minimum Spanning Trees',
      course: 'CS-501: Advanced Algorithms',
      dueDate: 'Oct 10, 2026',
      totalMarks: 100,
      submittedCount: 42,
      totalStudents: 60,
    },
    {
      id: 'ASN-099',
      title: 'Assignment 2: Distributed Consensus Protocols (Raft)',
      course: 'CS-504: Distributed Systems',
      dueDate: 'Oct 15, 2026',
      totalMarks: 50,
      submittedCount: 18,
      totalStudents: 55,
    },
  ]);

  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: 'SUB-401',
      studentName: 'Soham Chakraborty',
      rollNo: '2024-CS-089',
      submittedTime: 'Oct 02, 09:30 PM',
      fileName: 'Graph_Algorithms_Soham.pdf',
      graded: false,
    },
    {
      id: 'SUB-398',
      studentName: 'Rahul Sharma',
      rollNo: '2024-CS-044',
      submittedTime: 'Oct 02, 11:15 PM',
      fileName: 'Lab3_Rahul_Sharma.pdf',
      marks: 92,
      feedback: 'Excellent implementation of Kruskal & Prim algorithms!',
      graded: true,
    },
  ]);

  const handleCreateAssignment = () => {
    if (!assTitle.trim()) return;
    const newAss: Assignment = {
      id: `ASN-${Math.floor(100 + Math.random() * 900)}`,
      title: assTitle,
      course: assCourse,
      dueDate: 'Oct 20, 2026',
      totalMarks: parseInt(assMarks) || 100,
      submittedCount: 0,
      totalStudents: 60,
    };
    setAssignments([newAss, ...assignments]);
    setAssTitle('');
    setCreateModalVisible(false);
  };

  const handleSaveGrade = () => {
    if (!gradingSubmission) return;
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === gradingSubmission.id
          ? {
              ...s,
              marks: parseInt(enteredMarks) || 0,
              feedback: enteredFeedback,
              graded: true,
            }
          : s
      )
    );
    setGradingSubmission(null);
    setEnteredMarks('');
    setEnteredFeedback('');
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Top Filter Bar */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'assignments' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('assignments')}
        >
          <Text style={[styles.tabText, activeTab === 'assignments' && styles.tabTextActive]}>Active Assignments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'grading' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('grading')}
        >
          <Text style={[styles.tabText, activeTab === 'grading' && styles.tabTextActive]}>Submissions to Grade</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'assignments' ? (
          <View>
            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: Tokens.colors.primary }]}
              onPress={() => setCreateModalVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={styles.createBtnText}>Create New Assignment</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Published Course Assignments</Text>

            {assignments.map((a) => (
              <View key={a.id} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
                <Text style={styles.assCourse}>{a.course}</Text>
                <Text style={[styles.assTitle, { color: textPrimary }]}>{a.title}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>Due: {a.dueDate} • Marks: {a.totalMarks}</Text>

                  <Text style={[styles.metaText, { color: Tokens.colors.primary, fontWeight: 'bold' }]}>
                    Submissions: {a.submittedCount} / {a.totalStudents}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Student Submissions Queue</Text>

            {submissions.map((sub) => (
              <View key={sub.id} style={[styles.card, { backgroundColor: surface, borderColor: sub.graded ? border : Tokens.colors.accentOrange }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View>
                    <Text style={[styles.assTitle, { color: textPrimary }]}>{sub.studentName}</Text>
                    <Text style={styles.studentSub}>{sub.rollNo} • Submitted {sub.submittedTime}</Text>
                  </View>

                  <View
                    style={[
                      styles.gradeBadge,
                      { backgroundColor: sub.graded ? Tokens.colors.secondary : Tokens.colors.accentOrange },
                    ]}
                  >
                    <Text style={styles.gradeBadgeText}>{sub.graded ? `Graded (${sub.marks}/100)` : 'Pending Grade'}</Text>
                  </View>
                </View>

                <View style={styles.fileBox}>
                  <Ionicons name="document-text-outline" size={18} color={Tokens.colors.primary} />
                  <Text style={[styles.fileNameText, { color: textPrimary }]}>{sub.fileName}</Text>
                </View>

                {sub.graded && sub.feedback && (
                  <Text style={styles.feedbackText}>Remark: "{sub.feedback}"</Text>
                )}

                <TouchableOpacity
                  style={[styles.gradeBtn, { backgroundColor: Tokens.colors.primary }]}
                  onPress={() => {
                    setGradingSubmission(sub);
                    setEnteredMarks(sub.marks ? String(sub.marks) : '');
                    setEnteredFeedback(sub.feedback || '');
                  }}
                >
                  <Text style={styles.gradeBtnText}>{sub.graded ? 'Edit Grade' : 'Grade Submission'}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Assignment Modal */}
      <Modal visible={createModalVisible} animationType="fade" transparent onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>Publish New Course Assignment</Text>

            <Text style={styles.inputLabel}>Assignment Title</Text>
            <TextInput
              style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border }]}
              placeholder="e.g. Lab 4: Dynamic Programming"
              placeholderTextColor={Tokens.colors.textMuted}
              value={assTitle}
              onChangeText={setAssTitle}
            />

            <Text style={styles.inputLabel}>Total Points / Marks</Text>
            <TextInput
              style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border }]}
              placeholder="e.g. 100"
              placeholderTextColor={Tokens.colors.textMuted}
              keyboardType="number-pad"
              value={assMarks}
              onChangeText={setAssMarks}
            />

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Tokens.colors.primary }]} onPress={handleCreateAssignment}>
              <Text style={styles.submitBtnText}>Publish Assignment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Grade Submission Modal */}
      <Modal visible={!!gradingSubmission} animationType="fade" transparent onRequestClose={() => setGradingSubmission(null)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>Evaluate & Grade Submission</Text>
            <Text style={{ fontSize: 12, color: Tokens.colors.textMuted, marginTop: 4 }}>
              Student: {gradingSubmission?.studentName} ({gradingSubmission?.rollNo})
            </Text>

            <Text style={styles.inputLabel}>Marks Awarded (Out of 100)</Text>
            <TextInput
              style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border }]}
              placeholder="e.g. 95"
              placeholderTextColor={Tokens.colors.textMuted}
              keyboardType="number-pad"
              value={enteredMarks}
              onChangeText={setEnteredMarks}
            />

            <Text style={styles.inputLabel}>Faculty Evaluation Feedback</Text>
            <TextInput
              style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border, height: 60 }]}
              placeholder="Write feedback comments for student..."
              placeholderTextColor={Tokens.colors.textMuted}
              multiline
              value={enteredFeedback}
              onChangeText={setEnteredFeedback}
            />

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Tokens.colors.secondary }]} onPress={handleSaveGrade}>
              <Text style={styles.submitBtnText}>Save Grade & Send Feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setGradingSubmission(null)}>
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
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, marginBottom: 12 },
  createBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  card: { padding: 14, borderWidth: 2, borderRadius: 8, marginBottom: 12 },
  assCourse: { fontSize: 11, fontWeight: 'bold', color: Tokens.colors.primary },
  assTitle: { fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  studentSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  metaText: { fontSize: 11, color: Tokens.colors.textMuted },
  gradeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  gradeBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  fileBox: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#EFF6FF', padding: 8, borderRadius: 6 },
  fileNameText: { fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  feedbackText: { fontSize: 12, fontStyle: 'italic', color: Tokens.colors.textMuted, marginTop: 6 },
  gradeBtn: { marginTop: 10, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  gradeBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
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
