import { Ionicons } from '@expo/vector-icons';
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

interface SafetyAlert {
  id: string;
  childName: string;
  type: 'Medical' | 'Weather Warning' | 'Campus Update';
  title: string;
  time: string;
  wardenNote: string;
  resolved: boolean;
}

export default function ParentSOSScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const alerts: SafetyAlert[] = [
    {
      id: 'ALT-102',
      childName: 'Soham Chakraborty',
      type: 'Campus Update',
      title: 'Night Outpass Gate Check-in Confirmed at 07:45 PM',
      time: 'Yesterday',
      wardenNote: 'Student checked back into Block B safely before curfew.',
      resolved: true,
    },
    {
      id: 'ALT-098',
      childName: 'Soham Chakraborty',
      type: 'Weather Warning',
      title: 'Heavy Rain Warning — Evening Outpasses Temporarily Suspended',
      time: '3 days ago',
      wardenNote: 'Campus administration advisory for all hostel blocks.',
      resolved: true,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Banner */}
      <View style={[styles.banner, { backgroundColor: Tokens.colors.secondary }]}>
        <Ionicons name="shield-checkmark" size={24} color="#FFF" />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.bannerTitle}>STUDENT SAFETY STATUS: ALL SECURE</Text>
          <Text style={styles.bannerSub}>Real-time campus security broadcast for linked children</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Safety Alert & Activity History</Text>

        {alerts.map((a) => (
          <View key={a.id} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.typeText}>{a.type.toUpperCase()}</Text>
                <Text style={[styles.cardTitle, { color: textPrimary }]}>{a.title}</Text>
                <Text style={styles.cardSub}>For {a.childName} • {a.time}</Text>
              </View>
            </View>

            <View style={styles.noteBox}>
              <Ionicons name="information-circle-outline" size={16} color={Tokens.colors.primary} />
              <Text style={[styles.noteText, { color: textPrimary }]}>Warden Note: {a.wardenNote}</Text>
            </View>
          </View>
        ))}

        {/* Emergency Contacts */}
        <Text style={[styles.sectionTitle, { color: textPrimary, marginTop: 12 }]}>Direct Emergency Hotlines</Text>
        <View style={styles.hotlineGrid}>
          <TouchableOpacity style={[styles.hotlineCard, { backgroundColor: surface, borderColor: border }]} onPress={() => alert('Calling Hostel Block B Warden (+91 9876543210)')}>
            <Ionicons name="person-circle" size={24} color={Tokens.colors.primary} />
            <Text style={[styles.hotlineTitle, { color: textPrimary }]}>Hostel Warden</Text>
            <Text style={styles.hotlineSub}>Block B Office</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.hotlineCard, { backgroundColor: surface, borderColor: border }]} onPress={() => alert('Calling Campus Security Desk (+91 112)')}>
            <Ionicons name="shield-sharp" size={24} color={Tokens.colors.accentRed} />
            <Text style={[styles.hotlineTitle, { color: textPrimary }]}>Security Desk</Text>
            <Text style={styles.hotlineSub}>24x7 Control Room</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  banner: { padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  bannerTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  bannerSub: { color: '#F8FAFC', fontSize: 10, marginTop: 2 },
  scrollContent: { paddingBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  card: { padding: 14, borderWidth: 2, borderRadius: 8, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  typeText: { fontSize: 10, fontWeight: 'bold', color: Tokens.colors.primary },
  cardTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  cardSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2 },
  noteBox: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#EFF6FF', padding: 8, borderRadius: 6 },
  noteText: { fontSize: 11, marginLeft: 6, flex: 1 },
  hotlineGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  hotlineCard: { width: '48%', padding: 14, borderWidth: 2, borderRadius: 8, alignItems: 'center' },
  hotlineTitle: { fontSize: 13, fontWeight: 'bold', marginTop: 6 },
  hotlineSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2 },
});
