import React from 'react';
import { env } from '@/config/env';
import { AlertTriangle } from 'lucide-react';

export const MockBanner: React.FC = () => {
  if (!env.VITE_USE_MOCKS) return null;

  return (
    <div className="w-full bg-amber-500 text-slate-950 px-4 py-1.5 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-sm z-50">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>DEV MOCK MODE ACTIVE (VITE_USE_MOCKS=true) — UI is rendering mock data for unintegrated endpoints.</span>
    </div>
  );
};
