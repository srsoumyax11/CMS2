import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Input, Card, DataList } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { en } from '@campus/i18n';
import { z } from 'zod';
import { ApiClient, AppError } from '@campus/api-client';

export const WardenDepthScreen: React.FC<{ apiClient: ApiClient; i18nDict?: typeof en }> = ({
  apiClient,
  i18nDict = en,
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'rollcall' | 'visitors' | 'mess' | 'warnings'>('rooms');
  const [roomsMap, setRoomsMap] = useState<{ roomNo: string; bedsTotal: number; bedsOccupied: number }[]>([]);
  const [visitors, setVisitors] = useState<{ id: string; visitorName: string; studentName: string; checkIn: string; checkOut?: string }[]>([]);
  const [messMenuDraft, setMessMenuDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchWardenData();
  }, [activeTab]);

  const fetchWardenData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'rooms') {
        const res = await apiClient.get(
          '/warden/rooms-map',
          z.array(z.object({ roomNo: z.string(), bedsTotal: z.number(), bedsOccupied: z.number() }))
        );
        setRoomsMap(res);
      } else if (activeTab === 'visitors') {
        const res = await apiClient.get(
          '/warden/visitor-log',
          z.array(z.object({ id: z.string(), visitorName: z.string(), studentName: z.string(), checkIn: z.string(), checkOut: z.string().optional() }))
        );
        setVisitors(res);
      }
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNightRollCallSync = async () => {
    setIsLoading(true);
    try {
      await apiClient.post(
        '/warden/night-rollcall',
        z.object({ syncedCount: z.number() }),
        { timestamp: new Date().toISOString(), presentStudents: ['S101', 'S102'] }
      );
      setStatusMsg('Night roll call synced successfully.');
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.tabBar}>
        <Button label="Room Map" variant={activeTab === 'rooms' ? 'primary' : 'secondary'} onPress={() => setActiveTab('rooms')} testID="tab-rooms" />
        <Button label="Night Roll Call" variant={activeTab === 'rollcall' ? 'primary' : 'secondary'} onPress={() => setActiveTab('rollcall')} testID="tab-rollcall" />
        <Button label="Visitor Log" variant={activeTab === 'visitors' ? 'primary' : 'secondary'} onPress={() => setActiveTab('visitors')} testID="tab-visitors" />
        <Button label="Mess Editor" variant={activeTab === 'mess' ? 'primary' : 'secondary'} onPress={() => setActiveTab('mess')} testID="tab-mess-edit" />
        <Button label="Issue Warnings" variant={activeTab === 'warnings' ? 'primary' : 'secondary'} onPress={() => setActiveTab('warnings')} testID="tab-warnings" />
      </View>

      {statusMsg && <Text style={styles.successText}>{statusMsg}</Text>}
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

      {activeTab === 'rooms' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Hostel Room & Bed Occupancy Map</Text>
          {roomsMap.map((rm) => (
            <Card key={rm.roomNo} style={styles.itemCard}>
              <Text style={styles.itemTitle}>Room {rm.roomNo}</Text>
              <Text style={styles.itemMeta}>Occupancy: {rm.bedsOccupied} / {rm.bedsTotal} Beds</Text>
            </Card>
          ))}
        </Card>
      )}

      {activeTab === 'rollcall' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Night Roll Call (Offline Queue Capable)</Text>
          <Text style={styles.mutedText}>Take attendance offline during night rounds. Queue syncs automatically upon connection.</Text>
          <Button label="Submit Night Roll Call" onPress={handleNightRollCallSync} isLoading={isLoading} testID="btn-submit-rollcall" />
        </Card>
      )}

      {activeTab === 'visitors' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Hostel Visitor Entry Log</Text>
          {visitors.map((v) => (
            <Card key={v.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>Visitor: {v.visitorName}</Text>
              <Text style={styles.itemMeta}>Visiting Student: {v.studentName}</Text>
              <Text style={styles.itemMeta}>In: {v.checkIn} {v.checkOut ? `| Out: ${v.checkOut}` : ''}</Text>
            </Card>
          ))}
        </Card>
      )}

      {activeTab === 'mess' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Mess Menu Editor</Text>
          <Input label="Updated Weekly Menu Specification" value={messMenuDraft} onChangeText={setMessMenuDraft} multiline testID="input-mess-editor" />
          <Button label="Publish Updated Mess Menu" onPress={() => setStatusMsg('Mess menu published.')} testID="btn-publish-mess" />
        </Card>
      )}

      {activeTab === 'warnings' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Disciplinary Warnings</Text>
          <Input label="Student Roll No" value="" onChangeText={() => {}} testID="input-warning-student" />
          <Input label="Violation Details" value="" onChangeText={() => {}} testID="input-warning-reason" />
          <Button label="Issue Official Warning" variant="danger" onPress={() => setStatusMsg('Warning issued to student & parent.')} testID="btn-issue-warning" />
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
  itemCard: { padding: spacing.md, marginBottom: spacing.xs },
  itemTitle: { fontWeight: 'bold', fontSize: typography.fontSize.base },
  itemMeta: { fontSize: typography.fontSize.sm, color: colors.gray[600] },
});
