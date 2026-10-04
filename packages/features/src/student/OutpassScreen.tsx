import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Card, Button, FormRenderer, FieldConfig, DataList, RequestCard, StatusTimeline, RequestItemData } from '@campus/ui';
import { colors, spacing, typography, radius } from '@campus/design-tokens';
import { useTranslation } from '@campus/i18n';
import { z } from 'zod';

export interface OutpassScreenProps {
  onApplyOutpass?: (payload: { reason: string; destination: string; outTime: string; expectedInTime: string }) => Promise<void>;
  onCancelOutpass?: (id: string) => Promise<void>;
  onCheckInReturn?: (id: string) => Promise<void>;
}

const APPLY_OUTPASS_FIELDS: FieldConfig[] = [
  { name: 'reason', label: 'Reason for Outpass', type: 'text', required: true, placeholder: 'e.g. Family visit' },
  { name: 'destination', label: 'Destination Address', type: 'text', required: true, placeholder: 'e.g. Home city' },
  { name: 'outTime', label: 'Departure Date & Time', type: 'text', required: true, placeholder: 'YYYY-MM-DD HH:mm' },
  { name: 'expectedInTime', label: 'Expected Return Date & Time', type: 'text', required: true, placeholder: 'YYYY-MM-DD HH:mm' },
];

const ApplyOutpassSchema = z.object({
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
  destination: z.string().min(3, 'Destination must be at least 3 characters'),
  outTime: z.string().min(5, 'Departure time required'),
  expectedInTime: z.string().min(5, 'Return time required'),
});

type OutpassFormValues = z.infer<typeof ApplyOutpassSchema>;

const INITIAL_OUTPASSES: RequestItemData[] = [
  {
    id: 'out_101',
    type: 'outpass',
    title: 'Weekend Outpass to Bhubaneswar',
    description: 'Visiting family for festival weekend',
    status: 'pending',
    createdAt: '2026-10-04 08:30',
    timeline: [
      { id: 'st_1', title: 'Submitted', status: 'completed', timestamp: 'Oct 4, 08:30' },
      { id: 'st_2', title: 'Warden Approval', status: 'active', timestamp: 'Pending' },
      { id: 'st_3', title: 'Gate Exit Clearance', status: 'pending' },
    ],
  },
  {
    id: 'out_100',
    type: 'outpass',
    title: 'Local Market Outpass',
    description: 'Purchase course textbooks',
    status: 'approved',
    createdAt: '2026-10-01 14:00',
    timeline: [
      { id: 'st_11', title: 'Submitted', status: 'completed', timestamp: 'Oct 1, 14:00' },
      { id: 'st_12', title: 'Warden Approved', status: 'completed', timestamp: 'Oct 1, 14:15' },
      { id: 'st_13', title: 'Returned & Checked In', status: 'completed', timestamp: 'Oct 1, 18:30' },
    ],
  },
];

export const OutpassScreen: React.FC<OutpassScreenProps> = ({
  onApplyOutpass,
  onCancelOutpass,
  onCheckInReturn,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'list' | 'apply'>('list');
  const [outpasses, setOutpasses] = useState<RequestItemData[]>(INITIAL_OUTPASSES);
  const [selectedOutpass, setSelectedOutpass] = useState<RequestItemData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplySubmit = async (values: OutpassFormValues) => {
    // Check pending outpass rule on client before server call
    const hasPending = outpasses.some((o) => o.status === 'pending');
    if (hasPending) {
      setErrorMessage(
        t('errors.pendingOutpassExists', 'PENDING_OUTPASS_EXISTS: You already have an active pending outpass. Complete or cancel it before applying again.')
      );
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      if (onApplyOutpass) {
        await onApplyOutpass(values);
      }
      const newEntry: RequestItemData = {
        id: `out_${Date.now()}`,
        type: 'outpass',
        title: `Outpass to ${values.destination}`,
        description: values.reason,
        status: 'pending',
        createdAt: new Date().toLocaleString(),
        timeline: [
          { id: 't1', title: 'Submitted', status: 'completed', timestamp: 'Just now' },
          { id: 't2', title: 'Warden Review', status: 'active' },
        ],
      };
      setOutpasses((prev) => [newEntry, ...prev]);
      setActiveTab('list');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit outpass request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelItem = async (id: string) => {
    if (onCancelOutpass) await onCancelOutpass(id);
    setOutpasses((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o))
    );
    setSelectedOutpass(null);
  };

  const handleReturnCheckIn = async (id: string) => {
    if (onCheckInReturn) await onCheckInReturn(id);
    setOutpasses((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'approved' } : o))
    );
    setSelectedOutpass(null);
  };

  return (
    <View style={styles.container}>
      {/* Tab Controls */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'list' && styles.activeTabBtn]}
          onPress={() => setActiveTab('list')}
          testID="tab-outpass-list"
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>My Outpasses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'apply' && styles.activeTabBtn]}
          onPress={() => setActiveTab('apply')}
          testID="tab-outpass-apply"
        >
          <Text style={[styles.tabText, activeTab === 'apply' && styles.activeTabText]}>Apply Outpass</Text>
        </TouchableOpacity>
      </View>

      {errorMessage && (
        <Card style={styles.errorCard} testID="outpass-error-banner">
          <Text style={styles.errorText}>{errorMessage}</Text>
        </Card>
      )}

      {activeTab === 'apply' ? (
        <ScrollView style={styles.formScroll}>
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Outpass Application Form</Text>
            <FormRenderer<OutpassFormValues>
              fields={APPLY_OUTPASS_FIELDS}
              schema={ApplyOutpassSchema}
              onSubmit={handleApplySubmit}
              submitLabel="Submit Outpass Request"
              isLoading={isSubmitting}
            />
          </Card>
        </ScrollView>
      ) : (
        <DataList<RequestItemData>
          data={outpasses}
          emptyTitle="No Outpasses Found"
          emptyDescription="You have not submitted any outpass applications yet."
          renderItem={({ item }) => (
            <RequestCard
              item={item}
              onPress={() => setSelectedOutpass(item)}
              showTimeline={false}
            />
          )}
        />
      )}

      {/* Outpass Detail Modal */}
      {selectedOutpass && (
        <Modal transparent animationType="slide" visible={Boolean(selectedOutpass)}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>{selectedOutpass.title}</Text>
              <Text style={styles.modalSub}>{selectedOutpass.description}</Text>

              <Text style={styles.sectionHeader}>Approval & Clearance Progress</Text>
              {selectedOutpass.timeline && <StatusTimeline steps={selectedOutpass.timeline} />}

              <View style={styles.modalActions}>
                {selectedOutpass.status === 'pending' && (
                  <Button
                    label="Cancel Outpass"
                    variant="danger"
                    onPress={() => handleCancelItem(selectedOutpass.id)}
                    testID="btn-cancel-outpass"
                  />
                )}
                {selectedOutpass.status === 'approved' && (
                  <Button
                    label="Return Check-In"
                    onPress={() => handleReturnCheckIn(selectedOutpass.id)}
                    testID="btn-return-checkin"
                  />
                )}
                <Button
                  label="Close"
                  variant="secondary"
                  onPress={() => setSelectedOutpass(null)}
                />
              </View>
            </Card>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50], padding: spacing.md },
  tabContainer: { flexDirection: 'row', backgroundColor: colors.gray[200], borderRadius: radius.md, marginBottom: spacing.md, padding: 2 },
  tabBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.md },
  activeTabBtn: { backgroundColor: colors.white },
  tabText: { fontSize: typography.fontSize.sm, fontWeight: 'bold', color: colors.gray[600] },
  activeTabText: { color: colors.primary[600] },
  errorCard: { backgroundColor: colors.danger.light, padding: spacing.md, marginBottom: spacing.md },
  errorText: { fontSize: typography.fontSize.xs, fontWeight: 'bold', color: colors.danger.dark },
  formScroll: { flex: 1 },
  formCard: { padding: spacing.lg },
  formTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[900], marginBottom: spacing.md },
  modalOverlay: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'center', padding: spacing.md },
  modalCard: { padding: spacing.lg, maxHeight: '80%' },
  modalTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[900] },
  modalSub: { fontSize: typography.fontSize.sm, color: colors.gray[600], marginVertical: spacing.xs },
  sectionHeader: { fontSize: typography.fontSize.sm, fontWeight: 'bold', color: colors.gray[800], marginTop: spacing.md, marginBottom: spacing.xs },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.xs, marginTop: spacing.lg },
});
