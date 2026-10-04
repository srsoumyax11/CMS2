import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, DataList } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { en } from '@campus/i18n';
import { z } from 'zod';
import { ApiClient, AppError } from '@campus/api-client';

export interface ParentLinkRequest {
  id: string;
  parentName: string;
  parentEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  visibility: {
    attendance: boolean;
    marks: boolean;
    fees: boolean;
    location: boolean;
  };
}

export const PrivacySettingsScreen: React.FC<{ apiClient: ApiClient; i18nDict?: typeof en }> = ({
  apiClient,
  i18nDict = en,
}) => {
  const [requests, setRequests] = useState<ParentLinkRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.get(
        '/privacy/parent-links',
        z.array(
          z.object({
            id: z.string(),
            parentName: z.string(),
            parentEmail: z.string(),
            status: z.enum(['pending', 'accepted', 'rejected']),
            visibility: z.object({
              attendance: z.boolean(),
              marks: z.boolean(),
              fees: z.boolean(),
              location: z.boolean(),
            }),
          })
        )
      );
      setRequests(res);
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVisibility = async (id: string, key: keyof ParentLinkRequest['visibility'], currentVal: boolean) => {
    setIsLoading(true);
    try {
      await apiClient.post(
        `/privacy/parent-links/${id}/visibility`,
        z.object({ success: z.boolean() }),
        { [key]: !currentVal }
      );
      fetchRequests();
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkParent = async (id: string) => {
    setIsLoading(true);
    try {
      await apiClient.post(
        `/privacy/parent-links/${id}/unlink`,
        z.object({ success: z.boolean() }),
        {}
      );
      fetchRequests();
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Parent Link Requests & Privacy Controls</Text>
        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

        <DataList<ParentLinkRequest>
          data={requests}
          isLoading={isLoading}
          onRefresh={fetchRequests}
          emptyTitle="No Parent Link Requests"
          emptyDescription="You have no pending or active parent linkages."
          renderItem={({ item }) => (
            <Card key={item.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{item.parentName} ({item.parentEmail})</Text>
              <Text style={styles.itemMeta}>Status: {item.status}</Text>

              {item.status === 'accepted' && (
                <View style={styles.visibilitySection}>
                  <Text style={styles.subtitle}>Granular Visibility Permissions:</Text>
                  <Button
                    label={`Attendance: ${item.visibility.attendance ? 'Visible' : 'Hidden'}`}
                    variant="secondary"
                    onPress={() => handleToggleVisibility(item.id, 'attendance', item.visibility.attendance)}
                    testID={`toggle-attendance-${item.id}`}
                  />
                  <Button
                    label={`Marks / Grades: ${item.visibility.marks ? 'Visible' : 'Hidden'}`}
                    variant="secondary"
                    onPress={() => handleToggleVisibility(item.id, 'marks', item.visibility.marks)}
                    testID={`toggle-marks-${item.id}`}
                  />
                  <Button
                    label={`Fee Status: ${item.visibility.fees ? 'Visible' : 'Hidden'}`}
                    variant="secondary"
                    onPress={() => handleToggleVisibility(item.id, 'fees', item.visibility.fees)}
                    testID={`toggle-fees-${item.id}`}
                  />
                  <Button
                    label={`Location Sharing: ${item.visibility.location ? 'Visible' : 'Hidden'}`}
                    variant="secondary"
                    onPress={() => handleToggleVisibility(item.id, 'location', item.visibility.location)}
                    testID={`toggle-location-${item.id}`}
                  />
                  <Button
                    label="Unlink Parent"
                    variant="danger"
                    onPress={() => handleUnlinkParent(item.id)}
                    testID={`btn-unlink-${item.id}`}
                  />
                </View>
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
  subtitle: { fontSize: typography.fontSize.sm, fontWeight: 'bold', color: colors.gray[800], marginVertical: spacing.xs },
  errorText: { color: colors.danger.main, marginVertical: spacing.xs },
  itemCard: { padding: spacing.md, marginBottom: spacing.xs },
  itemTitle: { fontWeight: 'bold', fontSize: typography.fontSize.base },
  itemMeta: { fontSize: typography.fontSize.sm, color: colors.gray[600], marginBottom: spacing.xs },
  visibilitySection: { marginTop: spacing.sm, gap: spacing.xs },
});
