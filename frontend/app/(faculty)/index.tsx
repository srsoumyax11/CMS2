import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SOSButton } from '../../src/components/SOSButton';
import { Tokens } from '../../src/theme/tokens';

export default function FacultyDashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Header Card */}
        <View style={[styles.welcomeCard, { backgroundColor: surface, borderColor: Tokens.colors.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.welcomeTitle, { color: textPrimary }]}>Dr. Ananya Roy</Text>
            <Text style={styles.welcomeSub}>Professor • Dept of Computer Science & Engineering</Text>
          </View>
          <View style={[styles.termBadge, { backgroundColor: Tokens.colors.primary }]}>
            <Text style={styles.termBadgeText}>Autumn 2026</Text>
          </View>
        </View>

        {/* Metrics Summary Row */}
        <View style={styles.metricsRow}>
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: surface, borderColor: Tokens.colors.accentOrange }]}
            onPress={() => router.push('/(faculty)/assignments')}
          >
            <Text style={[styles.metricVal, { color: Tokens.colors.accentOrange }]}>18</Text>
            <Text style={styles.metricLabel}>Pending Grades</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: surface, borderColor: Tokens.colors.accentPurple }]}
            onPress={() => router.push('/(faculty)/disputes')}
          >
            <Text style={[styles.metricVal, { color: Tokens.colors.accentPurple }]}>3</Text>
            <Text style={styles.metricLabel}>Attendance Disputes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: surface, borderColor: Tokens.colors.secondary }]}
            onPress={() => router.push('/(faculty)/mentees')}
          >
            <Text style={[styles.metricVal, { color: Tokens.colors.secondary }]}>15</Text>
            <Text style={styles.metricLabel}>Assigned Mentees</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Lectures Schedule */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Today's Lecture Schedule</Text>

        {[
          {
            subject: 'CS-501: Advanced Algorithms',
            time: '10:00 AM - 11:00 AM',
            room: 'Lab 302 (Floor 3)',
            status: 'Upcoming',
            studentsCount: 60,
          },
          {
            subject: 'CS-504: Distributed Systems',
            time: '02:00 PM - 03:00 PM',
            room: 'Lecture Hall 104',
            status: 'Scheduled',
            studentsCount: 55,
          },
        ].map((lec, idx) => (
          <View key={idx} style={[styles.lectureCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lectureSubject, { color: textPrimary }]}>{lec.subject}</Text>
                <Text style={styles.lectureSub}>{lec.time} • {lec.room}</Text>
                <Text style={styles.studentsCount}>Enrolled: {lec.studentsCount} Students</Text>
              </View>

              <View style={[styles.badge, { backgroundColor: Tokens.colors.primary }]}>
                <Text style={styles.badgeText}>{lec.status}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.startSessionBtn, { backgroundColor: Tokens.colors.secondary }]}
              onPress={() => router.push('/(faculty)/attendance-session')}
            >
              <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
              <Text style={styles.startSessionText}>Start QR Attendance Session</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Quick Tools */}
        <Text style={[styles.sectionTitle, { color: textPrimary, marginTop: 14 }]}>Faculty Quick Tools</Text>
        <View style={styles.toolsGrid}>
          <TouchableOpacity
            style={[styles.toolTile, { backgroundColor: surface, borderColor: border }]}
            onPress={() => router.push('/(faculty)/assignments')}
          >
            <Ionicons name="document-text-outline" size={24} color={Tokens.colors.primary} />
            <Text style={[styles.toolTitle, { color: textPrimary }]}>Create Assignment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolTile, { backgroundColor: surface, borderColor: border }]}
            onPress={() => router.push('/(faculty)/disputes')}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color={Tokens.colors.accentOrange} />
            <Text style={[styles.toolTitle, { color: textPrimary }]}>Review Disputes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolTile, { backgroundColor: surface, borderColor: border }]}
            onPress={() => router.push('/(faculty)/mentees')}
          >
            <Ionicons name="people-outline" size={24} color={Tokens.colors.secondary} />
            <Text style={[styles.toolTitle, { color: textPrimary }]}>Mentee Roster</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SOSButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  scrollContent: { paddingBottom: 80 },
  welcomeCard: { padding: 14, borderWidth: 2, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  welcomeTitle: { fontSize: 16, fontWeight: 'bold' },
  welcomeSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2 },
  termBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  termBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  metricCard: { width: '31%', padding: 12, borderWidth: 2, borderRadius: 8, alignItems: 'center' },
  metricVal: { fontSize: 22, fontWeight: 'bold' },
  metricLabel: { fontSize: 10, fontWeight: '600', color: Tokens.colors.textMuted, marginTop: 2, textAlign: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  lectureCard: { padding: 14, borderWidth: 2, borderRadius: 8, marginBottom: 12 },
  lectureSubject: { fontSize: 15, fontWeight: 'bold' },
  lectureSub: { fontSize: 12, color: Tokens.colors.textMuted, marginTop: 2 },
  studentsCount: { fontSize: 11, color: Tokens.colors.primary, marginTop: 4, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  startSessionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 6, marginTop: 12 },
  startSessionText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12, marginLeft: 6 },
  toolsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  toolTile: { width: '31%', padding: 14, borderWidth: 2, borderRadius: 8, alignItems: 'center' },
  toolTitle: { fontSize: 11, fontWeight: 'bold', marginTop: 8, textAlign: 'center' },
});
