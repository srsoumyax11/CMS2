import React from 'react';
import { useRouter } from 'expo-router';
import { RegisterScreen } from '@campus/features';
import { ApiClient } from '@campus/api-client';

const apiClient = new ApiClient(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1');

export default function RegisterRoute() {
  const router = useRouter();

  return (
    <RegisterScreen
      apiClient={apiClient}
      onRegistered={() => {
        router.replace('/(auth)/onboarding');
      }}
    />
  );
}
