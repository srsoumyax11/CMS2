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

interface ParentOutpassRequest {
  id: string;
  childName: string;
  rollNo: string;
  category: string;
  destination: string;
  reason: string;
  departure: string;
  expectedReturn: string;
  status: 'Pending Parent Consent' | 'Approved by Parent' | 'Declined';
}

export default function ParentOutpassConsentScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [requests, setRequests] = useState<ParentOutpassRequest[]>([
    {
      id: 'OP-501',
      childName: 'Soham Chakraborty',
      rollNo: '2024-CS-089',
      category: 'Overnight Outpass',
      destination: 'Hometown (Kolkata, WB)',
      reason: 'Attending cousin sister wedding ceremony',
      departure: 'Oct 04, 05:00 PM',
      expectedReturn: 'Oct 06, 08:00 AM',
      status: 'Pending Parent Consent',
    },
  ]);

  // Otp Modal State
  const [selectedReq, setSelectedReq] = useState<ParentOutpassRequest | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);

  const handleVerifyOtp = () => {
    if (otpCode.length < 4 || !selectedReq) return;
    setRequests((prev) =>
      prev.map((r) => (r.id === selectedReq.id ? { ...r, status: 'Approved by Parent' } : r))
    );
    setOtpSuccess(true);
    setTimeout(() => {
      setSelectedReq(null);
      setOtpCode('');
      setOtpSuccess(false);
    }, 1200);
  };

  const handleDecline = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Declined' } : r))
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Outpass Authorization Requests</Text>
        <Text style={styles.sectionSub}>Campus security requires verified parent consent for overnight student outpasses.</Text>

        {requests.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.reqId}>{item.id} • {item.category}</Text>
                <Text style={[styles.childName, { color: textPrimary }]}>{item.childName}</Text>
                <Text style={styles.childRoll}>{item.rollNo}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      item.status === 'Approved by Parent'
                        ? Tokens.colors.secondary
                        : item.status === 'Declined'
                        ? Tokens.colors.accentRed
                        : Tokens.colors.accentOrange,
                  },
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Destination:</Text>
              <Text style={[styles.infoVal, { color: textPrimary }]}>{item.destination}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reason:</Text>
              <Text style={[styles.infoVal, { color: textPrimary, fontStyle: 'italic' }]}>"{item.reason}"</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Departure:</Text>
              <Text style={[styles.infoVal, { color: textPrimary }]}>{item.departure}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expected Return:</Text>
              <Text style={[styles.infoVal, { color: textPrimary }]}>{item.expectedReturn}</Text>
            </View>

            {item.status === 'Pending Parent Consent' && (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.approveBtn, { backgroundColor: Tokens.colors.secondary }]}
                  onPress={() => setSelectedReq(item)}
                >
                  <Ionicons name="shield-checkmark-outline" size={16} color="#FFF" />
                  <Text style={styles.approveBtnText}>Authorize Outpass</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.declineBtn, { backgroundColor: Tokens.colors.accentRed }]}
                  onPress={() => handleDecline(item.id)}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#FFF" />
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* SMS OTP Verification Modal */}
      <Modal visible={!!selectedReq} animationType="fade" transparent onRequestClose={() => setSelectedReq(null)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>
              {otpSuccess ? 'Consent Approved! ✓' : 'Parent Security OTP Consent'}
            </Text>

            {otpSuccess ? (
              <View style={{ alignItems: 'center', marginVertical: 16 }}>
                <Ionicons name="checkmark-circle" size={54} color={Tokens.colors.secondary} />
                <Text style={[styles.modalSub, { color: textPrimary, textAlign: 'center', marginTop: 10 }]}>
                  Your parent authorization for {selectedReq?.childName} has been recorded and submitted to Warden Office.
                </Text>
              </View>
            ) : (
              <View>
                <Text style={{ fontSize: 12, color: Tokens.colors.textMuted, marginTop: 4 }}>
                  Enter the 4-digit security OTP sent to registered parent mobile number (+91 ********10)
                </Text>

                <TextInput
                  style={[styles.otpInput, { color: textPrimary, backgroundColor: bg, borderColor: Tokens.colors.primary }]}
                  placeholder="Enter 4-digit OTP (e.g. 5892)"
                  placeholderTextColor={Tokens.colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                />

                <TouchableOpacity style={[styles.verifyBtn, { backgroundColor: Tokens.colors.primary }]} onPress={handleVerifyOtp}>
                  <Text style={styles.verifyBtnText}>Verify OTP & Authorize</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedReq(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  scrollContent: { paddingBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold' },
  sectionSub: { fontSize: 11, color: Tokens.colors.textMuted, marginTop: 2, marginBottom: 12 },
  card: { padding: 14, borderWidth: 2, borderRadius: 8, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reqId: { fontSize: 11, fontWeight: 'bold', color: Tokens.colors.primary },
  childName: { fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  childRoll: { fontSize: 11, color: Tokens.colors.textMuted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  infoRow: { flexDirection: 'row', marginTop: 4 },
  infoLabel: { fontSize: 11, color: Tokens.colors.textMuted, width: 100 },
  infoVal: { fontSize: 11, fontWeight: '600', flex: 1 },
  actionsRow: { flexDirection: 'row', marginTop: 14 },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 6, marginRight: 8 },
  approveBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
  declineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
  declineBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', padding: 18, borderWidth: 2, borderRadius: 8 },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  modalSub: { fontSize: 13, lineHeight: 18 },
  otpInput: { borderWidth: 2, borderRadius: 6, padding: 12, fontSize: 16, textAlign: 'center', letterSpacing: 6, marginVertical: 16 },
  verifyBtn: { paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
  verifyBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { paddingVertical: 10, alignItems: 'center', marginTop: 6 },
  cancelBtnText: { color: Tokens.colors.textMuted, fontSize: 12 },
});
