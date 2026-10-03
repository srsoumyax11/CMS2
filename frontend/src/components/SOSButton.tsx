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

export const SOSButton: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [modalVisible, setModalVisible] = useState(false);
  const [activeSOS, setActiveSOS] = useState(false);

  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const handleTriggerSOS = () => {
    setActiveSOS(true);
    setModalVisible(false);
  };

  const handleCancelSOS = () => {
    setActiveSOS(false);
  };

  return (
    <>
      {/* Active SOS Banner at Top */}
      {activeSOS && (
        <View style={styles.activeBanner}>
          <View style={styles.activeBannerLeft}>
            <View style={styles.pulseDot} />
            <Text style={styles.activeBannerText}>EMERGENCY SOS ACTIVE • Broadcasting Location</Text>
          </View>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelSOS}>
            <Text style={styles.cancelBtnText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating 2D Red Action Button */}
      <TouchableOpacity
        style={[styles.floatingBtn, { backgroundColor: Tokens.colors.accentRed }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="alert-circle" size={26} color="#FFFFFF" />
        <Text style={styles.floatingBtnText}>SOS</Text>
      </TouchableOpacity>

      {/* SOS Confirmation Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.header}>
              <View style={[styles.iconCircle, { backgroundColor: Tokens.colors.accentRed }]}>
                <Ionicons name="warning" size={36} color="#FFFFFF" />
              </View>
              <Text style={[styles.title, { color: textPrimary }]}>Trigger Emergency SOS?</Text>
              <Text style={styles.sub}>
                This will immediately alert Campus Security, Hostel Warden, and Emergency Directory. Your live GPS coordinates will be transmitted.
              </Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: 'rgba(0,0,0,0.1)', flex: 1 }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: textPrimary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Tokens.colors.accentRed, flex: 2 }]}
                onPress={handleTriggerSOS}
              >
                <Ionicons name="megaphone" size={18} color="#FFFFFF" />
                <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>CONFIRM & ALERT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  activeBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: Tokens.colors.accentRed,
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.xs },
  pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFFFFF' },
  activeBannerText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  cancelBtn: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: Tokens.spacing.sm, paddingVertical: 4, borderRadius: Tokens.radii.sm },
  cancelBtnText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  floatingBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.radii.pill,
    borderWidth: Tokens.borderWidths.flat,
    borderColor: '#FFFFFF',
  },
  floatingBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Tokens.spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: Tokens.radii.lg,
    padding: Tokens.spacing.lg,
    borderWidth: Tokens.borderWidths.flat,
    alignItems: 'center',
  },
  header: { alignItems: 'center', marginBottom: Tokens.spacing.lg },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: Tokens.spacing.sm },
  title: { fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 12, color: Tokens.colors.textMuted, textAlign: 'center', lineHeight: 16 },
  actionRow: { flexDirection: 'row', gap: Tokens.spacing.sm, width: '100%' },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Tokens.spacing.md,
    borderRadius: Tokens.radii.sm,
    gap: Tokens.spacing.xs,
  },
  modalBtnText: { fontWeight: '900', fontSize: 13 },
});
