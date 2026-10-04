import React from 'react';
import { Slot } from 'expo-router';
import { ResponsiveShell } from '../../src/components/ResponsiveShell';

export default function DashboardLayout() {
  return (
    <ResponsiveShell>
      <Slot />
    </ResponsiveShell>
  );
}
