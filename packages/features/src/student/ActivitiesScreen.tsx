import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, DataList } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { en } from '@campus/i18n';
import { z } from 'zod';
import { ApiClient, AppError } from '@campus/api-client';

export const ActivitiesScreen: React.FC<{ apiClient: ApiClient; i18nDict?: typeof en }> = ({
  apiClient,
  i18nDict = en,
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'clubs' | 'placements'>('events');
  const [events, setEvents] = useState<{ id: string; title: string; date: string; registered: boolean }[]>([]);
  const [clubs, setClubs] = useState<{ id: string; name: string; category: string; memberCount: number }[]>([]);
  const [placements, setPlacements] = useState<{ id: string; company: string; role: string; ctc: string; applied: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchActivitiesData();
  }, [activeTab]);

  const fetchActivitiesData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'events') {
        const res = await apiClient.get(
          '/activities/events',
          z.array(z.object({ id: z.string(), title: z.string(), date: z.string(), registered: z.boolean() }))
        );
        setEvents(res);
      } else if (activeTab === 'clubs') {
        const res = await apiClient.get(
          '/activities/clubs',
          z.array(z.object({ id: z.string(), name: z.string(), category: z.string(), memberCount: z.number() }))
        );
        setClubs(res);
      } else if (activeTab === 'placements') {
        const res = await apiClient.get(
          '/activities/placements',
          z.array(z.object({ id: z.string(), company: z.string(), role: z.string(), ctc: z.string(), applied: z.boolean() }))
        );
        setPlacements(res);
      }
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const registerForEvent = async (eventId: string) => {
    setIsLoading(true);
    try {
      await apiClient.post(
        `/activities/events/${eventId}/register`,
        z.object({ success: z.boolean() }),
        {}
      );
      fetchActivitiesData();
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyForPlacement = async (driveId: string) => {
    setIsLoading(true);
    try {
      await apiClient.post(
        `/activities/placements/${driveId}/apply`,
        z.object({ success: z.boolean() }),
        {}
      );
      fetchActivitiesData();
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.tabBar}>
        <Button label="Events & Fest" variant={activeTab === 'events' ? 'primary' : 'secondary'} onPress={() => setActiveTab('events')} testID="tab-events" />
        <Button label="Clubs & Teams" variant={activeTab === 'clubs' ? 'primary' : 'secondary'} onPress={() => setActiveTab('clubs')} testID="tab-clubs" />
        <Button label="Placement Drives" variant={activeTab === 'placements' ? 'primary' : 'secondary'} onPress={() => setActiveTab('placements')} testID="tab-placements" />
      </View>

      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

      {activeTab === 'events' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Campus Events & Registrations</Text>
          {events.map((evt) => (
            <Card key={evt.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{evt.title}</Text>
              <Text style={styles.itemMeta}>Date: {evt.date}</Text>
              <Button
                label={evt.registered ? 'Registered ✓' : 'Register Now'}
                variant={evt.registered ? 'secondary' : 'primary'}
                disabled={evt.registered}
                onPress={() => registerForEvent(evt.id)}
                testID={`btn-register-event-${evt.id}`}
              />
            </Card>
          ))}
        </Card>
      )}

      {activeTab === 'clubs' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Student Clubs & Sports Teams</Text>
          {clubs.map((club) => (
            <Card key={club.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{club.name}</Text>
              <Text style={styles.itemMeta}>Category: {club.category}</Text>
              <Text style={styles.itemMeta}>Active Members: {club.memberCount}</Text>
            </Card>
          ))}
        </Card>
      )}

      {activeTab === 'placements' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Placement Drives & Job Openings</Text>
          {placements.map((drive) => (
            <Card key={drive.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{drive.company} - {drive.role}</Text>
              <Text style={styles.itemMeta}>Package: {drive.ctc}</Text>
              <Button
                label={drive.applied ? 'Application Submitted' : 'Apply For Drive'}
                variant={drive.applied ? 'secondary' : 'primary'}
                disabled={drive.applied}
                onPress={() => applyForPlacement(drive.id)}
                testID={`btn-apply-placement-${drive.id}`}
              />
            </Card>
          ))}
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  tabBar: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  card: { padding: spacing.lg },
  title: { fontSize: typography.fontSize.xl, fontWeight: 'bold', color: colors.gray[900], marginBottom: spacing.md },
  errorText: { color: colors.danger.main, marginVertical: spacing.xs },
  itemCard: { padding: spacing.md, marginBottom: spacing.xs },
  itemTitle: { fontWeight: 'bold', fontSize: typography.fontSize.base },
  itemMeta: { fontSize: typography.fontSize.sm, color: colors.gray[600], marginBottom: spacing.xs },
});
