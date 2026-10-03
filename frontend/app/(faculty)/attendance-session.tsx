import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Tokens } from '../../src/theme/tokens';

interface RosterStudent {
  rollNo: string;
  name: string;
  scannedTime?: string;
  status: 'Present' | 'Absent';
}

export default function FacultyAttendanceSessionScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [qrRefreshTimer, setQrRefreshTimer] = useState<number>(15);
  const [sessionLocked, setSessionLocked] = useState(false);

  // Mock Live Roster
  const [students, setStudents] = useState<RosterStudent[]>([
    { rollNo: '2024-CS-089', name: 'Soham Chakraborty', scannedTime: '10:02 AM', status: 'Present' },
    { rollNo: '2024-CS-044', name: 'Rahul Sharma', scannedTime: '10:04 AM', status: 'Present' },
    { rollNo: '2024-CS-012', name: 'Vikrant Singh', status: 'Absent' },
    { rollNo: '2024-CS-055', name: 'Ananya Roy', scannedTime: '10:05 AM', status: 'Present' },
    { rollNo: '2024-CS-078', name: 'Devendra Kumar', status: 'Absent' },
  ]);

  // Dynamic QR auto-refresh timer (15s cooldown)
  useEffect(() => {
    if (sessionLocked) return;
    const interval = setInterval(() => {
      setQrRefreshTimer((prev) => (prev <= 1 ? 15 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionLocked]);

  const toggleManualStatus = (rollNo: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.rollNo === rollNo) {
          const nextStatus = s.status === 'Present' ? 'Absent' : 'Present';
          return {
            ...s,
            status: nextStatus,
            scannedTime: nextStatus === 'Present' ? 'Manual Override' : undefined,
          };
        }
        return s;
      })
    );
  };

  const presentCount = students.filter((s) => s.status === 'Present').length;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Session Top Header */}
      <View style={[styles.sessionHeaderCard, { backgroundColor: surface, borderColor: Tokens.colors.primary }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.subjectTitle, { color: textPrimary }]}>CS-501: Advanced Algorithms</Text>

          <Text style={styles.sessionSub}>
            Session ID: #SES-9812 • Room 302 • {sessionLocked ? 'SESSION LOCKED' : 'LIVE QR ACTIVE'}
          </Text>
        </View>

        <View style={[styles.counterBadge, { backgroundColor: Tokens.colors.secondary }]}>
          <Text style={styles.counterText}>{presentCount} / {students.length}</Text>

          <Text style={styles.counterLabel}>Scanned</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Rotating Dynamic QR Presenter */}
        {!sessionLocked ? (
          <View style={[styles.qrDisplayCard, { backgroundColor: surface, borderColor: Tokens.colors.primary }]}>
            <View style={styles.timerRow}>
              <Ionicons name="time-outline" size={18} color={Tokens.colors.primary} />
              <Text style={styles.timerText}>Refreshes in {qrRefreshTimer}s (Anti-Proxy Protection)</Text>
            </View>

            {/* QR Visual */}
            <View style={styles.qrVisualBox}>
              <Ionicons name="qr-code-sharp" size={200} color={Tokens.colors.textDark} />
            </View>

            <Text style={styles.qrPayloadText}>
              Dynamic Payload Token: C7-ATT-CS501-SEED:{qrRefreshTimer}
            </Text>

            <TouchableOpacity
              style={[styles.lockBtn, { backgroundColor: Tokens.colors.accentRed }]}
              onPress={() => {
                setSessionLocked(true);
                alert('Attendance session locked! Further QR scans are disabled.');
              }}
            >
              <Ionicons name="lock-closed" size={16} color="#FFF" />
              <Text style={styles.lockBtnText}>Lock Session & Finalize</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.lockedCard, { backgroundColor: '#ECFDF5', borderColor: Tokens.colors.secondary }]}>
            <Ionicons name="checkmark-circle" size={42} color={Tokens.colors.secondary} />
            <Text style={styles.lockedTitle}>Attendance Session Finalized ✓</Text>

            <Text style={styles.lockedSub}>Total Present: {presentCount} • Total Absent: {students.length - presentCount}</Text>
          </View>
        )}

        {/* Live Student Check-in Roster */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Live Scanned Roster & Manual Override</Text>

        {students.map((st) => (
          <View key={st.rollNo} style={[styles.studentCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.studentName, { color: textPrimary }]}>{st.name}</Text>
              <Text style={styles.studentSub}>
                {st.rollNo} • {st.scannedTime ? `Scanned at ${st.scannedTime}` : 'Not Scanned Yet'}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.statusBadgeBtn,
                { backgroundColor: st.status === 'Present' ? Tokens.colors.secondary : Tokens.colors.accentRed },
              ]}
              onPress={() => toggleManualStatus(st.rollNo)}
            >
              <Text style={styles.statusBadgeText}>{st.status} (Tap to Toggle)</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  sessionHeaderCard: { padding: 14, borderWidth: 2, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  subjectTitle: { fontSize: 16, fontWeight: 'bold' },
  sessionSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2 },
  counterBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  counterText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  counterLabel: { fontSize: 9, fontWeight: 'bold', color: '#FFFFFF' },
  scrollContent: { paddingBottom: 20 },
  qrDisplayCard: { padding: 16, borderWidth: 3, borderRadius: 12, alignItems: 'center', marginBottom: 14 },
  timerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  timerText: { fontSize: 12, fontWeight: 'bold', color: Tokens.colors.primary, marginLeft: 6 },
  qrVisualBox: { padding: 10, backgroundColor: '#FFFFFF', borderWidth: 2, borderRadius: 8, marginVertical: 8 },
  qrPayloadText: { fontSize: 10, fontFamily: 'monospace', color: Tokens.colors.textMuted, marginBottom: 12 },
  lockBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
  lockBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12, marginLeft: 6 },
  lockedCard: { padding: 18, borderWidth: 2, borderRadius: 8, alignItems: 'center', marginBottom: 14 },
  lockedTitle: { fontSize: 16, fontWeight: 'bold', color: Tokens.colors.secondary, marginTop: 8 },
  lockedSub: { fontSize: 12, color: Tokens.colors.textDark, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  studentCard: { padding: 12, borderWidth: 2, borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  studentName: { fontSize: 14, fontWeight: 'bold' },
  studentSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2 },
  statusBadgeBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  statusBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
});
