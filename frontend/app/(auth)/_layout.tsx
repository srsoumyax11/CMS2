import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Tokens } from '../../src/theme/tokens';

export default function AuthLayout() {
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
      <Stack.Screen name="login" options={{ title: 'Sign In to Campus7' }} />
      <Stack.Screen name="register" options={{ title: 'Self Signup & Verification' }} />
      <Stack.Screen name="role-selection" options={{ title: 'Role Request & Status' }} />
      <Stack.Screen name="parent-link" options={{ title: 'Parent Student Link' }} />
    </Stack>
  );
}
