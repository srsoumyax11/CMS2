import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Tokens } from '../../src/theme/tokens';

export default function StudentLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? Tokens.colors.bgDark : Tokens.colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '900',
        },
        contentStyle: {
          backgroundColor: isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Student Portal Dashboard' }} />
      <Stack.Screen name="timetable" options={{ title: 'Academic Timetable' }} />
      <Stack.Screen name="attendance" options={{ title: 'Subject Attendance' }} />
      <Stack.Screen name="outpass" options={{ title: 'Digital Outpass Request' }} />
      <Stack.Screen name="fees" options={{ title: 'Fee Invoices & Pay' }} />
      <Stack.Screen name="library" options={{ title: 'Library Catalog' }} />
      <Stack.Screen name="hostel" options={{ title: 'Hostel & Mess Operations' }} />
      <Stack.Screen name="campus" options={{ title: 'Clubs, Events & Placements' }} />
      <Stack.Screen name="id-card" options={{ title: 'Digital Student ID Card' }} />
    </Stack>
  );
}
