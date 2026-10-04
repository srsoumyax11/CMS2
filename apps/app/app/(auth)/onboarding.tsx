import React from 'react';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@campus/features';
import { ApiClient } from '@campus/api-client';

const apiClient = new ApiClient(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1');

export default function OnboardingRoute() {
  const router = useRouter();

  return (
    <OnboardingScreen
      apiClient={apiClient}
      onRequestSubmitted={(reqId) => {
        router.push({ pathname: '/(auth)/status', params: { id: reqId } });
      }}
    />
  );
}
