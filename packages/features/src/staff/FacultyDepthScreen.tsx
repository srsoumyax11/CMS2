import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Input, Card, DataList } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { en } from '@campus/i18n';
import { z } from 'zod';
import { ApiClient, AppError } from '@campus/api-client';

export const FacultyDepthScreen: React.FC<{ apiClient: ApiClient; i18nDict?: typeof en }> = ({
  apiClient,
  i18nDict = en,
}) => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'marks' | 'leave' | 'atrisk' | 'mentees'>('assignments');
  const [assignments, setAssignments] = useState<{ id: string; title: string; dueDate: string; submissionsCount: number }[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<{ id: string; name: string; rollNo: string; attendancePct: number; gpa: number }[]>([]);
  const [mentees, setMentees] = useState<{ id: string; name: string; notes: string }[]>([]);
  const [marksInput, setMarksInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchFacultyData();
  }, [activeTab]);

  const fetchFacultyData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'assignments') {
        const res = await apiClient.get(
          '/faculty/assignments',
          z.array(z.object({ id: z.string(), title: z.string(), dueDate: z.string(), submissionsCount: z.number() }))
        );
        setAssignments(res);
      } else if (activeTab === 'atrisk') {
        const res = await apiClient.get(
          '/faculty/at-risk-students',
          z.array(z.object({ id: z.string(), name: z.string(), rollNo: z.string(), attendancePct: z.number(), gpa: z.number() }))
        );
        setAtRiskStudents(res);
      } else if (activeTab === 'mentees') {
        const res = await apiClient.get(
          '/faculty/mentees',
          z.array(z.object({ id: z.string(), name: z.string(), notes: z.string() }))
        );
        setMentees(res);
      }
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadMarks = async () => {
    if (!marksInput.trim()) return;
    setIsLoading(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      await apiClient.post(
        '/faculty/marks/upload',
        z.object({ uploadedCount: z.number() }),
        { csvData: marksInput }
      );
      setStatusMsg('Marks uploaded and validated successfully!');
      setMarksInput('');
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.tabBar}>
        <Button label="Assignments" variant={activeTab === 'assignments' ? 'primary' : 'secondary'} onPress={() => setActiveTab('assignments')} testID="tab-assignments" />
        <Button label="Marks Upload" variant={activeTab === 'marks' ? 'primary' : 'secondary'} onPress={() => setActiveTab('marks')} testID="tab-marks" />
        <Button label="Leave & Substitute" variant={activeTab === 'leave' ? 'primary' : 'secondary'} onPress={() => setActiveTab('leave')} testID="tab-leave" />
        <Button label="At-Risk List" variant={activeTab === 'atrisk' ? 'primary' : 'secondary'} onPress={() => setActiveTab('atrisk')} testID="tab-atrisk" />
        <Button label="Mentees" variant={activeTab === 'mentees' ? 'primary' : 'secondary'} onPress={() => setActiveTab('mentees')} testID="tab-mentees" />
      </View>

      {statusMsg && <Text style={styles.successText}>{statusMsg}</Text>}
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

      {activeTab === 'assignments' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Assignments & Grading</Text>
          <DataList
            data={assignments}
            isLoading={isLoading}
            onRefresh={fetchFacultyData}
            emptyTitle="No Assignments"
            emptyDescription="No assignments created for active courses."
            renderItem={({ item }) => (
              <Card key={item.id} style={styles.itemCard}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>Due Date: {item.dueDate}</Text>
                <Text style={styles.itemMeta}>Submissions: {item.submissionsCount}</Text>
                <Button label="Grade Submissions" onPress={() => {}} testID={`btn-grade-${item.id}`} />
              </Card>
            )}
          />
        </Card>
      )}

      {activeTab === 'marks' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Batch Marks Upload & Validation</Text>
          <Input label="CSV Format (rollNo, subjectCode, marks)" value={marksInput} onChangeText={setMarksInput} multiline testID="input-marks-csv" />
          <Button label="Validate & Upload Marks" onPress={handleUploadMarks} isLoading={isLoading} testID="btn-upload-marks" />
        </Card>
      )}

      {activeTab === 'leave' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Faculty Leave & Substitute Request</Text>
          <Input label="Substitute Faculty Name / ID" value="" onChangeText={() => {}} testID="input-substitute" />
          <Button label="Submit Leave Application" onPress={() => setStatusMsg('Leave request submitted with substitute faculty.')} testID="btn-submit-leave" />
        </Card>
      )}

      {activeTab === 'atrisk' && (
        <Card style={styles.card}>
          <Text style={styles.title}>At-Risk Students (Attendance / Low GPA)</Text>
          {atRiskStudents.map((st) => (
            <Card key={st.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{st.name} ({st.rollNo})</Text>
              <Text style={styles.itemMeta}>Attendance: {st.attendancePct}% | GPA: {st.gpa}</Text>
              <Button label="Notify / Flag Mentorship" variant="secondary" onPress={() => {}} testID={`btn-atrisk-${st.id}`} />
            </Card>
          ))}
        </Card>
      )}

      {activeTab === 'mentees' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Assigned Mentees & Notes</Text>
          {mentees.map((m) => (
            <Card key={m.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{m.name}</Text>
              <Text style={styles.itemMeta}>Mentorship Notes: {m.notes}</Text>
            </Card>
          ))}
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  tabBar: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md, flexWrap: 'wrap' },
  card: { padding: spacing.lg },
  title: { fontSize: typography.fontSize.xl, fontWeight: 'bold', color: colors.gray[900], marginBottom: spacing.md },
  successText: { color: colors.success.main, marginVertical: spacing.xs },
  errorText: { color: colors.danger.main, marginVertical: spacing.xs },
  itemCard: { padding: spacing.md, marginBottom: spacing.xs },
  itemTitle: { fontWeight: 'bold', fontSize: typography.fontSize.base },
  itemMeta: { fontSize: typography.fontSize.sm, color: colors.gray[600], marginBottom: spacing.xs },
});
