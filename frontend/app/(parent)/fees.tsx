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

export default function ParentFeesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePay = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      setCheckoutModalVisible(false);
      setPaymentSuccess(false);
    }, 1200);
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Total Dues Header */}
        <View style={[styles.dueCard, { backgroundColor: surface, borderColor: paymentSuccess ? Tokens.colors.secondary : Tokens.colors.accentOrange }]}>
          <Text style={styles.dueLabel}>Autumn Term 2026 Total Dues (Soham Chakraborty)</Text>
          <Text style={[styles.dueAmount, { color: paymentSuccess ? Tokens.colors.secondary : Tokens.colors.accentOrange }]}>
            {paymentSuccess ? '₹0.00 (PAID ✓)' : '₹48,500.00'}
          </Text>
          <Text style={styles.dueDateText}>Due Date: October 15, 2026</Text>

          {!paymentSuccess && (
            <TouchableOpacity
              style={[styles.payNowBtn, { backgroundColor: Tokens.colors.accentOrange }]}
              onPress={() => setCheckoutModalVisible(true)}
            >
              <Ionicons name="lock-closed" size={16} color="#FFF" />
              <Text style={styles.payNowBtnText}>Pay Full Dues Now</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Itemized Invoice Table */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Itemized Term Fee Invoice</Text>
        <View style={[styles.tableCard, { backgroundColor: surface, borderColor: border }]}>
          {[
            { item: 'Tuition Fee (Semester 5)', amount: '₹35,000.00' },
            { item: 'Hostel Accommodation (Block B)', amount: '₹8,500.00' },
            { item: 'Mess Charges (Sep 2026)', amount: '₹4,500.00' },
            { item: 'Library Books Overdue Fine', amount: '₹500.00' },
          ].map((row, idx) => (
            <View key={idx} style={[styles.tableRow, { borderColor: border }]}>
              <Text style={[styles.rowHead, { color: textPrimary }]}>{row.item}</Text>
              <Text style={[styles.rowAmount, { color: textPrimary }]}>{row.amount}</Text>
            </View>
          ))}
        </View>

        {/* Download Receipt */}
        <TouchableOpacity
          style={[styles.receiptBtn, { borderColor: Tokens.colors.primary }]}
          onPress={() => alert('Downloading official stamped fee receipt PDF...')}
        >
          <Ionicons name="download-outline" size={18} color={Tokens.colors.primary} />
          <Text style={[styles.receiptBtnText, { color: Tokens.colors.primary }]}>Download Stamped Tax Invoice PDF</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Payment Gateway Modal */}
      <Modal visible={checkoutModalVisible} animationType="fade" transparent onRequestClose={() => setCheckoutModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>
              {paymentSuccess ? 'Payment Successful! 🎉' : 'Campus7 Parent Checkout'}
            </Text>

            {paymentSuccess ? (
              <View style={{ alignItems: 'center', marginVertical: 16 }}>
                <Ionicons name="checkmark-circle" size={54} color={Tokens.colors.secondary} />
                <Text style={[styles.modalSub, { color: textPrimary, textAlign: 'center', marginTop: 10 }]}>
                  Payment of ₹48,500.00 received! Receipt #RC-9982 sent to parent email.
                </Text>
              </View>
            ) : (
              <View>
                <Text style={{ fontSize: 12, color: Tokens.colors.textMuted, marginTop: 4 }}>
                  Total Payable Amount: <Text style={{ fontWeight: 'bold', color: textPrimary }}>₹48,500.00</Text>
                </Text>

                <Text style={styles.inputLabel}>Select Preferred Payment Method</Text>
                {(['upi', 'card', 'netbanking'] as const).map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.methodRadio,
                      { backgroundColor: selectedMethod === method ? '#EFF6FF' : bg, borderColor: selectedMethod === method ? Tokens.colors.primary : border },
                    ]}
                    onPress={() => setSelectedMethod(method)}
                  >
                    <Ionicons
                      name={method === 'upi' ? 'qr-code-outline' : method === 'card' ? 'card-outline' : 'business-outline'}
                      size={20}
                      color={Tokens.colors.primary}
                    />
                    <Text style={[styles.methodText, { color: textPrimary }]}>
                      {method === 'upi' ? 'UPI (Google Pay / PhonePe / Paytm)' : method === 'card' ? 'Credit / Debit Card' : 'Net Banking (All Major Indian Banks)'}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={[styles.confirmPayBtn, { backgroundColor: Tokens.colors.secondary }]} onPress={handlePay}>
                  <Text style={styles.confirmPayBtnText}>Confirm & Pay ₹48,500.00</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={() => setCheckoutModalVisible(false)}>
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
  dueCard: { padding: 16, borderWidth: 2, borderRadius: 8, marginBottom: 14, alignItems: 'center' },
  dueLabel: { fontSize: 11, color: Tokens.colors.textMuted, textAlign: 'center' },
  dueAmount: { fontSize: 28, fontWeight: 'bold', marginVertical: 6 },
  dueDateText: { fontSize: 11, color: Tokens.colors.textMuted },
  payNowBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, marginTop: 12 },
  payNowBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  tableCard: { borderWidth: 2, borderRadius: 8, overflow: 'hidden', marginBottom: 14 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1 },
  rowHead: { fontSize: 13, fontWeight: '600' },
  rowAmount: { fontSize: 13, fontWeight: 'bold' },
  receiptBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, paddingVertical: 12, borderRadius: 8 },
  receiptBtnText: { fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', padding: 18, borderWidth: 2, borderRadius: 8 },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  modalSub: { fontSize: 13, lineHeight: 18 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', marginTop: 12, color: Tokens.colors.textMuted },
  methodRadio: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 2, borderRadius: 8, marginTop: 8 },
  methodText: { fontSize: 12, fontWeight: 'bold', marginLeft: 10, flex: 1 },
  confirmPayBtn: { paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 16 },
  confirmPayBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { paddingVertical: 10, alignItems: 'center', marginTop: 6 },
  cancelBtnText: { color: Tokens.colors.textMuted, fontSize: 12 },
});
