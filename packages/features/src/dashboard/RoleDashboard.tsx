import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Card } from '@campus/ui';
import { colors, spacing, typography, layout } from '@campus/design-tokens';
import { getNavigationForRole, DashboardCardConfig } from '@campus/config';
import { en } from '@campus/i18n';

export interface RoleDashboardProps {
  role: string;
  userPermissions?: string[];
  onNavigate: (route: string) => void;
  i18nDict?: typeof en;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({
  role,
  userPermissions = [],
  onNavigate,
  i18nDict = en,
}) => {
  const { width } = useWindowDimensions();
  const isWide = width >= layout.breakpoints.tablet;
  const config = getNavigationForRole(role);

  const visibleCards = config.dashboardCards.filter(
    (card) => !card.permission || userPermissions.includes(card.permission)
  );

  const getTranslatedTitle = (titleKey: string): string => {
    const parts = titleKey.split('.');
    if (parts.length === 2 && parts[0] === 'dashboard') {
      const key = parts[1] as keyof typeof en.dashboard;
      return i18nDict.dashboard[key] || titleKey;
    }
    return titleKey;
  };

  const getTranslatedDesc = (descKey?: string): string | undefined => {
    if (!descKey) return undefined;
    const parts = descKey.split('.');
    if (parts.length === 2 && parts[0] === 'dashboard') {
      const key = parts[1] as keyof typeof en.dashboard;
      return i18nDict.dashboard[key] || descKey;
    }
    return descKey;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>
        {i18nDict.common.welcome}, <Text style={styles.roleText}>{role.toUpperCase()}</Text>
      </Text>
      <View style={[styles.grid, isWide && styles.gridWide]}>
        {visibleCards.map((card) => (
          <TouchableOpacity
            key={card.id}
            activeOpacity={0.85}
            style={[styles.cardWrapper, isWide && styles.cardWrapperWide]}
            onPress={() => onNavigate(card.route)}
            testID={`dashboard-card-${card.id}`}
            accessibilityRole="button"
          >
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>{getTranslatedTitle(card.titleKey)}</Text>
              {card.descriptionKey ? (
                <Text style={styles.cardDesc}>{getTranslatedDesc(card.descriptionKey)}</Text>
              ) : null}
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  heading: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: spacing.lg,
  },
  roleText: { color: colors.primary[600] },
  grid: { gap: spacing.md },
  gridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  cardWrapper: { width: '100%' },
  cardWrapperWide: { width: '48%' },
  card: { padding: spacing.lg },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  cardDesc: { fontSize: typography.fontSize.sm, color: colors.gray[600] },
});
