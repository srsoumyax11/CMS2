import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';

export interface ClassSlot {
  id: string;
  timeSlot: string;
  subjectCode: string;
  subjectName: string;
  room: string;
  batch: string;
}

export interface FacultyTimetableProps {
  slots?: ClassSlot[];
}

const DEFAULT_SLOTS: ClassSlot[] = [
  { id: 'slot_1', timeSlot: '09:00 AM - 10:00 AM', subjectCode: 'CS101', subjectName: 'Data Structures & Algorithms', room: 'LH-102', batch: 'CSE-2024-A' },
  { id: 'slot_2', timeSlot: '11:15 AM - 12:15 PM', subjectCode: 'CS304', subjectName: 'Database Management Systems', room: 'Lab-3', batch: 'CSE-2023-B' },
  { id: 'slot_3', timeSlot: '02:00 PM - 04:00 PM', subjectCode: 'CS101P', subjectName: 'Data Structures Lab', room: 'Software Lab 1', batch: 'CSE-2024-A' },
];

export const FacultyTimetable: React.FC<FacultyTimetableProps> = ({ slots = DEFAULT_SLOTS }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>📅 Teaching Schedule & Timetable</Text>
      {slots.map((s) => (
        <Card key={s.id} style={styles.slotCard}>
          <Text style={styles.timeText}>{s.timeSlot}</Text>
          <Text style={styles.subjectText}>{s.subjectCode} — {s.subjectName}</Text>
          <Text style={styles.metaText}>Classroom: {s.room} | Batch: {s.batch}</Text>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md },
  headerTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[900], marginBottom: spacing.md },
  slotCard: { padding: spacing.md, marginBottom: spacing.sm },
  timeText: { fontSize: typography.fontSize.xs, fontWeight: 'bold', color: colors.primary[600] },
  subjectText: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.gray[900], marginVertical: 2 },
  metaText: { fontSize: typography.fontSize.xs, color: colors.gray[600] },
});
