import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, DataList } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { en } from '@campus/i18n';
import { z } from 'zod';
import { ApiClient, AppError } from '@campus/api-client';

export interface DeviceItem {
  id: string;
  deviceName: string;
  ipAddress: string;
  lastActive: string;
}

interface SettingsScreenProps {
  apiClient: ApiClient;
  onLogout: () => void;
  onLanguageChange: (lang: 'en' | 'hi' | 'or') => void;
  currentLanguage?: 'en' | 'hi' | 'or';
  i18nDict?: typeof en;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  apiClient,
  onLogout,
  onLanguageChange,
  currentLanguage = 'en',
  i18nDict = en,
}) => {
  const [profile, setProfile] = useState<{ id: string; name: string; email: string } | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [activeRole, setActiveRole] = useState<string>('student');
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileAndRoles();
    fetchDevices();
  }, []);

  const fetchProfileAndRoles = async () => {
    try {
      const rolesRes = await apiClient.get('/me/roles', z.object({ roles: z.array(z.string()), activeRole: z.string().optional() }));
      setUserRoles(rolesRes.roles);
      if (rolesRes.activeRole) setActiveRole(rolesRes.activeRole);

      const profileRes = await apiClient.get('/me', z.object({ id: z.string(), name: z.string(), email: z.string() }));
      setProfile(profileRes);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message + (err.requestId ? ` (Req ID: ${err.requestId})` : ''));
      }
    }
  };

  const fetchDevices = async () => {
    setIsLoadingDevices(true);
    try {
      const devicesRes = await apiClient.get(
        '/auth/devices',
        z.array(z.object({ id: z.string(), deviceName: z.string(), ipAddress: z.string(), lastActive: z.string() }))
      );
      setDevices(devicesRes);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message + (err.requestId ? ` (Req ID: ${err.requestId})` : ''));
      }
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const handleSwitchRole = async (newRole: string) => {
    try {
      await apiClient.post('/me/active-role', z.object({ activeRole: z.string() }), { role: newRole });
      setActiveRole(newRole);
      // Refresh permissions set
      await apiClient.get('/me/permissions', z.object({ permissions: z.array(z.string()) }));
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message);
      }
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      await apiClient.delete(`/auth/devices/${deviceId}`, z.object({ success: z.boolean() }));
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message);
      }
    }
  };

  const handleLogoutAll = async () => {
    try {
      for (const dev of devices) {
        await apiClient.delete(`/auth/devices/${dev.id}`, z.object({ success: z.boolean() }));
      }
      onLogout();
    } catch {
      onLogout();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>{i18nDict.settings.profile}</Text>
        {generalError && <Text style={styles.errorText}>{generalError}</Text>}

        {profile && (
          <View style={styles.profileSection}>
            <Text style={styles.label}>Name: <Text style={styles.val}>{profile.name}</Text></Text>
            <Text style={styles.label}>Email: <Text style={styles.val}>{profile.email}</Text></Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>{i18nDict.settings.activeRole}</Text>
        <View style={styles.roleContainer}>
          {userRoles.map((role) => (
            <Button
              key={role}
              label={role.toUpperCase()}
              variant={activeRole === role ? 'primary' : 'secondary'}
              onPress={() => handleSwitchRole(role)}
              testID={`switch-role-${role}`}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{i18nDict.settings.language}</Text>
        <View style={styles.langContainer}>
          {(['en', 'hi', 'or'] as const).map((lang) => (
            <Button
              key={lang}
              label={lang.toUpperCase()}
              variant={currentLanguage === lang ? 'primary' : 'secondary'}
              onPress={() => onLanguageChange(lang)}
              testID={`lang-btn-${lang}`}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{i18nDict.settings.activeDevices}</Text>
        <View testID="devices-list">
          <DataList<DeviceItem>
            data={devices}
            isLoading={isLoadingDevices}
            onRetry={fetchDevices}
            renderItem={({ item: dev }) => (
              <View style={styles.deviceRow} key={dev.id}>
                <View>
                  <Text style={styles.deviceName}>{dev.deviceName}</Text>
                  <Text style={styles.deviceMeta}>{dev.ipAddress} • {dev.lastActive}</Text>
                </View>
                <Button
                  label={i18nDict.settings.removeDevice}
                  variant="secondary"
                  onPress={() => handleRemoveDevice(dev.id)}
                  testID={`remove-device-${dev.id}`}
                />
              </View>
            )}
            emptyTitle="No active devices found"
          />
        </View>

        <View style={styles.logoutGroup}>
          <Button
            label={i18nDict.settings.logoutAllDevices}
            variant="secondary"
            onPress={handleLogoutAll}
            testID="btn-logout-all"
          />
          <Button
            label={i18nDict.common.logout}
            onPress={onLogout}
            testID="btn-logout"
          />
        </View>
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
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.gray[800],
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  profileSection: { marginVertical: spacing.xs },
  label: { fontSize: typography.fontSize.base, color: colors.gray[600], marginVertical: spacing.xs },
  val: { fontWeight: 'bold', color: colors.gray[900] },
  roleContainer: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  langContainer: { flexDirection: 'row', gap: spacing.xs },
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  deviceName: { fontWeight: 'bold', color: colors.gray[800] },
  deviceMeta: { fontSize: typography.fontSize.xs, color: colors.gray[500] },
  logoutGroup: { marginTop: spacing.lg, gap: spacing.xs },
  errorText: { color: colors.danger.main, marginVertical: spacing.xs },
});
