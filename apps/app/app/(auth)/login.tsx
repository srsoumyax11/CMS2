import React from 'react';
import { useRouter } from 'expo-router';
import { LoginScreen } from '@campus/features';
import { ApiClient } from '@campus/api-client';
import { useAuthStore } from '../../src/store/authStore';

const apiClient = new ApiClient(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1');

export default function LoginRoute() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return (
    <LoginScreen
      apiClient={apiClient}
      onLoginSuccess={(tokenData) => {
        setSession({
          user: { id: 'usr-1', userCode: 'STU101', fullName: 'Campus User' },
          accountStatus: 'active',
          activeRole: 'student',
          permissions: ['read:profile'],
        });
        if (tokenData.accessToken) {
          apiClient.getTokenStore().setAccessToken(tokenData.accessToken);
        }
        router.replace('/(dashboard)');
      }}
    />
  );
}
