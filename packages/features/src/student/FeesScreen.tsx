import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Card, Button, Input, FormRenderer, FieldConfig, DataList } from '@campus/ui';
import { colors, spacing, typography, radius } from '@campus/design-tokens';
import { useTranslation } from '@campus/i18n';
import { z } from 'zod';

export interface FeeItem {
  id: string;
  title: string;
  category: 'tuition' | 'hostel' | 'mess' | 'exam' | 'library';
  amount: number;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'pending' | 'failed';
  receiptNumber?: string;
}

export interface RefundRequest {
  id: string;
  feeTitle: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface FeesScreenProps {
  studentName?: string;
  studentRoll?: string;
  fees?: FeeItem[];
  refunds?: RefundRequest[];
  onPayFee?: (payload: { feeId: string; amount: number; idempotencyKey: string }) => Promise<{ success: boolean; status: 'paid' | 'pending' | 'failed' }>;
  onRequestRefund?: (payload: { feeTitle: string; amount: number; reason: string }) => Promise<void>;
}

const DEFAULT_FEES: FeeItem[] = [
  { id: 'fee_1', title: 'Autumn 2026 Tuition Fee (Semester V)', category: 'tuition', amount: 45000, dueDate: '2026-10-15', status: 'unpaid' },
  { id: 'fee_2', title: 'Hostel Accommodation Block B', category: 'hostel', amount: 18000, dueDate: '2026-10-15', status: 'unpaid' },
  { id: 'fee_3', title: 'Mess Charges Oct 2026', category: 'mess', amount: 4200, dueDate: '2026-10-05', status: 'paid', receiptNumber: 'REC-2026-9041' },
];

const DEFAULT_REFUNDS: RefundRequest[] = [
  { id: 'ref_1', feeTitle: 'Library Caution Deposit Overpayment', amount: 2000, reason: 'Duplicate payment via gateway', status: 'approved', submittedAt: '2026-09-20' },
];

const REFUND_SCHEMA_FIELDS: FieldConfig[] = [
  { name: 'feeTitle', label: 'Fee / Payment Component Title', type: 'text', required: true, placeholder: 'e.g. Excess Tuition Fee' },
  { name: 'amount', label: 'Refund Claim Amount (₹)', type: 'text', required: true, placeholder: 'e.g. 5000' },
  { name: 'reason', label: 'Reason for Refund Claim', type: 'textarea', required: true, placeholder: 'Explain reason...' },
];

const RefundSchema = z.object({
  feeTitle: z.string().min(3, 'Title required'),
  amount: z.string().min(1, 'Amount required'),
  reason: z.string().min(5, 'Reason required'),
});

type RefundFormValues = z.infer<typeof RefundSchema>;

export const FeesScreen: React.FC<FeesScreenProps> = ({
  studentName = 'John Doe',
  studentRoll = 'CS-2024-042',
  fees = DEFAULT_FEES,
  refunds = DEFAULT_REFUNDS,
  onPayFee,
  onRequestRefund,
}) => {
  const { t } = useTranslation();
  const [feeList, setFeeList] = useState<FeeItem[]>(fees);
  const [refundList, setRefundList] = useState<RefundRequest[]>(refunds);
  const [selectedFee, setSelectedFee] = useState<FeeItem | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);

  const handleConfirmPayment = async () => {
    if (!selectedFee || isProcessingPayment) return; // double submit block
    setIsProcessingPayment(true);
    setPaymentNotice('Initiating secure payment gateway...');

    const idempotencyKey = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    try {
      let result: { success: boolean; status: 'paid' | 'pending' | 'failed' } = { success: true, status: 'paid' };
      if (onPayFee) {
        result = await onPayFee({ feeId: selectedFee.id, amount: selectedFee.amount, idempotencyKey });
      }

      setFeeList((prev) =>
        prev.map((f) =>
          f.id === selectedFee.id
            ? { ...f, status: result.status, receiptNumber: `REC-${Date.now().toString().slice(-6)}` }
            : f
        )
      );

      if (result.status === 'paid') {
        setPaymentNotice(`Payment successful! Receipt generated for ₹${selectedFee.amount}.`);
      } else if (result.status === 'pending') {
        setPaymentNotice('Payment status pending confirmation from bank portal.');
      } else {
        setPaymentNotice('Payment failed. Please retry.');
      }
      setSelectedFee(null);
    } catch {
      setPaymentNotice('Payment transaction failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleRefundSubmit = async (values: RefundFormValues) => {
    const amt = parseFloat(values.amount) || 0;
    if (onRequestRefund) {
      await onRequestRefund({ feeTitle: values.feeTitle, amount: amt, reason: values.reason });
    }

    const newRef: RefundRequest = {
      id: `ref_${Date.now()}`,
      feeTitle: values.feeTitle,
      amount: amt,
      reason: values.reason,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
    };

    setRefundList((prev) => [newRef, ...prev]);
    setShowRefundModal(false);
  };

  const unpaidTotal = feeList
    .filter((f) => f.status === 'unpaid')
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Total Dues Summary Banner */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Outstanding Fee Dues</Text>
        <Text style={styles.summaryAmount}>₹{unpaidTotal.toLocaleString('en-IN')}</Text>
        <Text style={styles.summarySub}>Student: {studentName} ({studentRoll})</Text>
      </Card>

      {paymentNotice && (
        <Card style={styles.noticeCard} testID="fee-payment-notice">
          <Text style={styles.noticeText}>{paymentNotice}</Text>
        </Card>
      )}

      {/* Fee Items Breakup */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Fee Breakdown & Due Dates</Text>
        <Button
          label="Claim Refund"
          variant="secondary"
          onPress={() => setShowRefundModal(true)}
          testID="btn-open-claim-refund"
        />
      </View>

      {feeList.map((fee) => (
        <Card key={fee.id} style={styles.feeCard}>
          <View style={styles.feeRow}>
            <View style={styles.feeInfo}>
              <Text style={styles.feeCategory}>{fee.category.toUpperCase()}</Text>
              <Text style={styles.feeTitle}>{fee.title}</Text>
              <Text style={styles.feeDue}>Due Date: {fee.dueDate}</Text>
              {fee.receiptNumber && <Text style={styles.receiptText}>Receipt: {fee.receiptNumber}</Text>}
            </View>
            <View style={styles.amountCol}>
              <Text style={styles.amountText}>₹{fee.amount.toLocaleString('en-IN')}</Text>
              {fee.status === 'unpaid' ? (
                <Button
                  label="Pay Now"
                  onPress={() => setSelectedFee(fee)}
                  testID={`btn-pay-${fee.id}`}
                />
              ) : (
                <View style={styles.paidBadge}>
                  <Text style={styles.paidText}>{fee.status.toUpperCase()}</Text>
                </View>
              )}
            </View>
          </View>
        </Card>
      ))}

      {/* Refund Tracker */}
      <Text style={styles.sectionTitle}>Refund Tracker</Text>
      {refundList.length === 0 ? (
        <Text style={styles.emptyText}>No refund applications submitted.</Text>
      ) : (
        refundList.map((ref) => (
          <Card key={ref.id} style={styles.refundCard}>
            <View style={styles.feeRow}>
              <View>
                <Text style={styles.feeTitle}>{ref.feeTitle}</Text>
                <Text style={styles.feeDue}>Submitted: {ref.submittedAt} | Reason: {ref.reason}</Text>
              </View>
              <View style={styles.amountCol}>
                <Text style={styles.amountText}>₹{ref.amount.toLocaleString('en-IN')}</Text>
                <View style={[styles.paidBadge, ref.status === 'approved' ? styles.bgSuccess : styles.bgWarning]}>
                  <Text style={styles.paidText}>{ref.status.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </Card>
        ))
      )}

      {/* Payment Confirmation Modal */}
      {selectedFee && (
        <Modal transparent animationType="slide" visible={Boolean(selectedFee)}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Confirm Fee Payment</Text>
              <View style={styles.confirmBox}>
                <Text style={styles.confirmLine}>
                  <Text style={styles.bold}>Student Name:</Text> {studentName}
                </Text>
                <Text style={styles.confirmLine}>
                  <Text style={styles.bold}>Roll Number:</Text> {studentRoll}
                </Text>
                <Text style={styles.confirmLine}>
                  <Text style={styles.bold}>Payment For:</Text> {selectedFee.title}
                </Text>
                <Text style={styles.confirmAmount}>
                  Total Payable: ₹{selectedFee.amount.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.modalActions}>
                <Button
                  label="Cancel"
                  variant="secondary"
                  onPress={() => setSelectedFee(null)}
                  disabled={isProcessingPayment}
                />
                <Button
                  label="Proceed to Pay"
                  onPress={handleConfirmPayment}
                  isLoading={isProcessingPayment}
                  disabled={isProcessingPayment}
                  testID="btn-confirm-fee-pay"
                />
              </View>
            </Card>
          </View>
        </Modal>
      )}

      {/* Refund Claim Modal */}
      {showRefundModal && (
        <Modal transparent animationType="slide" visible={showRefundModal}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Submit Refund Claim</Text>
              <FormRenderer<RefundFormValues>
                fields={REFUND_SCHEMA_FIELDS}
                schema={RefundSchema}
                onSubmit={handleRefundSubmit}
                submitLabel="Submit Refund Claim"
              />
              <Button label="Cancel" variant="secondary" onPress={() => setShowRefundModal(false)} />
            </Card>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md },
  summaryCard: { backgroundColor: colors.primary[600], padding: spacing.lg, marginBottom: spacing.md },
  summaryLabel: { fontSize: typography.fontSize.xs, color: colors.primary[200], fontWeight: 'bold' },
  summaryAmount: { fontSize: typography.fontSize['3xl'], fontWeight: 'bold', color: colors.white, marginVertical: spacing.xs / 2 },
  summarySub: { fontSize: typography.fontSize.xs, color: colors.primary[100] },
  noticeCard: { backgroundColor: colors.info.light, padding: spacing.md, marginBottom: spacing.md },
  noticeText: { fontSize: typography.fontSize.xs, color: colors.info.dark, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: spacing.sm },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[800] },
  feeCard: { padding: spacing.md, marginBottom: spacing.sm },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feeInfo: { flex: 1, marginRight: spacing.sm },
  feeCategory: { fontSize: 10, fontWeight: 'bold', color: colors.primary[600] },
  feeTitle: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.gray[900] },
  feeDue: { fontSize: typography.fontSize.xs, color: colors.gray[500], marginTop: 2 },
  receiptText: { fontSize: typography.fontSize.xs, fontWeight: 'bold', color: colors.success.dark, marginTop: 2 },
  amountCol: { alignItems: 'flex-end', gap: spacing.xs },
  amountText: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.gray[900] },
  paidBadge: { backgroundColor: colors.gray[200], paddingHorizontal: spacing.sm, paddingVertical: spacing.xs / 2, borderRadius: radius.full },
  paidText: { fontSize: typography.fontSize.xs, fontWeight: 'bold', color: colors.gray[700] },
  bgSuccess: { backgroundColor: colors.success.light },
  bgWarning: { backgroundColor: colors.warning.light },
  refundCard: { padding: spacing.md, marginBottom: spacing.sm },
  emptyText: { fontSize: typography.fontSize.xs, color: colors.gray[400], fontStyle: 'italic', marginBottom: spacing.md },
  modalOverlay: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'center', padding: spacing.md },
  modalCard: { padding: spacing.lg, gap: spacing.sm },
  modalTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[900] },
  confirmBox: { backgroundColor: colors.gray[100], padding: spacing.md, borderRadius: radius.md, marginVertical: spacing.xs },
  confirmLine: { fontSize: typography.fontSize.sm, color: colors.gray[800], marginVertical: 2 },
  bold: { fontWeight: 'bold' },
  confirmAmount: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.primary[600], marginTop: spacing.xs },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.xs, marginTop: spacing.md },
});
