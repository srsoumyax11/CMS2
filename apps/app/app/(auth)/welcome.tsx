import React from 'react';
import { useRouter } from 'expo-router';
import { WelcomeScreen } from '@campus/features';

export default function WelcomeRoute() {
  const router = useRouter();

  return (
    <WelcomeScreen
      onNavigateCMS={() => router.push('/(dashboard)')}
      onNavigateLogin={() => router.push('/(auth)/login')}
      onNavigateSignUp={() => router.push('/(auth)/register')}
    />
  );
}
