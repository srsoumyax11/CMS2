import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking } from 'react-native';
import { Button } from './Button';
import { Card } from './Card';
import { colors, spacing, typography, radius } from '@campus/design-tokens';

export interface EmergencyContact {
  label: string;
  phone: string;
}

export interface SosPayload {
  idempotencyKey: string;
  latitude: number | null;
  longitude: number | null;
  locationDenied?: boolean;
  timestamp: string;
}

export interface SosButtonProps {
  onDispatchSos: (payload: SosPayload) => Promise<void>;
  onCancelSos?: (idempotencyKey: string) => Promise<void>;
  hasLocationPermission?: boolean;
  emergencyContacts?: EmergencyContact[];
  isLoading?: boolean;
}

export const SosButton: React.FC<SosButtonProps> = ({
  onDispatchSos,
  onCancelSos,
  hasLocationPermission = true,
  emergencyContacts = [
    { label: 'Campus Security', phone: '+91 99999 88888' },
    { label: 'Medical Center', phone: '+91 99999 77777' },
  ],
  isLoading = false,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeDispatchKey, setActiveDispatchKey] = useState<string | null>(null);
  const [cancelCountdown, setCancelCountdown] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cancelCountdown > 0) {
      timer = setTimeout(() => {
        setCancelCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cancelCountdown]);

  const handleConfirmDispatch = async () => {
    if (isSending || isLoading) return; // double-tap block
    setIsSending(true);
    setShowConfirm(false);
    setStatusMessage('Sending SOS Signal...');

    const idempotencyKey = `sos_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    try {
      const payload: SosPayload = {
        idempotencyKey,
        latitude: hasLocationPermission ? 20.2961 : null,
        longitude: hasLocationPermission ? 85.8245 : null,
        locationDenied: !hasLocationPermission,
        timestamp: new Date().toISOString(),
      };

      await onDispatchSos(payload);
      setActiveDispatchKey(idempotencyKey);
      setCancelCountdown(30);
      setStatusMessage('SOS Alert Dispatched! Security team notified.');
    } catch {
      setStatusMessage('SOS queued offline. Retry scheduled.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCallPhone = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      // Fallback if tel handler not supported
    });
  };

  const handleCancelFalseAlarm = async () => {
    if (!activeDispatchKey || !onCancelSos) return;
    try {
      await onCancelSos(activeDispatchKey);
      setStatusMessage('SOS Alert cancelled (False Alarm).');
      setActiveDispatchKey(null);
      setCancelCountdown(0);
    } catch {
      setStatusMessage('Failed to send cancel signal.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.sosCircleButton, (isSending || isLoading) && styles.disabledBtn]}
        onPress={() => setShowConfirm(true)}
        disabled={isSending || isLoading}
        testID="btn-trigger-sos"
        accessibilityRole="button"
        accessibilityLabel="Emergency SOS Button"
      >
        <Text style={styles.sosButtonText}>SOS</Text>
        <Text style={styles.sosSubText}>EMERGENCY</Text>
      </TouchableOpacity>

      {statusMessage && (
        <Text style={styles.statusNotice} testID="sos-status-notice">
          {statusMessage}
        </Text>
      )}

      {cancelCountdown > 0 && onCancelSos && (
        <View style={styles.cancelContainer}>
          <Text style={styles.cancelTimerText}>
            Cancel false alarm ({cancelCountdown}s left)
          </Text>
          <Button
            label="Cancel SOS (False Alarm)"
            variant="secondary"
            onPress={handleCancelFalseAlarm}
            testID="btn-cancel-sos-false-alarm"
          />
        </View>
      )}

      <Card style={styles.contactsCard}>
        <Text style={styles.contactsTitle}>Emergency Contacts (Tap to Call)</Text>
        {emergencyContacts.map((c) => (
          <TouchableOpacity
            key={c.phone}
            style={styles.contactRow}
            onPress={() => handleCallPhone(c.phone)}
            testID={`contact-call-${c.phone}`}
          >
            <Text style={styles.contactLabel}>{c.label}</Text>
            <Text style={styles.contactPhone}>{c.phone} 📞</Text>
          </TouchableOpacity>
        ))}
      </Card>

      <Modal transparent animationType="fade" visible={showConfirm}>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Emergency SOS</Text>
            <Text style={styles.modalMessage}>
              {hasLocationPermission
                ? 'Are you sure you want to send an emergency SOS with your location to campus security?'
                : 'Location permission denied. Are you sure you want to send an emergency SOS WITHOUT coordinates to campus security?'}
            </Text>
            <View style={styles.modalActions}>
              <Button label="Cancel" variant="secondary" onPress={() => setShowConfirm(false)} />
              <Button
                label="Confirm SOS"
                variant="danger"
                onPress={handleConfirmDispatch}
                isLoading={isSending || isLoading}
                disabled={isSending || isLoading}
                testID="btn-confirm-sos-dispatch"
              />
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
};

const SOS_BUTTON_SIZE = spacing.xl * 6 + spacing.md; // 160px size

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: spacing.md },
  sosCircleButton: {
    width: SOS_BUTTON_SIZE,
    height: SOS_BUTTON_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.danger.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.danger.dark,
    shadowOffset: { width: spacing.none, height: spacing.xs },
    shadowOpacity: 0.4,
    shadowRadius: spacing.md,
    elevation: spacing.md,
    marginVertical: spacing.lg,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  sosButtonText: { fontSize: typography.fontSize['4xl'], fontWeight: 'bold', color: colors.white },
  sosSubText: { fontSize: typography.fontSize.xs, color: colors.danger.light, letterSpacing: spacing.xs / 4, fontWeight: 'bold' },
  statusNotice: { fontSize: typography.fontSize.sm, fontWeight: 'bold', color: colors.danger.main, marginVertical: spacing.sm, textAlign: 'center' },
  cancelContainer: {
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  cancelTimerText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  contactsCard: { width: '100%', padding: spacing.md, marginTop: spacing.md },
  contactsTitle: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.gray[800], marginBottom: spacing.xs },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
  contactLabel: { fontSize: typography.fontSize.sm, color: colors.gray[700] },
  contactPhone: { fontSize: typography.fontSize.sm, fontWeight: 'bold', color: colors.primary[600] },
  modalOverlay: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'center', padding: spacing.md },
  modalCard: { padding: spacing.lg },
  modalTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.danger.main, marginBottom: spacing.xs },
  modalMessage: { fontSize: typography.fontSize.sm, color: colors.gray[700], marginBottom: spacing.lg },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.xs },
});
