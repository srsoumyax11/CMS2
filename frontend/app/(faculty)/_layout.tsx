import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Header } from '../../src/components/Header';
import { Tokens } from '../../src/theme/tokens';

export default function FacultyLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        header: () => <Header currentRole="Faculty" unreadNotificationsCount={2} />,
        contentStyle: {
          backgroundColor: isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Faculty Workspace' }} />
      <Stack.Screen name="attendance-session" options={{ title: 'Live QR Attendance Session' }} />
      <Stack.Screen name="assignments" options={{ title: 'Assignments & Grading' }} />
      <Stack.Screen name="disputes" options={{ title: 'Attendance Disputes' }} />
      <Stack.Screen name="mentees" options={{ title: 'Mentee Progress Tracker' }} />
    </Stack>
  );
}
