import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Tokens } from '../theme/tokens';

interface QRModalProps {
  visible: boolean;
  mode: 'PRESENT' | 'SCAN';
  title?: string;
  payload?: string;
  onScanResult?: (code: string) => void;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({
  visible,
  mode,
  title = 'Digital QR Verification',
  payload = 'C7-PASS-2026-CS-004-TS-1790984920',
  onScanResult,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [flashlightOn, setFlashlightOn] = useState(false);
  const [scanned, setScanned] = useState(false);

  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const handleSimulateScan = () => {
    setScanned(true);
    setTimeout(() => {
      onScanResult?.('C7-VERIFIED-2026-CS-004');
      onClose();
      setScanned(false);
    }, 800);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: textPrimary }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={24} color={Tokens.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Mode 1: Present QR Code */}
          {mode === 'PRESENT' && (
            <View style={styles.contentBox}>
              <View style={[styles.qrContainer, { borderColor: Tokens.colors.primary }]}>
                {/* 2D Flat Geometric Mock QR Matrix */}
                <View style={styles.qrGrid}>
                  <View style={[styles.qrSquare, { backgroundColor: Tokens.colors.primary }]} />
                  <View style={[styles.qrSquare, { backgroundColor: textPrimary }]} />
                  <View style={[styles.qrSquare, { backgroundColor: Tokens.colors.primary }]} />
                  <View style={[styles.qrSquare, { backgroundColor: textPrimary }]} />
                  <View style={[styles.qrSquare, { backgroundColor: Tokens.colors.secondary }]} />
                  <View style={[styles.qrSquare, { backgroundColor: Tokens.colors.primary }]} />
                  <View style={[styles.qrSquare, { backgroundColor: Tokens.colors.primary }]} />
                  <View style={[styles.qrSquare, { backgroundColor: textPrimary }]} />
                  <View style={[styles.qrSquare, { backgroundColor: Tokens.colors.primary }]} />
                </View>
              </View>

              <Text style={styles.payloadText}>Payload: {payload}</Text>
              <Text style={styles.helperText}>Present this QR code to the Warden Gatekeeper or Attendance Kiosk.</Text>
            </View>
          )}

          {/* Mode 2: Camera Scanner View Simulation */}
          {mode === 'SCAN' && (
            <View style={styles.contentBox}>
              <View style={[styles.scannerFrame, { borderColor: Tokens.colors.secondary }]}>
                <View style={[styles.scannerCorner, styles.cornerTL, { borderColor: Tokens.colors.secondary }]} />
                <View style={[styles.scannerCorner, styles.cornerTR, { borderColor: Tokens.colors.secondary }]} />
                <View style={[styles.scannerCorner, styles.cornerBL, { borderColor: Tokens.colors.secondary }]} />
                <View style={[styles.scannerCorner, styles.cornerBR, { borderColor: Tokens.colors.secondary }]} />
                <Text style={styles.scannerPrompt}>Align QR code within frame</Text>
              </View>

              <View style={styles.scannerControls}>
                <TouchableOpacity
                  style={[
                    styles.controlBtn,
                    { backgroundColor: flashlightOn ? Tokens.colors.accentOrange : 'rgba(0,0,0,0.1)' },
                  ]}
                  onPress={() => setFlashlightOn(!flashlightOn)}
                >
                  <Ionicons name={flashlightOn ? 'flash' : 'flash-outline'} size={18} color={textPrimary} />
                  <Text style={[styles.controlText, { color: textPrimary }]}>Flashlight</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlBtn, { backgroundColor: Tokens.colors.secondary }]}
                  onPress={handleSimulateScan}
                >
                  <Ionicons name="scan" size={18} color="#FFFFFF" />
                  <Text style={[styles.controlText, { color: '#FFFFFF' }]}>
                    {scanned ? 'Verifying...' : 'Simulate Scan'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Tokens.spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: Tokens.radii.lg,
    padding: Tokens.spacing.lg,
    borderWidth: Tokens.borderWidths.flat,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Tokens.spacing.md },
  title: { fontSize: 18, fontWeight: '900' },
  contentBox: { alignItems: 'center' },
  qrContainer: {
    width: 200,
    height: 200,
    borderWidth: Tokens.borderWidths.thick,
    borderRadius: Tokens.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: Tokens.spacing.md,
    marginBottom: Tokens.spacing.md,
  },
  qrGrid: { width: 160, height: 160, flexWrap: 'wrap', flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center' },
  qrSquare: { width: 44, height: 44, borderRadius: 4 },
  payloadText: { fontSize: 11, fontWeight: '800', color: Tokens.colors.textMuted, marginBottom: 4 },
  helperText: { fontSize: 11, color: Tokens.colors.textMuted, textAlign: 'center' },
  scannerFrame: {
    width: 220,
    height: 220,
    borderRadius: Tokens.radii.md,
    borderWidth: Tokens.borderWidths.flat,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    position: 'relative',
    marginBottom: Tokens.spacing.md,
  },
  scannerCorner: { position: 'absolute', width: 24, height: 24, borderWidth: 3 },
  cornerTL: { top: 12, left: 12, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 12, right: 12, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 12, left: 12, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 12, right: 12, borderLeftWidth: 0, borderTopWidth: 0 },
  scannerPrompt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  scannerControls: { flexDirection: 'row', gap: Tokens.spacing.sm, width: '100%' },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.radii.sm,
    gap: 6,
  },
  controlText: { fontSize: 12, fontWeight: '800' },
});
