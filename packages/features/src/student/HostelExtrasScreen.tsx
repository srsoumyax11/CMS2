import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Input, Card, DataList } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { en } from '@campus/i18n';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiClient, AppError } from '@campus/api-client';

const claimItemSchema = z.object({
  claimReason: z.string().min(3, 'Reason is required to claim item'),
});

type ClaimItemFormData = z.infer<typeof claimItemSchema>;

export interface LostAndFoundItem {
  id: string;
  title: string;
  category: string;
  foundLocation: string;
  status: 'available' | 'claimed';
  createdAt: string;
}

interface HostelExtrasScreenProps {
  apiClient: ApiClient;
  i18nDict?: typeof en;
}

export const HostelExtrasScreen: React.FC<HostelExtrasScreenProps> = ({
  apiClient,
  i18nDict = en,
}) => {
  const [activeTab, setActiveTab] = useState<'room' | 'mess' | 'lostfound'>('room');
  const [roomData, setRoomData] = useState<{ roomNo: string; block: string; roommates: string[] } | null>(null);
  const [messMenu, setMessMenu] = useState<{ day: string; breakfast: string; lunch: string; dinner: string }[]>([]);
  const [messFeedback, setMessFeedback] = useState('');
  const [lostItems, setLostItems] = useState<LostAndFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClaimItemFormData>({
    resolver: zodResolver(claimItemSchema),
    defaultValues: { claimReason: '' },
  });

  useEffect(() => {
    fetchHostelData();
  }, [activeTab]);

  const fetchHostelData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'room') {
        const res = await apiClient.get(
          '/hostel/my-room',
          z.object({ roomNo: z.string(), block: z.string(), roommates: z.array(z.string()) })
        );
        setRoomData(res);
      } else if (activeTab === 'mess') {
        const res = await apiClient.get(
          '/hostel/mess-menu',
          z.array(z.object({ day: z.string(), breakfast: z.string(), lunch: z.string(), dinner: z.string() }))
        );
        setMessMenu(res);
      } else if (activeTab === 'lostfound') {
        const res = await apiClient.get(
          '/hostel/lost-and-found',
          z.array(
            z.object({
              id: z.string(),
              title: z.string(),
              category: z.string(),
              foundLocation: z.string(),
              status: z.enum(['available', 'claimed']),
              createdAt: z.string(),
            })
          )
        );
        setLostItems(res);
      }
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setErrorMsg(err.message + (err.requestId ? ` (Req ID: ${err.requestId})` : ''));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessFeedbackSubmit = async () => {
    if (!messFeedback.trim()) return;
    setIsLoading(true);
    try {
      await apiClient.post(
        '/hostel/mess-feedback',
        z.object({ success: z.boolean() }),
        { feedback: messFeedback }
      );
      setMessFeedback('');
      fetchHostelData();
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimItem = async (itemId: string, data: ClaimItemFormData) => {
    setIsLoading(true);
    try {
      await apiClient.post(
        `/hostel/lost-and-found/${itemId}/claim`,
        z.object({ success: z.boolean() }),
        data
      );
      reset();
      fetchHostelData();
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.tabBar}>
        <Button
          label="My Room"
          variant={activeTab === 'room' ? 'primary' : 'secondary'}
          onPress={() => setActiveTab('room')}
          testID="tab-room"
        />
        <Button
          label="Mess Menu & Feedback"
          variant={activeTab === 'mess' ? 'primary' : 'secondary'}
          onPress={() => setActiveTab('mess')}
          testID="tab-mess"
        />
        <Button
          label="Lost & Found"
          variant={activeTab === 'lostfound' ? 'primary' : 'secondary'}
          onPress={() => setActiveTab('lostfound')}
          testID="tab-lostfound"
        />
      </View>

      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

      {activeTab === 'room' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Room Details</Text>
          {roomData ? (
            <View>
              <Text style={styles.infoLabel}>Block: {roomData.block}</Text>
              <Text style={styles.infoLabel}>Room Number: {roomData.roomNo}</Text>
              <Text style={styles.subtitle}>Roommates:</Text>
              {roomData.roommates.map((name, idx) => (
                <Text key={idx} style={styles.roommateText}>
                  • {name}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.mutedText}>No room assigned yet.</Text>
          )}
        </Card>
      )}

      {activeTab === 'mess' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Weekly Mess Schedule</Text>
          {messMenu.map((item, idx) => (
            <View key={idx} style={styles.menuRow}>
              <Text style={styles.dayHeader}>{item.day}</Text>
              <Text style={styles.menuText}>Breakfast: {item.breakfast}</Text>
              <Text style={styles.menuText}>Lunch: {item.lunch}</Text>
              <Text style={styles.menuText}>Dinner: {item.dinner}</Text>
            </View>
          ))}

          <Text style={styles.subtitle}>Submit Feedback / Rating</Text>
          <Input
            label="Comments / Issues"
            value={messFeedback}
            onChangeText={setMessFeedback}
            testID="input-mess-feedback"
          />
          <Button
            label="Submit Feedback"
            onPress={handleMessFeedbackSubmit}
            isLoading={isLoading}
            testID="btn-submit-mess-feedback"
          />
        </Card>
      )}

      {activeTab === 'lostfound' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Hostel Lost & Found Board</Text>
          <DataList<LostAndFoundItem>
            data={lostItems}
            isLoading={isLoading}
            onRefresh={fetchHostelData}
            emptyTitle="No Lost Items"
            emptyDescription="There are currently no items listed on the board."
            renderItem={({ item }) => (
              <Card style={styles.itemCard} key={item.id}>
                <Text style={styles.itemTitle}>{item.title} ({item.category})</Text>
                <Text style={styles.itemMeta}>Location Found: {item.foundLocation}</Text>
                <Text style={styles.itemMeta}>Status: {item.status}</Text>
                {item.status === 'available' && (
                  <View style={styles.claimSection}>
                    <Controller
                      control={control}
                      name="claimReason"
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label="Verification Details for Claim"
                          value={value}
                          onChangeText={onChange}
                          error={errors.claimReason?.message}
                          testID={`input-claim-reason-${item.id}`}
                        />
                      )}
                    />
                    <Button
                      label="Claim Item"
                      onPress={handleSubmit((data) => handleClaimItem(item.id, data))}
                      testID={`btn-claim-${item.id}`}
                    />
                  </View>
                )}
              </Card>
            )}
          />
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  tabBar: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  card: { padding: spacing.lg },
  title: { fontSize: typography.fontSize.xl, fontWeight: 'bold', color: colors.gray[900], marginBottom: spacing.md },
  subtitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[800], marginTop: spacing.md, marginBottom: spacing.xs },
  infoLabel: { fontSize: typography.fontSize.base, color: colors.gray[700], marginBottom: spacing.xs },
  roommateText: { fontSize: typography.fontSize.sm, color: colors.gray[600] },
  mutedText: { color: colors.gray[500], fontSize: typography.fontSize.sm },
  errorText: { color: colors.danger.main, marginVertical: spacing.xs },
  menuRow: { borderBottomWidth: 1, borderBottomColor: colors.gray[200], paddingVertical: spacing.sm },
  dayHeader: { fontWeight: 'bold', color: colors.primary[700] },
  menuText: { fontSize: typography.fontSize.sm, color: colors.gray[600] },
  itemCard: { padding: spacing.md, marginBottom: spacing.sm },
  itemTitle: { fontWeight: 'bold', fontSize: typography.fontSize.base },
  itemMeta: { fontSize: typography.fontSize.sm, color: colors.gray[600] },
  claimSection: { marginTop: spacing.sm },
});
