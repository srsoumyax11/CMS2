import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Header } from '../../src/components/Header';
import { Tokens } from '../../src/theme/tokens';

export default function ParentLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        header: () => <Header currentRole="Parent" unreadNotificationsCount={1} />,
        contentStyle: {
          backgroundColor: isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Parent Portal' }} />
      <Stack.Screen name="outpass" options={{ title: 'Outpass Consents' }} />
      <Stack.Screen name="fees" options={{ title: 'Child Fee Payments' }} />
      <Stack.Screen name="sos" options={{ title: 'Safety & Emergency Alerts' }} />
    </Stack>
  );
}
