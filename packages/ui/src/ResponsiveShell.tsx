import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { colors, spacing, typography, layout, radius } from '@campus/design-tokens';
import { NavItemConfig } from '@campus/config';

export interface ResponsiveShellProps {
  navItems: NavItemConfig[];
  currentRoute: string;
  onNavigate: (route: string) => void;
  userPermissions?: string[];
  children: React.ReactNode;
}

export const ResponsiveShell: React.FC<ResponsiveShellProps> = ({
  navItems,
  currentRoute,
  onNavigate,
  userPermissions = [],
  children,
}) => {
  const { width } = useWindowDimensions();
  const isWide = width >= layout.breakpoints.tablet;

  const visibleItems = navItems.filter(
    (item) => !item.permission || userPermissions.includes(item.permission)
  );

  if (isWide) {
    return (
      <View style={styles.wideContainer}>
        <View style={styles.sideNav}>
          <Text style={styles.brandTitle}>CAMPUS</Text>
          <View style={styles.navList}>
            {visibleItems.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.sideNavItem, isActive && styles.sideNavItemActive]}
                  onPress={() => onNavigate(item.route)}
                  testID={`nav-item-${item.id}`}
                  accessibilityRole="button"
                >
                  <Text style={[styles.sideNavText, isActive && styles.sideNavTextActive]}>
                    {item.labelKey}
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
    <View style={styles.mobileContainer}>
      <View style={styles.mainContent}>{children}</View>
      <View style={styles.bottomBar}>
        {visibleItems.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.bottomNavItem}
              onPress={() => onNavigate(item.route)}
              testID={`nav-item-${item.id}`}
              accessibilityRole="button"
            >
              <Text style={[styles.bottomNavText, isActive && styles.bottomNavTextActive]}>
                {item.labelKey}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wideContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
  },
  sideNav: {
    width: layout.sidebarWidth,
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: colors.gray[200],
    padding: spacing.md,
  },
  brandTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.primary[600],
    marginBottom: spacing.lg,
  },
  navList: {
    gap: spacing.xs,
  },
  sideNavItem: {
    minHeight: layout.touchTarget.minHeight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    justifyContent: 'center',
  },
  sideNavItemActive: {
    backgroundColor: colors.primary[50],
  },
  sideNavText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
  },
  sideNavTextActive: {
    color: colors.primary[600],
    fontWeight: 'bold',
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  mainContent: {
    flex: 1,
  },
  bottomBar: {
    minHeight: layout.touchTarget.minHeight + 8,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    minHeight: layout.touchTarget.minHeight,
  },
  bottomNavText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
  bottomNavTextActive: {
    color: colors.primary[600],
    fontWeight: 'bold',
  },
});
