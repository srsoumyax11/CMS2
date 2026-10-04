import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Input, Card, DataList } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { en } from '@campus/i18n';
import { z } from 'zod';
import { ApiClient, AppError } from '@campus/api-client';

export const ParentDepthScreen: React.FC<{ apiClient: ApiClient; i18nDict?: typeof en }> = ({
  apiClient,
  i18nDict = en,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'results' | 'warnings' | 'scholarships' | 'sos'>('attendance');
  const [attendanceData, setAttendanceData] = useState<{ overallPct: number; totalClasses: number; attendedClasses: number } | null>(null);
  const [examResults, setExamResults] = useState<{ semester: string; gpa: number; status: string }[]>([]);
  const [warnings, setWarnings] = useState<{ id: string; reason: string; date: string; replied: boolean }[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sosAlerts, setSosAlerts] = useState<{ id: string; timestamp: string; location: string; status: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchParentData();
  }, [activeTab]);

  const fetchParentData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'attendance') {
        const res = await apiClient.get(
          '/parent/child-attendance',
          z.object({ overallPct: z.number(), totalClasses: z.number(), attendedClasses: z.number() })
        );
        setAttendanceData(res);
      } else if (activeTab === 'results') {
        const res = await apiClient.get(
          '/parent/child-results',
          z.array(z.object({ semester: z.string(), gpa: z.number(), status: z.string() }))
        );
        setExamResults(res);
      } else if (activeTab === 'warnings') {
        const res = await apiClient.get(
          '/parent/warnings',
          z.array(z.object({ id: z.string(), reason: z.string(), date: z.string(), replied: z.boolean() }))
        );
        setWarnings(res);
      } else if (activeTab === 'sos') {
        const res = await apiClient.get(
          '/parent/sos-live',
          z.array(z.object({ id: z.string(), timestamp: z.string(), location: z.string(), status: z.string() }))
        );
        setSosAlerts(res);
      }
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplyWarning = async (warningId: string) => {
    if (!replyText.trim()) return;
    setIsLoading(true);
    try {
      await apiClient.post(
        `/parent/warnings/${warningId}/reply`,
        z.object({ success: z.boolean() }),
        { replyText }
      );
      setStatusMsg('Reply transmitted to warden.');
      setReplyText('');
      fetchParentData();
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.tabBar}>
        <Button label="Attendance" variant={activeTab === 'attendance' ? 'primary' : 'secondary'} onPress={() => setActiveTab('attendance')} testID="tab-parent-attendance" />
        <Button label="Academic Results" variant={activeTab === 'results' ? 'primary' : 'secondary'} onPress={() => setActiveTab('results')} testID="tab-parent-results" />
        <Button label="Disciplinary Warnings" variant={activeTab === 'warnings' ? 'primary' : 'secondary'} onPress={() => setActiveTab('warnings')} testID="tab-parent-warnings" />
        <Button label="Scholarships" variant={activeTab === 'scholarships' ? 'primary' : 'secondary'} onPress={() => setActiveTab('scholarships')} testID="tab-parent-scholarships" />
        <Button label="SOS Live Feed" variant={activeTab === 'sos' ? 'primary' : 'secondary'} onPress={() => setActiveTab('sos')} testID="tab-parent-sos" />
      </View>

      {statusMsg && <Text style={styles.successText}>{statusMsg}</Text>}
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

      {activeTab === 'attendance' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Ward Attendance Overview</Text>
          {attendanceData ? (
            <View>
              <Text style={styles.bigStat}>{attendanceData.overallPct}%</Text>
              <Text style={styles.itemMeta}>Attended {attendanceData.attendedClasses} out of {attendanceData.totalClasses} classes</Text>
            </View>
          ) : (
            <Text style={styles.mutedText}>No attendance data available.</Text>
          )}
        </Card>
      )}

      {activeTab === 'results' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Semester Grade Sheets</Text>
          {examResults.map((r, idx) => (
            <Card key={idx} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{r.semester}</Text>
              <Text style={styles.itemMeta}>GPA: {r.gpa} | Status: {r.status}</Text>
            </Card>
          ))}
        </Card>
      )}

      {activeTab === 'warnings' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Warnings & Warden Communications</Text>
          {warnings.map((w) => (
            <Card key={w.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>Reason: {w.reason}</Text>
              <Text style={styles.itemMeta}>Date: {w.date}</Text>
              {!w.replied && (
                <View style={styles.replySection}>
                  <Input label="Parent Reply / Explanation" value={replyText} onChangeText={setReplyText} testID={`input-reply-${w.id}`} />
                  <Button label="Send Reply" onPress={() => handleReplyWarning(w.id)} isLoading={isLoading} testID={`btn-reply-${w.id}`} />
                </View>
              )}
            </Card>
          ))}
        </Card>
      )}

      {activeTab === 'scholarships' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Scholarships & Fee Concessions</Text>
          <Text style={styles.mutedText}>Track merit and need-based scholarship applications.</Text>
        </Card>
      )}

      {activeTab === 'sos' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Emergency SOS Live Updates</Text>
          {sosAlerts.map((sos) => (
            <Card key={sos.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>ALERT AT {sos.timestamp}</Text>
              <Text style={styles.itemMeta}>Location: {sos.location}</Text>
              <Text style={styles.itemMeta}>Status: {sos.status}</Text>
            </Card>
          ))}
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
  bigStat: { fontSize: typography.fontSize['4xl'], fontWeight: 'bold', color: colors.primary[600], marginBottom: spacing.xs },
  mutedText: { color: colors.gray[600], marginBottom: spacing.md },
  successText: { color: colors.success.main, marginVertical: spacing.xs },
  errorText: { color: colors.danger.main, marginVertical: spacing.xs },
  itemCard: { padding: spacing.md, marginBottom: spacing.xs },
  itemTitle: { fontWeight: 'bold', fontSize: typography.fontSize.base },
  itemMeta: { fontSize: typography.fontSize.sm, color: colors.gray[600] },
  replySection: { marginTop: spacing.sm },
});
