import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, SosButton, SosPayload, EmergencyContact } from '@campus/ui';
import { colors, spacing, typography, radius } from '@campus/design-tokens';
import { useTranslation } from '@campus/i18n';
import { OfflineQueueManager } from '@campus/api-client';

export interface AlertLogItem {
  id: string;
  recipient: string;
  status: 'dispatched' | 'acknowledged' | 'queued_offline' | 'cancelled';
  timestamp: string;
}

export interface SosScreenProps {
  onDispatchSos?: (payload: SosPayload) => Promise<void>;
  onCancelSos?: (idempotencyKey: string) => Promise<void>;
  queueManager?: OfflineQueueManager;
  hasLocationPermission?: boolean;
}

const DEFAULT_ALERT_LOGS: AlertLogItem[] = [
  { id: 'log_1', recipient: 'Campus Security Control Room', status: 'dispatched', timestamp: 'Oct 4, 10:15 AM' },
  { id: 'log_2', recipient: 'Campus Medical Response Unit', status: 'dispatched', timestamp: 'Oct 4, 10:15 AM' },
];

export const SosScreen: React.FC<SosScreenProps> = ({
  onDispatchSos,
  onCancelSos,
  queueManager,
  hasLocationPermission = true,
}) => {
  const { t } = useTranslation();
  const [alertLogs, setAlertLogs] = useState<AlertLogItem[]>(DEFAULT_ALERT_LOGS);

  const handleDispatch = async (payload: SosPayload) => {
    try {
      if (onDispatchSos) {
        await onDispatchSos(payload);
      } else if (queueManager) {
        await queueManager.enqueue({
          type: 'sos',
          endpoint: '/sos/trigger',
          payload: payload as any,
          idempotencyKey: payload.idempotencyKey,
        });
      }

      const newLog: AlertLogItem = {
        id: `log_${Date.now()}`,
        recipient: 'Campus Security & Emergency Team',
        status: 'dispatched',
        timestamp: new Date().toLocaleTimeString(),
      };
      setAlertLogs((prev) => [newLog, ...prev]);
    } catch {
      if (queueManager) {
        await queueManager.enqueue({
          type: 'sos',
          endpoint: '/sos/trigger',
          payload: payload as any,
          idempotencyKey: payload.idempotencyKey,
        });
      }
      const newLog: AlertLogItem = {
        id: `log_${Date.now()}`,
        recipient: 'Campus Security (Queued Offline)',
        status: 'queued_offline',
        timestamp: new Date().toLocaleTimeString(),
      };
      setAlertLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleCancel = async (key: string) => {
    if (onCancelSos) await onCancelSos(key);
    const cancelLog: AlertLogItem = {
      id: `log_${Date.now()}`,
      recipient: 'Campus Security (False Alarm Cancelled)',
      status: 'cancelled',
      timestamp: new Date().toLocaleTimeString(),
    };
    setAlertLogs((prev) => [cancelLog, ...prev]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.bannerCard}>
        <Text style={styles.bannerTitle}>Emergency SOS Broadcast System</Text>
        <Text style={styles.bannerSub}>
          Pressing the SOS button immediately alerts Campus Security & Medical units.
        </Text>
      </Card>

      <SosButton
        onDispatchSos={handleDispatch}
        onCancelSos={handleCancel}
        hasLocationPermission={hasLocationPermission}
      />

      <Text style={styles.sectionTitle}>Live Emergency Alert Log</Text>
      {alertLogs.map((log) => (
        <Card key={log.id} style={styles.logCard}>
          <View style={styles.logRow}>
            <View style={styles.logInfo}>
              <Text style={styles.logRecipient}>{log.recipient}</Text>
              <Text style={styles.logTime}>{log.timestamp}</Text>
            </View>
            <View style={[styles.statusBadge, log.status === 'dispatched' ? styles.bgDanger : styles.bgWarning]}>
              <Text style={styles.statusText}>{log.status.toUpperCase()}</Text>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md },
  bannerCard: { backgroundColor: colors.danger.main, padding: spacing.lg, marginBottom: spacing.sm },
  bannerTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.white },
  bannerSub: { fontSize: typography.fontSize.xs, color: colors.danger.light, marginTop: spacing.xs / 2 },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[800], marginVertical: spacing.md },
  logCard: { padding: spacing.md, marginBottom: spacing.xs },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logInfo: { flex: 1, marginRight: spacing.sm },
  logRecipient: { fontSize: typography.fontSize.sm, fontWeight: 'bold', color: colors.gray[900] },
  logTime: { fontSize: typography.fontSize.xs, color: colors.gray[500], marginTop: 2 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs / 2, borderRadius: radius.full },
  bgDanger: { backgroundColor: colors.danger.light },
  bgWarning: { backgroundColor: colors.warning.light },
  statusText: { fontSize: 10, fontWeight: 'bold', color: colors.danger.dark },
});
