import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, layout } from '@campus/design-tokens';
import { usePathname, useRouter } from 'expo-router';

interface NavItem {
  label: string;
  route: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', route: '/(dashboard)' },
  { label: 'Onboarding', route: '/(onboarding)/onboarding' },
  { label: 'Status', route: '/(onboarding)/status' },
];

export interface ResponsiveShellProps {
  children: React.ReactNode;
}

export const ResponsiveShell: React.FC<ResponsiveShellProps> = ({ children }) => {
  const { width } = useWindowDimensions();
  const isDesktopOrTablet = width >= 768;
  const router = useRouter();
  const pathname = usePathname();

  if (isDesktopOrTablet) {
    return (
      <View style={styles.desktopContainer}>
        <View style={styles.sideNav}>
          <Text style={styles.brandTitle}>Campus App</Text>
          <View style={styles.navGroup}>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.route);
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.sideNavItem, isActive ? styles.activeNavItem : null]}
                  onPress={() => router.push(item.route as '/(dashboard)')}
                >
                  <Text style={[styles.navText, isActive ? styles.activeNavText : null]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={styles.mainContent}>{children}</View>
      </View>
    );
  }

  return (
    <View style={styles.phoneContainer}>
      <View style={styles.mainContent}>{children}</View>
      <View style={styles.bottomBar}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.route);
          return (
            <TouchableOpacity
              key={item.route}
              style={styles.bottomNavItem}
              onPress={() => router.push(item.route as '/(dashboard)')}
            >
              <Text style={[styles.navText, isActive ? styles.activeNavText : null]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
  },
  phoneContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.gray[50],
  },
  sideNav: {
    width: spacing['3xl'] * 5,
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: colors.gray[200],
    padding: spacing.md,
  },
  brandTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary[600],
    marginBottom: spacing.xl,
  },
  navGroup: {
    gap: spacing.xs,
  },
  sideNavItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.xs,
  },
  bottomBar: {
    flexDirection: 'row',
    minHeight: layout.minTouchTarget,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.touchTarget.minHeight,
  },
  activeNavItem: {
    backgroundColor: colors.primary[50],
  },
  navText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  activeNavText: {
    color: colors.primary[600],
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
  },
});
