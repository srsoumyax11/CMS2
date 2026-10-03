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
import { SOSButton } from '../../src/components/SOSButton';
import { Tokens } from '../../src/theme/tokens';

interface ChildProfile {
  id: string;
  name: string;
  rollNo: string;
  branch: string;
  year: string;
  attendancePercent: number;
  outpassStatus: 'In Hostel' | 'Outpass Requested' | 'Checked Out';
  feeDues: number;
  hostelRoom: string;
}

export default function ParentDashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const children: ChildProfile[] = [
    {
      id: 'c-1',
      name: 'Soham Chakraborty',
      rollNo: '2024-CS-089',
      branch: 'B.Tech Computer Engineering',
      year: '3rd Year (Sem 5)',
      attendancePercent: 91.5,
      outpassStatus: 'Outpass Requested',
      feeDues: 48500,
      hostelRoom: 'Block B - Room 304',
    },
    {
      id: 'c-2',
      name: 'Priya Chakraborty',
      rollNo: '2025-EE-014',
      branch: 'B.Tech Electrical Engineering',
      year: '2nd Year (Sem 3)',
      attendancePercent: 84.0,
      outpassStatus: 'In Hostel',
      feeDues: 0,
      hostelRoom: 'Girls Block A - Room 102',
    },
  ];

  const [selectedChildId, setSelectedChildId] = useState<string>('c-1');
  const child = children.find((c) => c.id === selectedChildId) || children[0];

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Multi-Child Selector Pill Bar */}
      <Text style={[styles.selectorLabel, { color: textPrimary }]}>Select Child Profile</Text>
      <View style={styles.childPillRow}>
        {children.map((ch) => (
          <TouchableOpacity
            key={ch.id}
            style={[
              styles.childPill,
              { backgroundColor: selectedChildId === ch.id ? Tokens.colors.primary : surface, borderColor: border },
            ]}
            onPress={() => setSelectedChildId(ch.id)}
          >
            <Ionicons name="person-circle-outline" size={18} color={selectedChildId === ch.id ? '#FFF' : textPrimary} />
            <Text style={[styles.childPillText, selectedChildId === ch.id && { color: '#FFF', fontWeight: 'bold' }]}>
              {ch.name.split(' ')[0]} ({ch.rollNo})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Child Profile Banner */}
        <View style={[styles.profileCard, { backgroundColor: surface, borderColor: Tokens.colors.primary }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.avatar, { backgroundColor: Tokens.colors.primary }]}>
              <Text style={styles.avatarText}>{child.name.charAt(0)}</Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.childName, { color: textPrimary }]}>{child.name}</Text>
              <Text style={styles.childSub}>{child.rollNo} • {child.branch}</Text>
              <Text style={styles.childSub}>{child.year} • {child.hostelRoom}</Text>
            </View>
          </View>
        </View>

        {/* Quick Vitals Dashboard */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Student Overview Vitals</Text>
        <View style={styles.vitalsGrid}>
          {/* Attendance Gauge Card */}
          <TouchableOpacity
            style={[styles.vitalCard, { backgroundColor: surface, borderColor: border }]}
            onPress={() => alert('Viewing detailed subject attendance breakdown...')}
          >
            <Ionicons name="pie-chart-outline" size={24} color={Tokens.colors.secondary} />
            <Text style={[styles.vitalVal, { color: Tokens.colors.secondary }]}>{child.attendancePercent}%</Text>
            <Text style={styles.vitalLabel}>Overall Attendance</Text>
            <Text style={styles.vitalSub}>Good Standing (Above 75%)</Text>
          </TouchableOpacity>

          {/* Outpass Status Card */}
          <TouchableOpacity
            style={[styles.vitalCard, { backgroundColor: surface, borderColor: border }]}
            onPress={() => router.push('/(parent)/outpass')}
          >
            <Ionicons name="location-outline" size={24} color={Tokens.colors.accentOrange} />
            <Text style={[styles.vitalVal, { color: Tokens.colors.accentOrange, fontSize: 16 }]}>{child.outpassStatus}</Text>
            <Text style={styles.vitalLabel}>Campus Outpass Status</Text>
            <Text style={styles.vitalSub}>1 Consent Pending</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Fee Dues Alert */}
        {child.feeDues > 0 && (
          <View style={[styles.feeAlertCard, { backgroundColor: '#FFFBEB', borderColor: Tokens.colors.accentOrange }]}>
            <Ionicons name="wallet-outline" size={24} color={Tokens.colors.accentOrange} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.feeAlertTitle}>Pending Term Fee Dues: ₹{child.feeDues.toLocaleString()}</Text>
              <Text style={styles.feeAlertSub}>Autumn Semester 2026 • Due by Oct 15, 2026</Text>
            </View>

            <TouchableOpacity
              style={[styles.payNowBtn, { backgroundColor: Tokens.colors.accentOrange }]}
              onPress={() => router.push('/(parent)/fees')}
            >
              <Text style={styles.payNowBtnText}>Pay Fee Dues</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Portal Shortcuts */}
        <Text style={[styles.sectionTitle, { color: textPrimary, marginTop: 12 }]}>Parent Quick Actions</Text>
        <View style={styles.shortcutGrid}>
          <TouchableOpacity
            style={[styles.shortcutTile, { backgroundColor: surface, borderColor: border }]}
            onPress={() => router.push('/(parent)/outpass')}
          >
            <Ionicons name="document-text-outline" size={24} color={Tokens.colors.primary} />
            <Text style={[styles.shortcutTitle, { color: textPrimary }]}>Outpass Approvals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shortcutTile, { backgroundColor: surface, borderColor: border }]}
            onPress={() => router.push('/(parent)/fees')}
          >
            <Ionicons name="card-outline" size={24} color={Tokens.colors.accentPurple} />
            <Text style={[styles.shortcutTitle, { color: textPrimary }]}>Fee Invoices</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shortcutTile, { backgroundColor: surface, borderColor: border }]}
            onPress={() => router.push('/(parent)/sos')}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color={Tokens.colors.accentRed} />
            <Text style={[styles.shortcutTitle, { color: textPrimary }]}>Safety Alerts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SOSButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  selectorLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 6, color: Tokens.colors.textMuted },
  childPillRow: { flexDirection: 'row', marginBottom: 12 },
  childPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderWidth: 2, borderRadius: 20, marginRight: 8 },
  childPillText: { fontSize: 12, marginLeft: 6 },
  scrollContent: { paddingBottom: 80 },
  profileCard: { padding: 14, borderWidth: 2, borderRadius: 8, marginBottom: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 },
  childName: { fontSize: 16, fontWeight: 'bold' },
  childSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 1 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  vitalsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  vitalCard: { width: '48%', padding: 14, borderWidth: 2, borderRadius: 8, alignItems: 'center' },
  vitalVal: { fontSize: 22, fontWeight: 'bold', marginTop: 6 },
  vitalLabel: { fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  vitalSub: { fontSize: 10, color: Tokens.colors.textMuted, marginTop: 2 },
  feeAlertCard: { flexDirection: 'row', padding: 12, borderWidth: 2, borderRadius: 8, marginBottom: 14, alignItems: 'center' },
  feeAlertTitle: { fontSize: 13, fontWeight: 'bold', color: Tokens.colors.accentOrange },
  feeAlertSub: { fontSize: 10, color: Tokens.colors.textDark, marginTop: 2 },
  payNowBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  payNowBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  shortcutGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  shortcutTile: { width: '31%', padding: 14, borderWidth: 2, borderRadius: 8, alignItems: 'center' },
  shortcutTitle: { fontSize: 11, fontWeight: 'bold', marginTop: 8, textAlign: 'center' },
});
