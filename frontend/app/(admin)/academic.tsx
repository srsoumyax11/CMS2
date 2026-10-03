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

interface PeriodSlot {
  periodNo: number;
  label: string;
  startTime: string;
  endTime: string;
  type: 'Lecture' | 'Break' | 'Lab';
}

export default function AdminAcademicScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [activeTab, setActiveTab] = useState<'term' | 'periods' | 'location'>('term');

  // Term Form State
  const [termName, setTermName] = useState('Autumn Semester 2026');
  const [academicYear, setAcademicYear] = useState('2026 - 2027');

  // Period Slots State
  const [slots, setSlots] = useState<PeriodSlot[]>([
    { periodNo: 1, label: 'Period 1', startTime: '09:00 AM', endTime: '10:00 AM', type: 'Lecture' },
    { periodNo: 2, label: 'Period 2', startTime: '10:00 AM', endTime: '11:00 AM', type: 'Lecture' },
    { periodNo: 3, label: 'Morning Tea Break', startTime: '11:00 AM', endTime: '11:15 AM', type: 'Break' },
    { periodNo: 4, label: 'Period 3 (Lab Session)', startTime: '11:15 AM', endTime: '01:15 PM', type: 'Lab' },
  ]);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Navigation Bar */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'term' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('term')}
        >
          <Text style={[styles.tabText, activeTab === 'term' && styles.tabTextActive]}>Term Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'periods' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('periods')}
        >
          <Text style={[styles.tabText, activeTab === 'periods' && styles.tabTextActive]}>Period Slots</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'location' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('location')}
        >
          <Text style={[styles.tabText, activeTab === 'location' && styles.tabTextActive]}>Location Tree</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'term' && (
          <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Academic Term Configuration</Text>

            <Text style={styles.inputLabel}>Active Term Name</Text>
            <TextInput
              style={[styles.input, { color: textPrimary, backgroundColor: bg, borderColor: border }]}
              value={termName}
              onChangeText={setTermName}
            />

            <Text style={styles.inputLabel}>Academic Year</Text>
            <TextInput
              style={[styles.input, { color: textPrimary, backgroundColor: bg, borderColor: border }]}
              value={academicYear}
              onChangeText={setAcademicYear}
            />

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: Tokens.colors.primary }]}
              onPress={() => alert('Academic term settings saved successfully!')}
            >
              <Text style={styles.saveBtnText}>Save Term Configuration</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'periods' && (
          <View>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Daily Timetable Period Configurator</Text>

            {slots.map((s) => (
              <View key={s.periodNo} style={[styles.slotCard, { backgroundColor: surface, borderColor: border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.slotLabel, { color: textPrimary }]}>{s.label}</Text>
                  <Text style={styles.slotTime}>{s.startTime} - {s.endTime}</Text>
                </View>

                <View
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor:
                        s.type === 'Lecture'
                          ? Tokens.colors.primary
                          : s.type === 'Lab'
                          ? Tokens.colors.accentPurple
                          : Tokens.colors.accentOrange,
                    },
                  ]}
                >
                  <Text style={styles.typeBadgeText}>{s.type}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'location' && (
          <View>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Campus Location Hierarchy Tree</Text>

            {[
              { building: 'Academic Block A', floors: '3 Floors • 18 Classrooms • 4 Computer Labs' },
              { building: 'Hostel Block B (Boys)', floors: '4 Floors • 120 Resident Rooms' },
              { building: 'Central Library Building', floors: '2 Floors • Reading Rooms & Digital Archival' },
            ].map((loc, idx) => (
              <View key={idx} style={[styles.locCard, { backgroundColor: surface, borderColor: border }]}>
                <Ionicons name="business-outline" size={24} color={Tokens.colors.primary} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.locTitle, { color: textPrimary }]}>{loc.building}</Text>
                  <Text style={styles.locSub}>{loc.floors}</Text>
                </View>

                <TouchableOpacity style={styles.editLocBtn} onPress={() => alert(`Editing rooms for ${loc.building}`)}>
                  <Ionicons name="create-outline" size={18} color={Tokens.colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  tabText: { fontSize: 11, fontWeight: '600', color: Tokens.colors.textMuted },
  tabTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  scrollContent: { paddingBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  card: { padding: 14, borderWidth: 2, borderRadius: 8 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', marginTop: 10, color: Tokens.colors.textMuted },
  input: { borderWidth: 1, borderRadius: 6, padding: 10, fontSize: 13, marginTop: 6 },
  saveBtn: { paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 14 },
  saveBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  slotCard: { padding: 12, borderWidth: 2, borderRadius: 8, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  slotLabel: { fontSize: 14, fontWeight: 'bold' },
  slotTime: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  typeBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  locCard: { padding: 14, borderWidth: 2, borderRadius: 8, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  locTitle: { fontSize: 14, fontWeight: 'bold' },
  locSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2 },
  editLocBtn: { padding: 6 },
});
