import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, NoticesFeed, NoticeItem } from '@campus/ui';
import { colors, spacing, typography, radius } from '@campus/design-tokens';
import { useTranslation } from '@campus/i18n';

export interface DashboardCardConfig {
  id: string;
  titleKey: string;
  descKey: string;
  route: string;
  icon: string;
}

const STUDENT_CARD_CONFIGS: DashboardCardConfig[] = [
  {
    id: 'outpass',
    titleKey: 'outpass.apply',
    descKey: 'dashboard.outpassDesc',
    route: '/outpass',
    icon: '🎫',
  },
  {
    id: 'complaints',
    titleKey: 'dashboard.complaintsTitle',
    descKey: 'dashboard.complaintsDesc',
    route: '/complaints',
    icon: '📝',
  },
  {
    id: 'attendance',
    titleKey: 'dashboard.attendanceTitle',
    descKey: 'dashboard.attendanceDesc',
    route: '/attendance',
    icon: '📅',
  },
  {
    id: 'fees',
    titleKey: 'dashboard.feesTitle',
    descKey: 'dashboard.feesDesc',
    route: '/fees',
    icon: '💳',
  },
];

const MOCK_NOTICES: NoticeItem[] = [
  {
    id: 'not_1',
    title: 'Mid-Semester Examination Schedule Published',
    content: 'The official schedule for Autumn 2026 Mid-Sem exams is now available on the portal.',
    category: 'academic',
    createdAt: '2026-10-04 09:00',
  },
  {
    id: 'not_2',
    title: 'Hostel Night Gate Timing Update',
    content: 'Gate closing time strictly updated to 10:00 PM starting this Monday.',
    category: 'hostel',
    createdAt: '2026-10-03 18:30',
  },
];

export interface StudentHomeDashboardScreenProps {
  userName?: string;
  onNavigate?: (route: string) => void;
}

export const StudentHomeDashboardScreen: React.FC<StudentHomeDashboardScreenProps> = ({
  userName = 'Student',
  onNavigate,
}) => {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBanner}>
        <Text style={styles.greeting}>Welcome back, {userName}!</Text>
        <Text style={styles.subtitle}>Campus 360 Student Dashboard</Text>
      </View>

      <Text style={styles.sectionTitle}>Quick Services</Text>
      <View style={styles.cardGrid}>
        {STUDENT_CARD_CONFIGS.map((card) => (
          <TouchableOpacity
            key={card.id}
            activeOpacity={0.8}
            style={styles.gridItem}
            onPress={() => onNavigate?.(card.route)}
            testID={`btn-dash-card-${card.id}`}
          >
            <Card style={styles.actionCard}>
              <Text style={styles.cardIcon}>{card.icon}</Text>
              <Text style={styles.cardTitle}>{t(card.titleKey, card.id)}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {t(card.descKey, 'Manage campus request')}
              </Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Campus Announcements</Text>
      <NoticesFeed notices={MOCK_NOTICES} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md },
  headerBanner: {
    backgroundColor: colors.primary[600],
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  greeting: { fontSize: typography.fontSize.xl, fontWeight: 'bold', color: colors.white },
  subtitle: { fontSize: typography.fontSize.xs, color: colors.primary[100], marginTop: spacing.xs / 2 },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[800], marginVertical: spacing.sm },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  gridItem: { width: '48%' },
  actionCard: { padding: spacing.md, height: 120, justifyContent: 'space-between' },
  cardIcon: { fontSize: typography.fontSize['2xl'] },
  cardTitle: { fontSize: typography.fontSize.sm, fontWeight: 'bold', color: colors.gray[900] },
  cardDesc: { fontSize: typography.fontSize.xs, color: colors.gray[500] },
});
