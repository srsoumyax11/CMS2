import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Input, Card, DataList } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { en } from '@campus/i18n';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiClient, AppError } from '@campus/api-client';

const docRequestSchema = z.object({
  docType: z.string().min(1, 'Document type is required'),
  reason: z.string().min(3, 'Reason is required'),
});

type DocRequestFormData = z.infer<typeof docRequestSchema>;

export interface DocumentItem {
  id: string;
  docType: string;
  reason: string;
  status: 'pending' | 'processing' | 'approved' | 'ready';
  pdfUrl?: string;
  createdAt: string;
}

interface DocumentApplyScreenProps {
  apiClient: ApiClient;
  i18nDict?: typeof en;
}

export const DocumentApplyScreen: React.FC<DocumentApplyScreenProps> = ({
  apiClient,
  i18nDict = en,
}) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocRequestFormData>({
    resolver: zodResolver(docRequestSchema),
    defaultValues: { docType: 'bonafide', reason: '' },
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      const res = await apiClient.get(
        '/student/documents',
        z.array(
          z.object({
            id: z.string(),
            docType: z.string(),
            reason: z.string(),
            status: z.enum(['pending', 'processing', 'approved', 'ready']),
            pdfUrl: z.string().optional(),
            createdAt: z.string(),
          })
        )
      );
      setDocuments(res);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message + (err.requestId ? ` (Req ID: ${err.requestId})` : ''));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitForm = async (data: DocRequestFormData) => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      const idempotencyKey = apiClient.generateIdempotencyKey();
      const res = await apiClient.post(
        '/student/documents',
        z.object({ id: z.string(), docType: z.string(), status: z.string() }),
        data,
        { idempotencyKey }
      );
      reset();
      fetchDocuments();
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Apply for Certificates & Documents</Text>

        {generalError && <Text style={styles.errorText}>{generalError}</Text>}

        <Controller
          control={control}
          name="docType"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Document Type (bonafide, transcript, noc)"
              value={value}
              onChangeText={onChange}
              error={errors.docType?.message}
              testID="input-doc-type"
            />
          )}
        />

        <Controller
          control={control}
          name="reason"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Purpose / Reason"
              value={value}
              onChangeText={onChange}
              error={errors.reason?.message}
              testID="input-doc-reason"
            />
          )}
        />

        <Button
          label="Submit Application"
          onPress={handleSubmit(onSubmitForm)}
          isLoading={isLoading}
          disabled={isLoading}
          testID="btn-submit-doc"
        />

        <Text style={styles.subtitle}>Applied Documents History</Text>

        <DataList<DocumentItem>
          data={documents}
          isLoading={isLoading}
          onRefresh={fetchDocuments}
          emptyTitle="No Document Applications"
          emptyDescription="You have not requested any official certificates yet."
          renderItem={({ item }) => (
            <Card style={styles.itemCard} key={item.id}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemType}>{item.docType.toUpperCase()}</Text>
                <Text style={styles.itemStatus}>{item.status}</Text>
              </View>
              <Text style={styles.itemReason}>Reason: {item.reason}</Text>
              <Text style={styles.itemDate}>{item.createdAt}</Text>

              {item.status === 'ready' && item.pdfUrl && (
                <Button
                  label="Download QR Verified PDF"
                  variant="secondary"
                  onPress={() => {
                    // Triggers PDF preview / download flow
                  }}
                  testID={`btn-download-pdf-${item.id}`}
                />
              )}
            </Card>
          )}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  card: { padding: spacing.lg },
  title: { fontSize: typography.fontSize.xl, fontWeight: 'bold', color: colors.gray[900], marginBottom: spacing.md },
  subtitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[800], marginTop: spacing.lg, marginBottom: spacing.sm },
  errorText: { color: colors.danger.main, marginVertical: spacing.xs },
  itemCard: { padding: spacing.md, marginBottom: spacing.xs },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  itemType: { fontWeight: 'bold', color: colors.primary[600] },
  itemStatus: { fontWeight: 'bold', color: colors.gray[700], textTransform: 'capitalize' },
  itemReason: { fontSize: typography.fontSize.sm, color: colors.gray[600] },
  itemDate: { fontSize: typography.fontSize.xs, color: colors.gray[400], marginVertical: spacing.xs },
});
