import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Header } from '../../src/components/Header';
import { Tokens } from '../../src/theme/tokens';

export default function AdminLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        header: () => <Header currentRole="Administrator" unreadNotificationsCount={5} />,
        contentStyle: {
          backgroundColor: isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight,
        },
      }}
    >
      <Stack.Screen name="users" options={{ title: 'User Governance' }} />
      <Stack.Screen name="role-approvals" options={{ title: 'Role Approval Queue' }} />
      <Stack.Screen name="academic" options={{ title: 'Academic & Location Hierarchy' }} />
      <Stack.Screen name="audit" options={{ title: 'System Compliance & Audit Logs' }} />
    </Stack>
  );
}
