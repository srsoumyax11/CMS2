import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Tokens } from '../../src/theme/tokens';

export default function StudentIDCardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');
  const [qrModalVisible, setQrModalVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title & Instructions */}
        <View style={styles.headerBox}>
          <Text style={[styles.pageTitle, { color: textPrimary }]}>Official Digital ID Card</Text>
          <Text style={styles.pageSub}>Tap below or use the button to flip card front/back</Text>
        </View>

        {/* Rotatable ID Card Frame */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => setCardSide((prev) => (prev === 'front' ? 'back' : 'front'))}
          style={[styles.idCard, { backgroundColor: surface, borderColor: Tokens.colors.primary }]}
        >
          {/* Card Top Banner */}
          <View style={styles.cardHeaderBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.collegeName}>CAMPUS7 UNIVERSITY</Text>
              <Text style={styles.collegeSub}>INSTITUTE OF TECHNOLOGY & MANAGEMENT</Text>
            </View>
            <View style={styles.hologramBadge}>
              <Text style={styles.hologramText}>OFFICIAL</Text>
            </View>
          </View>

          {cardSide === 'front' ? (
            /* Front Side Content */
            <View style={styles.cardBody}>
              <View style={styles.profileRow}>
                {/* Photo Placeholder */}
                <View style={[styles.photoBox, { borderColor: Tokens.colors.primary }]}>
                  <Ionicons name="person" size={54} color={Tokens.colors.primary} />
                </View>

                {/* Details */}
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={[styles.studentName, { color: textPrimary }]}>SOHAM CHAKRABORTY</Text>
                  <Text style={[styles.rollNo, { color: Tokens.colors.primary }]}>ROLL: 2024-CS-089</Text>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Branch:</Text>
                    <Text style={[styles.infoVal, { color: textPrimary }]}>Computer Engineering</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Course:</Text>
                    <Text style={[styles.infoVal, { color: textPrimary }]}>B.Tech (2024 - 2028)</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Valid Until:</Text>
                    <Text style={[styles.infoVal, { color: Tokens.colors.secondary }]}>JUNE 2028</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerNote}>STUDENT IDENTIFICATION CARD</Text>
                <Text style={styles.tapFlipText}>Tap to view back side 🔄</Text>
              </View>
            </View>
          ) : (
            /* Back Side Content */
            <View style={styles.cardBody}>
              <Text style={[styles.backTitle, { color: textPrimary }]}>STUDENT PERSONAL & EMERGENCY DETAILS</Text>

              <View style={styles.backGrid}>
                <View style={styles.backItem}>
                  <Text style={styles.backLabel}>Blood Group:</Text>
                  <Text style={[styles.backVal, { color: Tokens.colors.accentRed }]}>O +VE</Text>
                </View>

                <View style={styles.backItem}>
                  <Text style={styles.backLabel}>Date of Birth:</Text>
                  <Text style={[styles.backVal, { color: textPrimary }]}>14 AUGUST 2004</Text>
                </View>

                <View style={styles.backItem}>
                  <Text style={styles.backLabel}>Hostel Resident:</Text>
                  <Text style={[styles.backVal, { color: textPrimary }]}>Block B - Room 304</Text>
                </View>

                <View style={styles.backItem}>
                  <Text style={styles.backLabel}>Guardian Contact:</Text>
                  <Text style={[styles.backVal, { color: textPrimary }]}>+91 98765 43210</Text>
                </View>
              </View>

              <Text style={[styles.backLabel, { marginTop: 10 }]}>Permanent Address:</Text>
              <Text style={[styles.addressText, { color: textPrimary }]}>
                Plot 42, Civil Lines, Sector 5, Tech City, PIN - 400001
              </Text>

              {/* Barcode Mock */}
              <View style={styles.barcodeBox}>
                <View style={styles.barcodeLines} />
                <Text style={styles.barcodeCode}>*2024CS089-CAMPUS7-VERIFIED*</Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerNote}>IF FOUND, PLEASE RETURN TO REGISTRAR OFFICE</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Control Action Buttons */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: Tokens.colors.primary }]}
            onPress={() => setCardSide((prev) => (prev === 'front' ? 'back' : 'front'))}
          >
            <Ionicons name="swap-horizontal-outline" size={18} color="#FFFFFF" />
            <Text style={styles.controlBtnText}>Flip to {cardSide === 'front' ? 'Back' : 'Front'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: Tokens.colors.accentPurple }]}
            onPress={() => setQrModalVisible(true)}
          >
            <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
            <Text style={styles.controlBtnText}>Offline Scan QR</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.downloadBtn, { borderColor: border, backgroundColor: surface }]}
          onPress={() => alert('Saved digital ID card to wallet / local storage!')}
        >
          <Ionicons name="download-outline" size={18} color={textPrimary} />
          <Text style={[styles.downloadBtnText, { color: textPrimary }]}>Save Pass / Download PDF</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Verification QR Modal */}
      <Modal visible={qrModalVisible} animationType="fade" transparent onRequestClose={() => setQrModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.modalTitle, { color: textPrimary }]}>Encrypted Identity Verification QR</Text>
              <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={Tokens.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, color: Tokens.colors.textMuted, marginTop: 4 }}>
              Scan with Campus7 Warden or Security Gatekeeper app to verify digital ID credentials.
            </Text>

            <View style={styles.qrDisplayBox}>
              <Ionicons name="qr-code-sharp" size={180} color={Tokens.colors.textDark} />
            </View>

            <Text style={styles.qrPayloadText}>Payload ID: C7-SEC-2024CS089-TIMESTAMP:1790974</Text>

            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: Tokens.colors.primary }]}
              onPress={() => setQrModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close Modal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  scrollContent: { paddingBottom: 30 },
  headerBox: { marginBottom: 14, alignItems: 'center' },
  pageTitle: { fontSize: 18, fontWeight: 'bold' },
  pageSub: { fontSize: 12, color: Tokens.colors.textMuted, marginTop: 2 },
  idCard: {
    width: '100%',
    minHeight: 250,
    borderWidth: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeaderBanner: {
    backgroundColor: Tokens.colors.primary,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  collegeName: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  collegeSub: { color: '#93C5FD', fontSize: 9, fontWeight: 'bold', marginTop: 1 },
  hologramBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  hologramText: { color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' },
  cardBody: { padding: 14 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  photoBox: {
    width: 80,
    height: 96,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentName: { fontSize: 15, fontWeight: 'bold' },
  rollNo: { fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  infoRow: { flexDirection: 'row', marginTop: 4 },
  infoLabel: { fontSize: 11, color: Tokens.colors.textMuted, width: 70 },
  infoVal: { fontSize: 11, fontWeight: 'bold', flex: 1 },
  cardFooter: {
    marginTop: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  footerNote: { fontSize: 9, fontWeight: 'bold', color: Tokens.colors.textMuted },
  tapFlipText: { fontSize: 10, color: Tokens.colors.primary, marginTop: 2, fontWeight: '600' },
  backTitle: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  backGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  backItem: { width: '50%', marginBottom: 6 },
  backLabel: { fontSize: 10, color: Tokens.colors.textMuted },
  backVal: { fontSize: 11, fontWeight: 'bold', marginTop: 1 },
  addressText: { fontSize: 11, marginTop: 2 },
  barcodeBox: { marginTop: 12, alignItems: 'center', padding: 6, backgroundColor: '#F8FAFC', borderRadius: 4 },
  barcodeLines: { width: '80%', height: 24, backgroundColor: '#000' },
  barcodeCode: { fontSize: 9, fontFamily: 'monospace', marginTop: 4, color: Tokens.colors.textMuted },
  controlsRow: { flexDirection: 'row', marginTop: 16 },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  controlBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 8,
    marginTop: 10,
  },
  downloadBtnText: { fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', padding: 18, borderWidth: 2, borderRadius: 8, alignItems: 'center' },
  modalTitle: { fontSize: 15, fontWeight: 'bold' },
  qrDisplayBox: { marginVertical: 16, padding: 10, backgroundColor: '#FFFFFF', borderWidth: 2, borderRadius: 8 },
  qrPayloadText: { fontSize: 10, color: Tokens.colors.textMuted, fontFamily: 'monospace' },
  modalCloseBtn: { width: '100%', paddingVertical: 10, borderRadius: 6, alignItems: 'center', marginTop: 14 },
  modalCloseBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
});
