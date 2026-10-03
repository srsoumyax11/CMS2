import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Tokens } from '../../src/theme/tokens';

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  ipAddress: string;
  timestamp: string;
  entityId: string;
}

export default function AdminAuditScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [activeTab, setActiveTab] = useState<'logs' | 'config'>('logs');

  // System Toggles
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(true);

  const logs: AuditLog[] = [
    {
      id: 'AUD-9912',
      actor: 'Warden Dr. K. V. Raman (C7-WRD-004)',
      action: 'APPROVE_OUTPASS',
      ipAddress: '192.168.1.45',
      timestamp: 'Oct 03, 04:30 AM',
      entityId: 'OP-501',
    },
    {
      id: 'AUD-9908',
      actor: 'System Auto Worker',
      action: 'NIGHT_ROLL_CALL_CHECK',
      ipAddress: '127.0.0.1',
      timestamp: 'Oct 02, 10:00 PM',
      entityId: 'ROLLCALL-20261002',
    },
    {
      id: 'AUD-9890',
      actor: 'Administrator Main Desk',
      action: 'ROLE_APPLICATION_APPROVE',
      ipAddress: '10.0.0.12',
      timestamp: 'Oct 02, 06:15 PM',
      entityId: 'REQ-901',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Navigation Bar */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'logs' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('logs')}
        >
          <Text style={[styles.tabText, activeTab === 'logs' && styles.tabTextActive]}>Audit Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'config' && { backgroundColor: Tokens.colors.primary }]}
          onPress={() => setActiveTab('config')}
        >
          <Text style={[styles.tabText, activeTab === 'config' && styles.tabTextActive]}>System Config</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'logs' ? (
          <View>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>System Security & Compliance Log (audit_logs)</Text>

            {logs.map((l) => (
              <View key={l.id} style={[styles.logCard, { backgroundColor: surface, borderColor: border }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.logId}>{l.id} • {l.timestamp}</Text>
                  <Text style={styles.ipText}>IP: {l.ipAddress}</Text>
                </View>

                <Text style={[styles.actionText, { color: Tokens.colors.primary }]}>{l.action}</Text>
                <Text style={[styles.actorText, { color: textPrimary }]}>Actor: {l.actor}</Text>
                <Text style={styles.entityText}>Target Entity ID: {l.entityId}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Mobile App Environment Controls</Text>

            <View style={[styles.configCard, { backgroundColor: surface, borderColor: border }]}>
              <View style={styles.configRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.configTitle, { color: textPrimary }]}>Emergency Maintenance Mode</Text>
                  <Text style={styles.configSub}>Temporarily block student outpass requests and signins during system updates</Text>
                </View>
                <Switch
                  value={maintenanceMode}
                  onValueChange={setMaintenanceMode}
                  trackColor={{ false: '#CBD5E1', true: Tokens.colors.accentRed }}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.configRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.configTitle, { color: textPrimary }]}>Force Minimum App Version (v2.1.0)</Text>
                  <Text style={styles.configSub}>Require outdated mobile app clients to update before accessing server API</Text>
                </View>
                <Switch
                  value={forceUpdate}
                  onValueChange={setForceUpdate}
                  trackColor={{ false: '#CBD5E1', true: Tokens.colors.secondary }}
                />
              </View>
            </View>
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
  tabText: { fontSize: 12, fontWeight: '600', color: Tokens.colors.textMuted },
  tabTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  scrollContent: { paddingBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  logCard: { padding: 12, borderWidth: 2, borderRadius: 8, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logId: { fontSize: 10, color: Tokens.colors.textMuted },
  ipText: { fontSize: 10, fontFamily: 'monospace', color: Tokens.colors.textMuted },
  actionText: { fontSize: 13, fontWeight: 'bold', marginTop: 4 },
  actorText: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  entityText: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2 },
  configCard: { padding: 14, borderWidth: 2, borderRadius: 8 },
  configRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  configTitle: { fontSize: 14, fontWeight: 'bold' },
  configSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2, paddingRight: 10 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
});
