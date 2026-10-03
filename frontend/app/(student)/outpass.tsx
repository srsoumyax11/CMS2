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
import { QRModal } from '../../src/components/QRModal';
import { Tokens } from '../../src/theme/tokens';

export default function OutpassScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [category, setCategory] = useState<'local' | 'overnight' | 'emergency'>('local');
  const [reason, setReason] = useState('');
  const [leavingTime, setLeavingTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [activeOutpass, setActiveOutpass] = useState(true);

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const handleApplyOutpass = () => {
    setActiveOutpass(true);
    setApplyModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Top Action Bar */}
      <View style={[styles.topBar, { backgroundColor: surface, borderColor: border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.topTitle, { color: textPrimary }]}>Digital Outpass Desk</Text>
          <Text style={styles.topSub}>Gatekeeper QR verification engine</Text>
        </View>

        <TouchableOpacity
          style={[styles.applyBtn, { backgroundColor: Tokens.colors.accentOrange }]}
          onPress={() => setApplyModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={18} color="#FFFFFF" />
          <Text style={styles.applyBtnText}>Apply Outpass</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeOutpass ? (
          /* Active Outpass Pass Card */
          <View style={[styles.passCard, { backgroundColor: surface, borderColor: Tokens.colors.secondary }]}>
            <View style={styles.passHeader}>
              <View style={[styles.badge, { backgroundColor: Tokens.colors.secondary }]}>
                <Text style={styles.badgeText}>APPROVED BY WARDEN ✓</Text>
              </View>
              <Text style={styles.passId}>#OP-2026-9821</Text>
            </View>

            <Text style={[styles.passTitle, { color: textPrimary }]}>Local Outpass • Weekend Market</Text>
            <Text style={styles.passMeta}>Leaving: Today 04:00 PM • Expected Return: Today 08:30 PM</Text>

            {/* Approval Progress Timeline */}
            <View style={styles.timelineBox}>
              <View style={styles.timelineRow}>
                <Ionicons name="checkmark-circle" size={18} color={Tokens.colors.secondary} />
                <Text style={[styles.timelineText, { color: textPrimary }]}>Parent Authorization Verified</Text>
              </View>
              <View style={styles.timelineRow}>
                <Ionicons name="checkmark-circle" size={18} color={Tokens.colors.secondary} />
                <Text style={[styles.timelineText, { color: textPrimary }]}>Hostel Warden R. Sharma Approved</Text>
              </View>
              <View style={styles.timelineRow}>
                <Ionicons name="ellipse-outline" size={18} color={Tokens.colors.accentOrange} />
                <Text style={[styles.timelineText, { color: Tokens.colors.accentOrange }]}>Awaiting Gate Scanner Check-out</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.passActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Tokens.colors.primary }]}
                onPress={() => setQrModalVisible(true)}
              >
                <Ionicons name="qr-code" size={16} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Show Gate QR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Tokens.colors.secondary }]}
                onPress={() => alert('Check-in confirmed! Welcome back to campus.')}
              >
                <Ionicons name="location" size={16} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Mark Campus Return</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Ionicons name="exit-outline" size={48} color={Tokens.colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>No Active Outpass</Text>
            <Text style={styles.emptySub}>Apply for a local or overnight outpass to leave hostel campus bounds.</Text>
          </View>
        )}
      </ScrollView>

      {/* Apply Outpass Modal */}
      <Modal visible={applyModalVisible} animationType="fade" transparent onRequestClose={() => setApplyModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textPrimary }]}>Apply Outpass Request</Text>
              <TouchableOpacity onPress={() => setApplyModalVisible(false)}>
                <Ionicons name="close-circle" size={22} color={Tokens.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Outpass Category</Text>
              <View style={styles.catRow}>
                {(['local', 'overnight', 'emergency'] as const).map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catChip,
                        {
                          backgroundColor: isSelected ? Tokens.colors.accentOrange : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                          borderColor: isSelected ? Tokens.colors.accentOrange : border,
                        },
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.catText, { color: isSelected ? '#FFFFFF' : textPrimary }]}>
                        {cat.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Leaving Date & Time</Text>
              <TextInput
                style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
                placeholder="e.g. Today 04:00 PM"
                placeholderTextColor="#94A3B8"
                value={leavingTime}
                onChangeText={setLeavingTime}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expected Return Date & Time</Text>
              <TextInput
                style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
                placeholder="e.g. Today 08:30 PM"
                placeholderTextColor="#94A3B8"
                value={returnTime}
                onChangeText={setReturnTime}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reason / Destination</Text>
              <TextInput
                style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
                placeholder="e.g. Grocery shopping at City Center"
                placeholderTextColor="#94A3B8"
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={2}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: Tokens.colors.accentOrange }]}
              onPress={handleApplyOutpass}
            >
              <Text style={styles.submitBtnText}>Submit Outpass Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR Presenter Modal */}
      <QRModal
        visible={qrModalVisible}
        mode="PRESENT"
        title="Gatekeeper Outpass QR"
        payload="OP-2026-9821-GATE-CHECKOUT"
        onClose={() => setQrModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    padding: Tokens.spacing.md,
    borderBottomWidth: Tokens.borderWidths.flat,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topTitle: { fontSize: 16, fontWeight: '900' },
  topSub: { fontSize: 11, color: Tokens.colors.textMuted },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.radii.sm,
  },
  applyBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  scrollContent: { padding: Tokens.spacing.md },
  passCard: { padding: Tokens.spacing.md, borderRadius: Tokens.radii.md, borderWidth: Tokens.borderWidths.thick },
  passHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Tokens.spacing.xs },
  badge: { paddingHorizontal: Tokens.spacing.xs, paddingVertical: 2, borderRadius: Tokens.radii.sm },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  passId: { fontSize: 12, fontWeight: '800', color: Tokens.colors.textMuted },
  passTitle: { fontSize: 16, fontWeight: '900', marginBottom: 2 },
  passMeta: { fontSize: 12, color: Tokens.colors.textMuted, marginBottom: Tokens.spacing.md },
  timelineBox: { gap: Tokens.spacing.xs, marginBottom: Tokens.spacing.md, backgroundColor: 'rgba(0,0,0,0.02)', padding: Tokens.spacing.sm, borderRadius: Tokens.radii.sm },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timelineText: { fontSize: 12, fontWeight: '700' },
  passActions: { flexDirection: 'row', gap: Tokens.spacing.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Tokens.spacing.sm, borderRadius: Tokens.radii.sm, gap: 6 },
  actionBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: Tokens.spacing.xxl },
  emptyTitle: { fontSize: 16, fontWeight: '800', marginTop: Tokens.spacing.sm },
  emptySub: { fontSize: 12, color: Tokens.colors.textMuted, textAlign: 'center', marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: Tokens.spacing.md },
  modalCard: { width: '100%', maxWidth: 400, borderRadius: Tokens.radii.lg, padding: Tokens.spacing.lg, borderWidth: Tokens.borderWidths.flat },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Tokens.spacing.sm },
  modalTitle: { fontSize: 16, fontWeight: '900' },
  inputGroup: { marginBottom: Tokens.spacing.md },
  label: { fontSize: 12, fontWeight: '700', color: Tokens.colors.textMuted, marginBottom: 6 },
  catRow: { flexDirection: 'row', gap: Tokens.spacing.xs },
  catChip: { flex: 1, paddingVertical: Tokens.spacing.sm, alignItems: 'center', borderRadius: Tokens.radii.sm, borderWidth: Tokens.borderWidths.flat },
  catText: { fontSize: 10, fontWeight: '800' },
  input: { paddingHorizontal: Tokens.spacing.md, paddingVertical: Tokens.spacing.sm, borderRadius: Tokens.radii.sm, borderWidth: Tokens.borderWidths.flat, fontSize: 14 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Tokens.spacing.md, borderRadius: Tokens.radii.sm, gap: Tokens.spacing.sm, marginTop: Tokens.spacing.xs },
  submitBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
});
