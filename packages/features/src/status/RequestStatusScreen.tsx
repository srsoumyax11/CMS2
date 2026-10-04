import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Input, Card, StatusTimeline, TimelineStep } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { en } from '@campus/i18n';
import { z } from 'zod';
import { ApiClient, AppError } from '@campus/api-client';

export type RequestStatusState = 'pending' | 'needs_info' | 'approved' | 'rejected' | 'cancelled';

interface RequestStatusScreenProps {
  apiClient: ApiClient;
  requestId: string;
  onStatusChange?: (newStatus: RequestStatusState) => void;
  i18nDict?: typeof en;
}

export const RequestStatusScreen: React.FC<RequestStatusScreenProps> = ({
  apiClient,
  requestId,
  onStatusChange,
  i18nDict = en,
}) => {
  const [status, setStatus] = useState<RequestStatusState>('pending');
  const [rejectReason, setRejectReason] = useState<string | null>(null);
  const [additionalAnswer, setAdditionalAnswer] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);

  const fetchRequestDetails = async () => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      const res = await apiClient.get(
        `/role-requests/${requestId}`,
        z.object({
          status: z.string(),
          reviewerNotes: z.string().optional(),
          rejectReason: z.string().optional(),
        })
      );
      const fetchedStatus = res.status as RequestStatusState;
      setStatus(fetchedStatus);
      if (res.rejectReason || res.reviewerNotes) {
        setRejectReason(res.rejectReason || res.reviewerNotes || null);
      }
      onStatusChange?.(fetchedStatus);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message + (err.requestId ? ` (Req ID: ${err.requestId})` : ''));
      } else {
        setGeneralError(i18nDict.common.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondNeedsInfo = async () => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      const idempotencyKey = apiClient.generateIdempotencyKey();
      await apiClient.put(
        `/role-requests/${requestId}`,
        z.object({ status: z.string() }),
        { answer: additionalAnswer, evidenceUrl },
        { idempotencyKey }
      );
      setStatus('pending');
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message + (err.requestId ? ` (Req ID: ${err.requestId})` : ''));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      const idempotencyKey = apiClient.generateIdempotencyKey();
      await apiClient.post(
        `/role-requests/${requestId}/cancel`,
        z.object({ status: z.string() }),
        {},
        { idempotencyKey }
      );
      setStatus('cancelled');
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message + (err.requestId ? ` (Req ID: ${err.requestId})` : ''));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getTimelineSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      { id: 'submitted', title: 'Submitted', status: 'completed' },
      {
        id: 'review',
        title: 'Reviewer Processing',
        status: status === 'pending' ? 'active' : status === 'needs_info' ? 'pending' : status === 'cancelled' ? 'rejected' : 'completed',
        description: status === 'needs_info' ? i18nDict.status.needsInfo : undefined,
      },
      {
        id: 'decision',
        title: status === 'rejected' ? i18nDict.status.rejected : status === 'approved' ? i18nDict.status.approved : 'Final Decision',
        status: status === 'approved' ? 'completed' : status === 'rejected' ? 'rejected' : 'pending',
        description: rejectReason ? i18nDict.status.auditReason.replace('{{reason}}', rejectReason) : undefined,
      },
    ];
    return steps;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Request #{requestId}</Text>

        {generalError && (
          <Text style={styles.errorText} testID="request-status-error">
            {generalError}
          </Text>
        )}

        <View testID="status-timeline">
          <StatusTimeline steps={getTimelineSteps()} />
        </View>

        {status === 'needs_info' && (
          <View style={styles.needsInfoContainer} testID="needs-info-panel">
            <Text style={styles.sectionHeading}>{i18nDict.status.reuploadEvidence}</Text>
            <Input
              label="Additional Information / Answer"
              value={additionalAnswer}
              onChangeText={setAdditionalAnswer}
              testID="input-needs-info-answer"
            />
            <Button
              label="Upload Corrected Document"
              onPress={() => setEvidenceUrl('https://storage.campus.edu/evidence/fixed.pdf')}
              variant="secondary"
              testID="btn-upload-fixed-doc"
            />
            {evidenceUrl && <Text style={styles.uploadedNotice}>Document Attached ✓</Text>}
            <Button
              label={i18nDict.common.submit}
              onPress={handleRespondNeedsInfo}
              isLoading={isLoading}
              disabled={isLoading || !additionalAnswer}
              testID="btn-submit-needs-info"
            />
          </View>
        )}

        {status === 'pending' && (
          <Button
            label={i18nDict.common.cancel}
            onPress={handleCancelRequest}
            variant="secondary"
            isLoading={isLoading}
            disabled={isLoading}
            testID="btn-cancel-request"
          />
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  card: { padding: spacing.lg },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  errorText: { color: colors.danger.main, marginVertical: spacing.xs },
  needsInfoContainer: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  sectionHeading: { fontSize: typography.fontSize.lg, color: colors.gray[800], marginBottom: spacing.xs },
  uploadedNotice: { color: colors.success.main, fontSize: typography.fontSize.xs, marginVertical: spacing.xs },
});
