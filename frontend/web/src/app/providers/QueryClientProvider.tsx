import React from 'react';
import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const AppQueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <TanStackQueryClientProvider client={queryClient}>{children}</TanStackQueryClientProvider>;
};
