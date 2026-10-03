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

interface SOSIncident {
  id: string;
  studentName: string;
  rollNo: string;
  location: string;
  category: 'Medical' | 'Security' | 'Fire' | 'Other';
  timeElapsed: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  assignedGuard?: string;
}

export default function WardenSOSControlScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [incidents, setIncidents] = useState<SOSIncident[]>([
    {
      id: 'SOS-901',
      studentName: 'Rohan Mehta',
      rollNo: '2024-EC-045',
      location: 'Block B • Room 204 (Floor 2)',
      category: 'Medical',
      timeElapsed: '4 mins ago',
      status: 'Active',
    },
    {
      id: 'SOS-889',
      studentName: 'Karan Malhotra',
      rollNo: '2024-ME-019',
      location: 'Main Mess Lawn (GPS: 18.5204° N, 73.8567° E)',
      category: 'Security',
      timeElapsed: '45 mins ago',
      status: 'Acknowledged',
      assignedGuard: 'Guard Ramesh Kumar (Patrol 4)',
    },
  ]);

  const [reportModalIncident, setReportModalIncident] = useState<SOSIncident | null>(null);
  const [resolutionReport, setResolutionReport] = useState('');

  const handleAcknowledge = (id: string) => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: 'Acknowledged', assignedGuard: 'Security Response Unit #1 Dispatched' } : i
      )
    );
  };

  const handleResolve = () => {
    if (!reportModalIncident) return;
    setIncidents((prev) =>
      prev.map((i) => (i.id === reportModalIncident.id ? { ...i, status: 'Resolved' } : i))
    );
    setReportModalIncident(null);
    setResolutionReport('');
  };

  const activeCount = incidents.filter((i) => i.status !== 'Resolved').length;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Emergency Header Banner */}
      <View style={[styles.alertBanner, { backgroundColor: activeCount > 0 ? Tokens.colors.accentRed : Tokens.colors.secondary }]}>
        <Ionicons name="warning-sharp" size={28} color="#FFFFFF" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.alertTitle}>
            {activeCount > 0 ? `EMERGENCY CONTROL ROOM — ${activeCount} ACTIVE ALERTS` : 'ALL HOSTEL SECTORS SECURE'}
          </Text>
          <Text style={styles.alertSub}>Real-time SOS telemetry feed from Campus7 Mobile Security App</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Live Incident Queue</Text>

        {incidents.map((inc) => (
          <View key={inc.id} style={[styles.card, { backgroundColor: surface, borderColor: inc.status === 'Active' ? Tokens.colors.accentRed : border }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.incId}>{inc.id} • {inc.category.toUpperCase()}</Text>
                <Text style={[styles.studentName, { color: textPrimary }]}>{inc.studentName}</Text>
                <Text style={styles.studentSub}>Roll: {inc.rollNo}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      inc.status === 'Active'
                        ? Tokens.colors.accentRed
                        : inc.status === 'Acknowledged'
                        ? Tokens.colors.accentOrange
                        : Tokens.colors.secondary,
                  },
                ]}
              >
                <Text style={styles.statusText}>{inc.status}</Text>
              </View>
            </View>

            <View style={styles.locationBox}>
              <Ionicons name="location" size={16} color={Tokens.colors.accentRed} />
              <Text style={[styles.locationText, { color: textPrimary }]}>{inc.location}</Text>
            </View>
            <Text style={styles.timeElapsed}>Triggered {inc.timeElapsed}</Text>

            {inc.assignedGuard && (
              <View style={styles.guardBox}>
                <Ionicons name="shield-checkmark" size={16} color={Tokens.colors.secondary} />
                <Text style={styles.guardText}>Assigned: {inc.assignedGuard}</Text>
              </View>
            )}

            {/* Response Action CTAs */}
            <View style={styles.actionsGrid}>
              {inc.status === 'Active' && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: Tokens.colors.accentOrange }]}
                  onPress={() => handleAcknowledge(inc.id)}
                >
                  <Ionicons name="hand-right-outline" size={16} color="#FFF" />
                  <Text style={styles.actionBtnText}>Acknowledge & Dispatch</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Tokens.colors.primary }]}
                onPress={() => alert('Dialing Campus Medical Emergency (+91 108)')}
              >
                <Ionicons name="call" size={16} color="#FFF" />
                <Text style={styles.actionBtnText}>Call Medical</Text>
              </TouchableOpacity>

              {inc.status !== 'Resolved' && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: Tokens.colors.secondary }]}
                  onPress={() => setReportModalIncident(inc)}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
                  <Text style={styles.actionBtnText}>Close & Report</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* Escalation Helpline Cards */}
        <Text style={[styles.sectionTitle, { color: textPrimary, marginTop: 14 }]}>Quick Emergency Hotlines</Text>
        <View style={styles.hotlineGrid}>
          <TouchableOpacity style={[styles.hotlineCard, { backgroundColor: surface, borderColor: border }]} onPress={() => alert('Calling Chief Warden Office')}>
            <Ionicons name="shield" size={20} color={Tokens.colors.primary} />
            <Text style={[styles.hotlineTitle, { color: textPrimary }]}>Chief Security</Text>
            <Text style={styles.hotlineSub}>Ext. 101</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.hotlineCard, { backgroundColor: surface, borderColor: border }]} onPress={() => alert('Calling Campus Ambulance')}>
            <Ionicons name="medkit" size={20} color={Tokens.colors.accentRed} />
            <Text style={[styles.hotlineTitle, { color: textPrimary }]}>Ambulance</Text>
            <Text style={styles.hotlineSub}>Ext. 108</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Incident Resolution Modal */}
      <Modal visible={!!reportModalIncident} animationType="fade" transparent onRequestClose={() => setReportModalIncident(null)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>File Incident Resolution Report</Text>
            <Text style={{ fontSize: 12, color: Tokens.colors.textMuted, marginTop: 4 }}>
              Incident: {reportModalIncident?.id} ({reportModalIncident?.studentName})
            </Text>

            <Text style={styles.inputLabel}>Incident Summary & Resolution Details</Text>
            <TextInput
              style={[styles.modalInput, { color: textPrimary, backgroundColor: bg, borderColor: border, height: 75 }]}
              placeholder="e.g. Student provided basic first-aid by warden and dispatched to campus clinic."
              placeholderTextColor={Tokens.colors.textMuted}
              multiline
              value={resolutionReport}
              onChangeText={setResolutionReport}
            />

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Tokens.colors.secondary }]} onPress={handleResolve}>
              <Text style={styles.submitBtnText}>Submit & Close Incident</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setReportModalIncident(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  alertBanner: { padding: 14, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  alertTitle: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  alertSub: { color: '#F8FAFC', fontSize: 10, marginTop: 2 },
  scrollContent: { paddingBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  card: { padding: 14, borderWidth: 2, borderRadius: 8, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  incId: { fontSize: 11, fontWeight: 'bold', color: Tokens.colors.accentRed },
  studentName: { fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  studentSub: { fontSize: 11, color: Tokens.colors.textMuted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  locationBox: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  locationText: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  timeElapsed: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 4 },
  guardBox: { flexDirection: 'row', alignItems: 'center', marginTop: 6, backgroundColor: '#ECFDF5', padding: 6, borderRadius: 4 },
  guardText: { fontSize: 11, fontWeight: 'bold', color: Tokens.colors.secondary, marginLeft: 4 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6, marginRight: 8, marginBottom: 6 },
  actionBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  hotlineGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  hotlineCard: { width: '48%', padding: 12, borderWidth: 2, borderRadius: 8, alignItems: 'center' },
  hotlineTitle: { fontSize: 13, fontWeight: 'bold', marginTop: 6 },
  hotlineSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', padding: 18, borderWidth: 2, borderRadius: 8 },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  inputLabel: { fontSize: 12, fontWeight: 'bold', marginTop: 12, color: Tokens.colors.textMuted },
  modalInput: { borderWidth: 1, borderRadius: 6, padding: 10, fontSize: 13, marginTop: 6 },
  submitBtn: { paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 14 },
  submitBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { paddingVertical: 10, alignItems: 'center', marginTop: 6 },
  cancelBtnText: { color: Tokens.colors.textMuted, fontSize: 12 },
});
