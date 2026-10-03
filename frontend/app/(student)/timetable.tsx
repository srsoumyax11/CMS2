import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Tokens } from '../../src/theme/tokens';

interface PeriodItem {
  periodNo: number;
  time: string;
  subject: string;
  code: string;
  faculty: string;
  room: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'CANCELLED' | 'ROOM_CHANGED';
  newRoom?: string;
}

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const MOCK_PERIODS: PeriodItem[] = [
  { periodNo: 1, time: '09:00 AM - 10:00 AM', subject: 'Data Structures & Algorithms', code: 'CS301', faculty: 'Prof. A. Mehta', room: 'Room 204, Block B', status: 'IN_PROGRESS' },
  { periodNo: 2, time: '10:00 AM - 11:00 AM', subject: 'Operating Systems', code: 'CS302', faculty: 'Prof. K. Sharma', room: 'Room 204, Block B', status: 'SCHEDULED' },
  { periodNo: 3, time: '11:15 AM - 12:15 PM', subject: 'Database Management Systems', code: 'CS303', faculty: 'Prof. S. Rao', room: 'Lab 3, CS Block', status: 'ROOM_CHANGED', newRoom: 'Lab 5, IT Block' },
  { periodNo: 4, time: '01:30 PM - 03:30 PM', subject: 'Computer Networks Lab', code: 'CS304L', faculty: 'Prof. V. Gupta', room: 'Network Lab 1', status: 'CANCELLED' },
];

export default function TimetableScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [activeDay, setActiveDay] = useState('MON');

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Weekday Selector Bar */}
      <View style={[styles.dayBar, { backgroundColor: surface, borderColor: border }]}>
        {WEEKDAYS.map((day) => {
          const isSelected = activeDay === day;
          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayChip,
                {
                  backgroundColor: isSelected ? Tokens.colors.primary : 'transparent',
                },
              ]}
              onPress={() => setActiveDay(day)}
            >
              <Text style={[styles.dayText, { color: isSelected ? '#FFFFFF' : textPrimary }]}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Period Slots List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {MOCK_PERIODS.map((period) => {
          const badgeColor =
            period.status === 'IN_PROGRESS'
              ? Tokens.colors.secondary
              : period.status === 'ROOM_CHANGED'
              ? Tokens.colors.accentOrange
              : period.status === 'CANCELLED'
              ? Tokens.colors.accentRed
              : Tokens.colors.primary;

          return (
            <View
              key={period.periodNo}
              style={[
                styles.periodCard,
                {
                  backgroundColor: surface,
                  borderColor: period.status === 'IN_PROGRESS' ? Tokens.colors.secondary : border,
                  borderWidth: period.status === 'IN_PROGRESS' ? Tokens.borderWidths.thick : Tokens.borderWidths.flat,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                  <Text style={styles.badgeText}>P{period.periodNo} • {period.status.replace('_', ' ')}</Text>
                </View>
                <Text style={styles.timeText}>{period.time}</Text>
              </View>

              <Text style={[styles.subjectTitle, { color: textPrimary }]}>{period.subject} ({period.code})</Text>
              <Text style={styles.facultyText}><Ionicons name="person-outline" size={12} color={Tokens.colors.textMuted} /> {period.faculty}</Text>

              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={Tokens.colors.primary} />
                <Text style={[styles.locationText, { color: textPrimary }]}>
                  {period.status === 'ROOM_CHANGED' ? `Changed to: ${period.newRoom}` : period.room}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dayBar: { flexDirection: 'row', padding: Tokens.spacing.sm, borderBottomWidth: Tokens.borderWidths.flat, gap: 4 },
  dayChip: { flex: 1, paddingVertical: Tokens.spacing.xs, alignItems: 'center', borderRadius: Tokens.radii.sm },
  dayText: { fontSize: 11, fontWeight: '900' },
  listContent: { padding: Tokens.spacing.md, gap: Tokens.spacing.md },
  periodCard: { padding: Tokens.spacing.md, borderRadius: Tokens.radii.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Tokens.spacing.xs },
  badge: { paddingHorizontal: Tokens.spacing.xs, paddingVertical: 2, borderRadius: Tokens.radii.sm },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  timeText: { fontSize: 11, color: Tokens.colors.textMuted },
  subjectTitle: { fontSize: 15, fontWeight: '900', marginBottom: 4 },
  facultyText: { fontSize: 12, color: Tokens.colors.textMuted, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, fontWeight: '700' },
});
