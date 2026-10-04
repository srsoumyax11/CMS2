import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppQueryProvider } from '@/app/providers/QueryClientProvider';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { AppRouter } from '@/app/router';
import '@/styles/tokens.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppQueryProvider>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </AppQueryProvider>
  </React.StrictMode>,
);
