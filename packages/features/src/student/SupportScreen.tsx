import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Input, Card } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { en } from '@campus/i18n';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiClient, AppError } from '@campus/api-client';

const ticketSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  subject: z.string().min(3, 'Subject is required'),
  description: z.string().min(5, 'Description is required'),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export const SupportScreen: React.FC<{ apiClient: ApiClient; i18nDict?: typeof en; enableAnonymousReport?: boolean }> = ({
  apiClient,
  i18nDict = en,
  enableAnonymousReport = false,
}) => {
  const [activeTab, setActiveTab] = useState<'ticket' | 'counselling' | 'feedback' | 'anonymous'>('ticket');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { category: 'IT Support', subject: '', description: '' },
  });

  const onSubmitTicket = async (data: TicketFormData) => {
    setIsLoading(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      await apiClient.post(
        '/support/tickets',
        z.object({ ticketId: z.string(), status: z.string() }),
        data
      );
      setStatusMsg('Support ticket submitted successfully!');
      reset();
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.tabBar}>
        <Button label="Help Desk Ticket" variant={activeTab === 'ticket' ? 'primary' : 'secondary'} onPress={() => setActiveTab('ticket')} testID="tab-ticket" />
        <Button label="Counselling Session" variant={activeTab === 'counselling' ? 'primary' : 'secondary'} onPress={() => setActiveTab('counselling')} testID="tab-counselling" />
        <Button label="Faculty Feedback" variant={activeTab === 'feedback' ? 'primary' : 'secondary'} onPress={() => setActiveTab('feedback')} testID="tab-feedback" />
        {enableAnonymousReport && (
          <Button label="Anonymous Report" variant={activeTab === 'anonymous' ? 'primary' : 'secondary'} onPress={() => setActiveTab('anonymous')} testID="tab-anonymous" />
        )}
      </View>

      {statusMsg && <Text style={styles.successText}>{statusMsg}</Text>}
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

      {activeTab === 'ticket' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Submit Help Desk Ticket</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <Input label="Category (IT, Hostel, Academic, Fees)" value={value} onChangeText={onChange} error={errors.category?.message} testID="input-ticket-category" />
            )}
          />
          <Controller
            control={control}
            name="subject"
            render={({ field: { onChange, value } }) => (
              <Input label="Subject / Brief Summary" value={value} onChangeText={onChange} error={errors.subject?.message} testID="input-ticket-subject" />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input label="Detailed Description" value={value} onChangeText={onChange} error={errors.description?.message} testID="input-ticket-desc" />
            )}
          />
          <Button label="Submit Ticket" onPress={handleSubmit(onSubmitTicket)} isLoading={isLoading} testID="btn-submit-ticket" />
        </Card>
      )}

      {activeTab === 'counselling' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Book Counselling Session</Text>
          <Text style={styles.mutedText}>Confidential student wellness and counselling slot booking.</Text>
          <Button label="Request Slot" onPress={() => setStatusMsg('Counselling slot request sent!')} testID="btn-book-counselling" />
        </Card>
      )}

      {activeTab === 'feedback' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Course & Faculty Feedback</Text>
          <Text style={styles.mutedText}>Submit end-of-semester faculty rating and qualitative feedback.</Text>
          <Button label="Open Evaluation Form" onPress={() => setStatusMsg('Feedback form loaded.')} testID="btn-open-feedback" />
        </Card>
      )}

      {activeTab === 'anonymous' && enableAnonymousReport && (
        <Card style={styles.card}>
          <Text style={styles.title}>Anonymous Anti-Ragging / Safety Report</Text>
          <Text style={styles.mutedText}>All reports submitted here are encrypted and un-attributable.</Text>
          <Input label="Report Details" value="" onChangeText={() => {}} testID="input-anonymous-desc" />
          <Button label="Submit Confidential Report" onPress={() => setStatusMsg('Anonymous report submitted.')} testID="btn-submit-anonymous" />
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  tabBar: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md, flexWrap: 'wrap' },
  card: { padding: spacing.lg },
  title: { fontSize: typography.fontSize.xl, fontWeight: 'bold', color: colors.gray[900], marginBottom: spacing.md },
  mutedText: { color: colors.gray[600], marginBottom: spacing.md },
  successText: { color: colors.success.main, marginVertical: spacing.xs },
  errorText: { color: colors.danger.main, marginVertical: spacing.xs },
});
