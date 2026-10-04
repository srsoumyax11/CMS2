import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { RequestStatusScreen } from '@campus/features';
import { ApiClient } from '@campus/api-client';

const apiClient = new ApiClient(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1');

export default function RequestStatusRoute() {
  const params = useLocalSearchParams<{ id?: string }>();
  const requestId = params.id || 'req-demo-101';

  return <RequestStatusScreen apiClient={apiClient} requestId={requestId} />;
}
