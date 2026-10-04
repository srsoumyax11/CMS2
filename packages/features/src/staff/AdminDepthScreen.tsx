import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Input, Card, DataList } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { en } from '@campus/i18n';
import { z } from 'zod';
import { ApiClient, AppError } from '@campus/api-client';

export const AdminDepthScreen: React.FC<{ apiClient: ApiClient; i18nDict?: typeof en }> = ({
  apiClient,
  i18nDict = en,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'timetable' | 'notices' | 'audit'>('users');
  const [userQuery, setUserQuery] = useState('');
  const [usersList, setUsersList] = useState<{ id: string; name: string; role: string; status: 'active' | 'frozen' }[]>([]);
  const [clashMessage, setClashMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [auditLogs, setAuditLogs] = useState<{ id: string; action: string; actor: string; timestamp: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'users') {
        const res = await apiClient.get(
          `/admin/users?q=${encodeURIComponent(userQuery)}`,
          z.array(z.object({ id: z.string(), name: z.string(), role: z.string(), status: z.enum(['active', 'frozen']) }))
        );
        setUsersList(res);
      } else if (activeTab === 'audit') {
        const res = await apiClient.get(
          '/admin/audit-logs',
          z.array(z.object({ id: z.string(), action: z.string(), actor: z.string(), timestamp: z.string() }))
        );
        setAuditLogs(res);
      }
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const freezeUser = async (userId: string) => {
    setIsLoading(true);
    try {
      await apiClient.post(
        `/admin/users/${userId}/freeze`,
        z.object({ success: z.boolean() }),
        {}
      );
      fetchAdminData();
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const broadcastEmergencyAlert = async () => {
    if (!noticeMessage.trim()) return;
    setIsLoading(true);
    try {
      await apiClient.post(
        '/admin/emergency-alert',
        z.object({ broadcasted: z.boolean() }),
        { alertText: noticeMessage }
      );
      setStatusMsg('EMERGENCY ALERT BROADCASTED CAMPUS-WIDE.');
      setNoticeMessage('');
    } catch (err: unknown) {
      if (err instanceof AppError) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.tabBar}>
        <Button label="Users & Roles" variant={activeTab === 'users' ? 'primary' : 'secondary'} onPress={() => setActiveTab('users')} testID="tab-admin-users" />
        <Button label="Timetable Builder" variant={activeTab === 'timetable' ? 'primary' : 'secondary'} onPress={() => setActiveTab('timetable')} testID="tab-admin-timetable" />
        <Button label="Broadcast Alerts" variant={activeTab === 'notices' ? 'primary' : 'secondary'} onPress={() => setActiveTab('notices')} testID="tab-admin-notices" />
        <Button label="Audit Logs" variant={activeTab === 'audit' ? 'primary' : 'secondary'} onPress={() => setActiveTab('audit')} testID="tab-admin-audit" />
      </View>

      {statusMsg && <Text style={styles.successText}>{statusMsg}</Text>}
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

      {activeTab === 'users' && (
        <Card style={styles.card}>
          <Text style={styles.title}>User Management & Freeze / Force Logout</Text>
          <Input label="Search User by Name / Email / Role" value={userQuery} onChangeText={setUserQuery} testID="input-user-search" />
          <Button label="Search Users" onPress={fetchAdminData} testID="btn-search-users" />
          {usersList.map((u) => (
            <Card key={u.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{u.name} ({u.role})</Text>
              <Text style={styles.itemMeta}>Status: {u.status}</Text>
              <Button label="Freeze Account" variant="danger" onPress={() => freezeUser(u.id)} testID={`btn-freeze-${u.id}`} />
            </Card>
          ))}
        </Card>
      )}

      {activeTab === 'timetable' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Timetable Schedule Builder with Clash Detection</Text>
          {clashMessage && <Text style={styles.errorText}>{clashMessage}</Text>}
          <Button
            label="Simulate Clash Check"
            onPress={() => setClashMessage('CLASH DETECTED: Room 102 double booked at 10:00 AM on Monday.')}
            testID="btn-check-clash"
          />
        </Card>
      )}

      {activeTab === 'notices' && (
        <Card style={styles.card}>
          <Text style={styles.title}>Emergency Broadcast & Push Notification</Text>
          <Input label="Alert Text / Emergency Announcement" value={noticeMessage} onChangeText={setNoticeMessage} multiline testID="input-emergency-text" />
          <Button label="BROADCAST EMERGENCY ALERT" variant="danger" onPress={broadcastEmergencyAlert} isLoading={isLoading} testID="btn-broadcast-emergency" />
        </Card>
      )}

      {activeTab === 'audit' && (
        <Card style={styles.card}>
          <Text style={styles.title}>System Audit Log Viewer</Text>
          {auditLogs.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <Text style={styles.logAction}>{log.action}</Text>
              <Text style={styles.itemMeta}>Actor: {log.actor} | {log.timestamp}</Text>
            </View>
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
  successText: { color: colors.success.main, marginVertical: spacing.xs },
  errorText: { color: colors.danger.main, marginVertical: spacing.xs },
  itemCard: { padding: spacing.md, marginBottom: spacing.xs },
  itemTitle: { fontWeight: 'bold', fontSize: typography.fontSize.base },
  itemMeta: { fontSize: typography.fontSize.sm, color: colors.gray[600] },
  logRow: { paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
  logAction: { fontWeight: 'bold', color: colors.primary[700] },
});
