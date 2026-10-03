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

export default function FeesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [payModalVisible, setPayModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isPaid, setIsPaid] = useState(false);

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const handlePayNow = () => {
    setIsPaid(true);
    setTimeout(() => {
      setPayModalVisible(false);
    }, 1200);
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Pending Balance Header */}
      <View style={[styles.balanceCard, { backgroundColor: surface, borderColor: isPaid ? Tokens.colors.secondary : Tokens.colors.accentPurple }]}>
        <Text style={styles.balanceLabel}>Total Fee Dues (Autumn Term 2026)</Text>
        <Text style={[styles.balanceVal, { color: isPaid ? Tokens.colors.secondary : Tokens.colors.accentPurple }]}>
          {isPaid ? '₹0.00 (PAID ✓)' : '₹48,500.00'}
        </Text>
        <Text style={styles.balanceSub}>Due Date: October 15, 2026</Text>

        {!isPaid && (
          <TouchableOpacity
            style={[styles.payNowBtn, { backgroundColor: Tokens.colors.accentPurple }]}
            onPress={() => setPayModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="card-outline" size={18} color="#FFFFFF" />
            <Text style={styles.payNowBtnText}>Pay Fee Dues Now</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Itemized Fee Breakdown Table */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Itemized Fee Breakdown</Text>
        <View style={[styles.tableCard, { backgroundColor: surface, borderColor: border }]}>
          {[
            { head: 'Tuition Fee (Semester 5)', amount: '₹35,000.00' },
            { head: 'Hostel Room Rent (Block 1)', amount: '₹8,500.00' },
            { head: 'Mess Dues (Sep 2026)', amount: '₹4,500.00' },
            { head: 'Library Overdue Fine', amount: '₹500.00' },
          ].map((item, idx) => (
            <View key={idx} style={[styles.tableRow, { borderColor: border }]}>
              <Text style={[styles.headText, { color: textPrimary }]}>{item.head}</Text>
              <Text style={[styles.amountText, { color: textPrimary }]}>{item.amount}</Text>
            </View>
          ))}
        </View>

        {/* Payment History */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Recent Payment History</Text>
        <View style={[styles.tableCard, { backgroundColor: surface, borderColor: border }]}>
          <View style={[styles.tableRow, { borderColor: border }]}>
            <View>
              <Text style={[styles.headText, { color: textPrimary }]}>Spring Term 2026 Fee</Text>
              <Text style={styles.subDate}>Paid on April 10, 2026 • Receipt #RC-9012</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.amountText, { color: Tokens.colors.secondary }]}>₹48,000.00</Text>
              <TouchableOpacity onPress={() => alert('Downloading official PDF receipt...')}>
                <Text style={[styles.downloadText, { color: Tokens.colors.primary }]}>PDF Receipt</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Payment Gateway Modal */}
      <Modal visible={payModalVisible} animationType="fade" transparent onRequestClose={() => setPayModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textPrimary }]}>Campus7 Payment Gateway</Text>
              <TouchableOpacity onPress={() => setPayModalVisible(false)}>
                <Ionicons name="close-circle" size={22} color={Tokens.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>Amount to Pay: <Text style={{ fontWeight: '900', color: Tokens.colors.accentPurple }}>₹48,500.00</Text></Text>

            {/* Payment Method Selector */}
            <View style={styles.methodRow}>
              {(['upi', 'card', 'netbanking'] as const).map((m) => {
                const isSelected = paymentMethod === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.methodChip,
                      {
                        backgroundColor: isSelected ? Tokens.colors.accentPurple : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                        borderColor: isSelected ? Tokens.colors.accentPurple : border,
                      },
                    ]}
                    onPress={() => setPaymentMethod(m)}
                  >
                    <Text style={[styles.methodText, { color: isSelected ? '#FFFFFF' : textPrimary }]}>
                      {m.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: Tokens.colors.secondary }]}
              onPress={handlePayNow}
            >
              <Text style={styles.submitBtnText}>Confirm & Process Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  balanceCard: { padding: Tokens.spacing.md, borderWidth: Tokens.borderWidths.thick, borderRadius: Tokens.radii.md, margin: Tokens.spacing.md },
  balanceLabel: { fontSize: 12, color: Tokens.colors.textMuted, fontWeight: '700' },
  balanceVal: { fontSize: 28, fontWeight: '900', marginVertical: 4 },
  balanceSub: { fontSize: 11, color: Tokens.colors.textMuted, marginBottom: Tokens.spacing.md },
  payNowBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Tokens.spacing.md, borderRadius: Tokens.radii.sm, gap: Tokens.spacing.xs },
  payNowBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  scrollContent: { paddingHorizontal: Tokens.spacing.md, gap: Tokens.spacing.md, paddingBottom: Tokens.spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '900' },
  tableCard: { padding: Tokens.spacing.md, borderRadius: Tokens.radii.md, borderWidth: Tokens.borderWidths.flat, gap: Tokens.spacing.sm },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Tokens.spacing.xs, borderBottomWidth: Tokens.borderWidths.thin },
  headText: { fontSize: 13, fontWeight: '800' },
  amountText: { fontSize: 13, fontWeight: '900' },
  subDate: { fontSize: 11, color: Tokens.colors.textMuted },
  downloadText: { fontSize: 11, fontWeight: '800', marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: Tokens.spacing.md },
  modalCard: { width: '100%', maxWidth: 400, borderRadius: Tokens.radii.lg, padding: Tokens.spacing.lg, borderWidth: Tokens.borderWidths.flat },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Tokens.spacing.xs },
  modalTitle: { fontSize: 16, fontWeight: '900' },
  modalSub: { fontSize: 12, color: Tokens.colors.textMuted, marginBottom: Tokens.spacing.md },
  methodRow: { flexDirection: 'row', gap: Tokens.spacing.xs, marginBottom: Tokens.spacing.md },
  methodChip: { flex: 1, paddingVertical: Tokens.spacing.sm, alignItems: 'center', borderRadius: Tokens.radii.sm, borderWidth: Tokens.borderWidths.flat },
  methodText: { fontSize: 11, fontWeight: '800' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Tokens.spacing.md, borderRadius: Tokens.radii.sm },
  submitBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
});
