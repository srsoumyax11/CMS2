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
import { Header } from '../../src/components/Header';
import { QRModal } from '../../src/components/QRModal';
import { SOSButton } from '../../src/components/SOSButton';
import { Tokens } from '../../src/theme/tokens';

export default function StudentDashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [qrModalVisible, setQrModalVisible] = useState(false);

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Header title="Student Workspace" currentRole="Student Persona" unreadNotificationsCount={2} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Student Profile Overview Card */}
        <View style={[styles.profileCard, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.profileLeft}>
            <View style={[styles.avatar, { backgroundColor: Tokens.colors.primary }]}>
              <Text style={styles.avatarText}>SB</Text>
            </View>
            <View>
              <Text style={[styles.studentName, { color: textPrimary }]}>Soham Banerjee</Text>
              <Text style={styles.studentMeta}>Roll: 2026-CS-004 • B.Tech CSE • Sem 5</Text>
              <Text style={styles.studentMeta}>Hostel: Boys Block 1 (Room 304B)</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.idCardBtn, { backgroundColor: Tokens.colors.secondary }]}
            onPress={() => setQrModalVisible(true)}
          >
            <Ionicons name="qr-code" size={16} color="#FFFFFF" />
            <Text style={styles.idCardBtnText}>ID Pass</Text>
          </TouchableOpacity>
        </View>

        {/* Attendance Warning Banner if < 75% */}
        <View style={[styles.warningBanner, { backgroundColor: '#FEF3C7', borderColor: Tokens.colors.accentYellow }]}>
          <Ionicons name="warning-outline" size={20} color={Tokens.colors.accentYellow} />
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>Attendance Alert: 73.5%</Text>
            <Text style={styles.warningSub}>Data Structures attendance is below 75%. Attend 3 more lectures to qualify for exams.</Text>
          </View>
        </View>

        {/* Quick Action Navigation Grid */}
        <Text style={[styles.sectionHeading, { color: textPrimary }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { label: 'Timetable', icon: 'calendar', color: Tokens.colors.primary, route: '/(student)/timetable' },
            { label: 'Attendance', icon: 'checkbox', color: Tokens.colors.secondary, route: '/(student)/attendance' },
            { label: 'Outpass', icon: 'exit', color: Tokens.colors.accentOrange, route: '/(student)/outpass' },
            { label: 'Fee Dues', icon: 'card', color: Tokens.colors.accentPurple, route: '/(student)/fees' },
            { label: 'Hostel & Mess', icon: 'restaurant', color: Tokens.colors.accentRed, route: '/(student)/hostel' },
            { label: 'Library', icon: 'book', color: Tokens.colors.primary, route: '/(student)/library' },
            { label: 'Clubs & Drives', icon: 'trophy', color: Tokens.colors.secondary, route: '/(student)/campus' },
            { label: 'Digital ID', icon: 'card-outline', color: Tokens.colors.accentOrange, route: '/(student)/id-card' },
          ].map((act, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.actionTile, { backgroundColor: surface, borderColor: border }]}
              onPress={() => router.push(act.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.tileIconCircle, { backgroundColor: act.color }]}>
                <Ionicons name={act.icon as any} size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.tileLabel, { color: textPrimary }]}>{act.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Schedule Card */}
        <View style={[styles.widgetCard, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.widgetHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="time-outline" size={18} color={Tokens.colors.primary} />
              <Text style={[styles.widgetTitle, { color: textPrimary }]}>Today's Lectures</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(student)/timetable' as any)}>
              <Text style={[styles.viewAllText, { color: Tokens.colors.primary }]}>View Schedule</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.lectureList}>
            <View style={[styles.lectureItem, { borderColor: border }]}>
              <View style={[styles.periodBadge, { backgroundColor: Tokens.colors.primary }]}>
                <Text style={styles.periodBadgeText}>P1 • 09:00 AM</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lectureName, { color: textPrimary }]}>Data Structures & Algorithms</Text>
                <Text style={styles.lectureSub}>Room 204 • Prof. A. Mehta</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: Tokens.colors.secondary }]}>
                <Text style={styles.statusText}>COMPLETED</Text>
              </View>
            </View>

            <View style={[styles.lectureItem, { borderColor: border }]}>
              <View style={[styles.periodBadge, { backgroundColor: Tokens.colors.accentOrange }]}>
                <Text style={styles.periodBadgeText}>P3 • 11:30 AM</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lectureName, { color: textPrimary }]}>Database Management Systems</Text>
                <Text style={styles.lectureSub}>Lab 3 • Prof. S. Rao</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: Tokens.colors.primary }]}>
                <Text style={styles.statusText}>LIVE NOW</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Active Outpass Status Pill */}
        <View style={[styles.widgetCard, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.widgetHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="ticket-outline" size={18} color={Tokens.colors.accentOrange} />
              <Text style={[styles.widgetTitle, { color: textPrimary }]}>Active Outpass Pass</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(student)/outpass' as any)}>
              <Text style={[styles.viewAllText, { color: Tokens.colors.accentOrange }]}>Outpass Desk</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.outpassStatusBox}>
            <View style={styles.outpassRow}>
              <Text style={styles.outpassLabel}>Pass ID:</Text>
              <Text style={[styles.outpassValue, { color: textPrimary }]}>#OP-2026-9821</Text>
            </View>
            <View style={styles.outpassRow}>
              <Text style={styles.outpassLabel}>Gate Status:</Text>
              <Text style={[styles.outpassValue, { color: Tokens.colors.secondary }]}>APPROVED BY WARDEN ✓</Text>
            </View>
            <View style={styles.outpassRow}>
              <Text style={styles.outpassLabel}>Return Deadline:</Text>
              <Text style={[styles.outpassValue, { color: Tokens.colors.accentRed }]}>Today 08:30 PM</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Emergency SOS Button */}
      <SOSButton />

      {/* Digital QR Presenter Modal */}
      <QRModal
        visible={qrModalVisible}
        mode="PRESENT"
        title="Digital Student ID Card"
        payload="C7-STUDENT-2026-CS-004-VERIFIED"
        onClose={() => setQrModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Tokens.spacing.md, gap: Tokens.spacing.md, paddingBottom: 100 },
  profileCard: {
    padding: Tokens.spacing.md,
    borderRadius: Tokens.radii.md,
    borderWidth: Tokens.borderWidths.flat,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.sm, flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
  studentName: { fontSize: 16, fontWeight: '900' },
  studentMeta: { fontSize: 11, color: Tokens.colors.textMuted },
  idCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Tokens.spacing.sm,
    paddingVertical: 6,
    borderRadius: Tokens.radii.sm,
  },
  idCardBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing.sm,
    padding: Tokens.spacing.md,
    borderRadius: Tokens.radii.md,
    borderWidth: Tokens.borderWidths.flat,
  },
  warningTitle: { fontSize: 13, fontWeight: '800', color: Tokens.colors.accentYellow },
  warningSub: { fontSize: 11, color: '#92400E', marginTop: 2 },
  sectionHeading: { fontSize: 16, fontWeight: '900', marginTop: 4 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Tokens.spacing.sm },
  actionTile: {
    width: '23%',
    minWidth: 72,
    flexGrow: 1,
    paddingVertical: Tokens.spacing.md,
    paddingHorizontal: Tokens.spacing.xs,
    borderRadius: Tokens.radii.md,
    borderWidth: Tokens.borderWidths.flat,
    alignItems: 'center',
    gap: 6,
  },
  tileIconCircle: { width: 36, height: 36, borderRadius: Tokens.radii.sm, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontSize: 11, fontWeight: '800', textAlign: 'center' },
  widgetCard: { padding: Tokens.spacing.md, borderRadius: Tokens.radii.md, borderWidth: Tokens.borderWidths.flat },
  widgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Tokens.spacing.md },
  widgetTitle: { fontSize: 14, fontWeight: '900' },
  viewAllText: { fontSize: 11, fontWeight: '800' },
  lectureList: { gap: Tokens.spacing.sm },
  lectureItem: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.sm, paddingVertical: Tokens.spacing.xs, borderBottomWidth: Tokens.borderWidths.thin },
  periodBadge: { paddingHorizontal: Tokens.spacing.xs, paddingVertical: 4, borderRadius: Tokens.radii.sm },
  periodBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  lectureName: { fontSize: 13, fontWeight: '800' },
  lectureSub: { fontSize: 11, color: Tokens.colors.textMuted },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Tokens.radii.sm },
  statusText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  outpassStatusBox: { gap: 6, paddingTop: 4 },
  outpassRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  outpassLabel: { fontSize: 12, color: Tokens.colors.textMuted },
  outpassValue: { fontSize: 12, fontWeight: '800' },
});
