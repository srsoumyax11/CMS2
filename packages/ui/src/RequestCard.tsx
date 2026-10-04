import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { StatusTimeline, TimelineStep } from './StatusTimeline';
import { colors, spacing, typography, radius } from '@campus/design-tokens';

export interface RequestItemData {
  id: string;
  type: 'outpass' | 'complaint' | 'leave' | 'role_request';
  title: string;
  description?: string;
  status: 'pending' | 'needs_info' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  timeline?: TimelineStep[];
}

export interface RequestCardProps {
  item: RequestItemData;
  onPress?: () => void;
  showTimeline?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({ item, onPress, showTimeline = false }) => {
  const getBadgeStyle = () => {
    switch (item.status) {
      case 'approved':
        return { bg: colors.success.light, text: colors.success.dark };
      case 'rejected':
      case 'cancelled':
        return { bg: colors.danger.light, text: colors.danger.dark };
      case 'needs_info':
        return { bg: colors.warning.light, text: colors.warning.dark };
      case 'pending':
      default:
        return { bg: colors.info.light, text: colors.info.dark };
    }
  };

  const badge = getBadgeStyle();

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={!onPress}>
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.typeText}>{item.type.replace('_', ' ').toUpperCase()}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
        <Text style={styles.timestamp}>{item.createdAt}</Text>

        {showTimeline && item.timeline && item.timeline.length > 0 && (
          <View style={styles.timelineContainer}>
            <StatusTimeline steps={item.timeline} />
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  typeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.gray[500],
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginTop: spacing.xs / 2,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[400],
    marginTop: spacing.xs,
  },
  timelineContainer: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.xs,
  },
});
