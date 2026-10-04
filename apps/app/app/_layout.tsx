import React from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthSessionProvider } from '../src/providers/AuthProvider';
import { GlobalErrorBoundary } from '../src/components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AuthSessionProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </AuthSessionProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}
