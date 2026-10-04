import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useRouter, useSegments } from 'expo-router';
import { colors, spacing, typography } from '@campus/design-tokens';
import { ApiClient } from '@campus/api-client';
import { createPlatformTokenStore } from '../tokenStore/secureTokenStore';

import { SCREEN_PERMISSIONS, hasPermission } from '@campus/config';

export const globalApiClient = new ApiClient(
  'http://localhost:3000/api/v1',
  createPlatformTokenStore()
);

export function useProtectedRoute() {
  const { isAuthenticated, accountStatus, permissions, isRestoringSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isRestoringSession) return;

    const isRootIndex = !segments[0] || segments[0] === 'index' || segments[0] === '';
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inBlockedGroup = segments[0] === '(blocked)';
    const inDashboardGroup = segments[0] === '(dashboard)';

    if (!isAuthenticated) {
      if (!inAuthGroup && !isRootIndex) {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (accountStatus === 'frozen') {
      if (!inBlockedGroup) {
        router.replace('/(blocked)/frozen');
      }
      return;
    }

    if (
      accountStatus === 'registered' ||
      accountStatus === 'pending_approval' ||
      accountStatus === 'rejected'
    ) {
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)/onboarding');
      }
      return;
    }

    if (accountStatus === 'active') {
      const targetScreen = segments[segments.length - 1];
      const requiredPerm = SCREEN_PERMISSIONS[targetScreen];
      if (requiredPerm && !hasPermission(permissions, requiredPerm)) {
        router.replace('/(blocked)/unauthorized');
        return;
      }

      if (!inDashboardGroup && (inAuthGroup || inOnboardingGroup || inBlockedGroup)) {
        router.replace('/(dashboard)');
      }
    }
  }, [isAuthenticated, accountStatus, permissions, isRestoringSession, segments, router]);
}

export const AuthSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isRestoringSession, setRestoringSession, clearSession } = useAuthStore();

  useEffect(() => {
    async function restore() {
      try {
        const token = await globalApiClient.silentRestoreSession();
        if (token) {
          await useAuthStore.getState().fetchPermissions(globalApiClient);
          if (!useAuthStore.getState().isAuthenticated) {
            useAuthStore.setState({
              isAuthenticated: true,
              accountStatus: useAuthStore.getState().accountStatus || 'active',
            });
          }
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      } finally {
        setRestoringSession(false);
      }
    }

    restore();
  }, []);

  useProtectedRoute();

  if (isRestoringSession) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.splashText}>Restoring session...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  splashText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
  },
});
