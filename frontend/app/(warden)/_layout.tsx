import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Header } from '../../src/components/Header';
import { Tokens } from '../../src/theme/tokens';

export default function WardenLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        header: () => <Header currentRole="Warden" unreadNotificationsCount={4} />,
        contentStyle: {
          backgroundColor: isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Warden Console' }} />
      <Stack.Screen name="outpasses" options={{ title: 'Outpass Approvals' }} />
      <Stack.Screen name="sos" options={{ title: 'Emergency SOS Control' }} />
      <Stack.Screen name="rooms" options={{ title: 'Room & Bed Allocator' }} />
      <Stack.Screen name="roll-call" options={{ title: 'Night Roll Call & Visitors' }} />
    </Stack>
  );
}
