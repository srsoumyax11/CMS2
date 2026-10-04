import React from 'react';
import { useRouter } from 'expo-router';
import { SettingsScreen } from '@campus/features';
import { ApiClient } from '@campus/api-client';
import { useAuthStore } from '../../src/store/authStore';

const apiClient = new ApiClient(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1');

export default function SettingsRoute() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

  return (
    <SettingsScreen
      apiClient={apiClient}
      onLogout={() => {
        clearSession();
        router.replace('/(auth)/login');
      }}
      onLanguageChange={() => {
        // Language updated in i18n
      }}
    />
  );
}
