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

export default function WardenDashboardScreen() {
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
        {/* Welcome Banner */}
        <View style={[styles.welcomeCard, { backgroundColor: surface, borderColor: Tokens.colors.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.welcomeTitle, { color: textPrimary }]}>Warden Operations Console</Text>
            <Text style={styles.welcomeSub}>Block B (Boys Hostel) • Shift: Evening / Night</Text>
          </View>
          <View style={[styles.activeShiftBadge, { backgroundColor: Tokens.colors.secondary }]}>
            <Text style={styles.activeShiftText}>ON DUTY</Text>
          </View>
        </View>

        {/* Operational Metrics Cards */}
        <View style={styles.metricsGrid}>
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: surface, borderColor: Tokens.colors.accentOrange }]}
            onPress={() => router.push('/(warden)/outpasses')}
          >
            <Text style={[styles.metricValue, { color: Tokens.colors.accentOrange }]}>8</Text>
            <Text style={styles.metricLabel}>Pending Outpasses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: surface, borderColor: Tokens.colors.accentRed }]}
            onPress={() => router.push('/(warden)/sos')}
          >
            <Text style={[styles.metricValue, { color: Tokens.colors.accentRed }]}>1</Text>
            <Text style={styles.metricLabel}>Active SOS Incident</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: surface, borderColor: Tokens.colors.primary }]}
            onPress={() => router.push('/(warden)/rooms')}
          >
            <Text style={[styles.metricValue, { color: Tokens.colors.primary }]}>14</Text>
            <Text style={styles.metricLabel}>Vacant Beds</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: surface, borderColor: Tokens.colors.accentPurple }]}
            onPress={() => router.push('/(warden)/outpasses')}
          >
            <Text style={[styles.metricValue, { color: Tokens.colors.accentPurple }]}>3</Text>
            <Text style={styles.metricLabel}>Overdue Returns</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Action Navigation Grid */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Quick Management Tools</Text>
        <View style={styles.quickGrid}>
          {[
            { title: 'Approve Outpasses', route: '/(warden)/outpasses', icon: 'document-text-outline', color: Tokens.colors.primary },
            { title: 'Emergency SOS', route: '/(warden)/sos', icon: 'alert-circle-outline', color: Tokens.colors.accentRed },
            { title: 'Room Allocator', route: '/(warden)/rooms', icon: 'key-outline', color: Tokens.colors.secondary },
            { title: 'Night Roll Call', route: '/(warden)/roll-call', icon: 'clipboard-outline', color: Tokens.colors.accentPurple },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.actionTile, { backgroundColor: surface, borderColor: border }]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.tileIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={22} color="#FFFFFF" />
              </View>
              <Text style={[styles.tileTitle, { color: textPrimary }]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Priority Inbox Feed */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Priority Warden Inbox</Text>
        {[
          {
            id: 'inb-1',
            type: 'SOS ALERT',
            title: 'Medical Distress reported in Room 204',
            time: '5 mins ago',
            color: Tokens.colors.accentRed,
            urgent: true,
          },
          {
            id: 'inb-2',
            type: 'OVERDUE RETURN',
            title: 'Student Vikrant Singh (Roll #2024-CS-012) not back by 09:30 PM curfew',
            time: '20 mins ago',
            color: Tokens.colors.accentOrange,
            urgent: false,
          },
          {
            id: 'inb-3',
            type: 'OUTPASS REQUEST',
            title: 'Overnight Emergency Outpass requested by Aditya Verma',
            time: '35 mins ago',
            color: Tokens.colors.primary,
            urgent: false,
          },
        ].map((item) => (
          <View key={item.id} style={[styles.inboxCard, { backgroundColor: surface, borderColor: item.color }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={[styles.typeBadge, { backgroundColor: item.color }]}>
                <Text style={styles.typeBadgeText}>{item.type}</Text>
              </View>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
            <Text style={[styles.inboxTitle, { color: textPrimary }]}>{item.title}</Text>

            <TouchableOpacity
              style={[styles.inboxActionBtn, { borderColor: item.color }]}
              onPress={() => {
                if (item.type === 'SOS ALERT') router.push('/(warden)/sos');
                else router.push('/(warden)/outpasses');
              }}
            >
              <Text style={[styles.inboxActionText, { color: item.color }]}>Take Immediate Action →</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <SOSButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  scrollContent: { paddingBottom: 80 },
  welcomeCard: {
    padding: 14,
    borderWidth: 2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  welcomeTitle: { fontSize: 16, fontWeight: 'bold' },
  welcomeSub: { fontSize: 12, color: Tokens.colors.textMuted, marginTop: 2 },
  activeShiftBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  activeShiftText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 14 },
  metricCard: {
    width: '48%',
    padding: 14,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  metricValue: { fontSize: 26, fontWeight: 'bold' },
  metricLabel: { fontSize: 11, fontWeight: '600', color: Tokens.colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 14 },
  actionTile: {
    width: '48%',
    padding: 12,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tileIcon: { width: 36, height: 36, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  tileTitle: { fontSize: 12, fontWeight: 'bold', marginLeft: 10, flex: 1 },
  inboxCard: { padding: 12, borderWidth: 2, borderRadius: 8, marginBottom: 10 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeBadgeText: { fontSize: 9, fontWeight: 'bold', color: '#FFFFFF' },
  timeText: { fontSize: 10, color: Tokens.colors.textMuted },
  inboxTitle: { fontSize: 13, fontWeight: 'bold', marginTop: 8 },
  inboxActionBtn: { marginTop: 10, borderWidth: 1, paddingVertical: 6, borderRadius: 4, alignItems: 'center' },
  inboxActionText: { fontSize: 11, fontWeight: 'bold' },
});
