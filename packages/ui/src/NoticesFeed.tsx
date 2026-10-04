import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DataList } from './DataList';
import { Card } from './Card';
import { colors, spacing, typography, radius } from '@campus/design-tokens';
import { appConfig } from '@campus/config';

export interface NoticeItem {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
}

export interface NoticesFeedProps {
  notices: NoticeItem[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onMarkRead?: (noticeId: string) => void;
  enablePolling?: boolean;
}

export const NoticesFeed: React.FC<NoticesFeedProps> = ({
  notices,
  isLoading = false,
  error = null,
  onRefresh,
  onMarkRead,
  enablePolling = false,
}) => {
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (enablePolling && onRefresh) {
      interval = setInterval(onRefresh, appConfig.pollingIntervals.noticeFeedMs);
    }
    return () => clearInterval(interval);
  }, [enablePolling, onRefresh]);

  return (
    <DataList<NoticeItem>
      data={notices}
      isLoading={isLoading}
      error={error}
      onRefresh={onRefresh}
      emptyTitle="No Notices Available"
      emptyDescription="There are currently no announcements posted."
      renderItem={({ item }) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.85}
          onPress={() => onMarkRead?.(item.id)}
          testID={`notice-item-${item.id}`}
        >
          <Card style={StyleSheet.flatten([styles.card, !item.isRead ? styles.unreadCard : null])}>
            <View style={styles.headerRow}>
              <View style={styles.categoryChip}>
                <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
              </View>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.content}>{item.content}</Text>
            <Text style={styles.timestamp}>{item.createdAt}</Text>
          </Card>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  card: { padding: spacing.md, marginBottom: spacing.sm },
  unreadCard: { borderLeftWidth: radius.sm, borderLeftColor: colors.primary[600] },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  categoryChip: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs, backgroundColor: colors.gray[200], borderRadius: radius.sm },
  categoryText: { fontSize: typography.fontSize.xs, fontWeight: 'bold', color: colors.gray[700] },
  unreadDot: { width: spacing.xs, height: spacing.xs, borderRadius: radius.full, backgroundColor: colors.primary[600] },
  title: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.gray[900] },
  content: { fontSize: typography.fontSize.sm, color: colors.gray[700], marginVertical: spacing.xs },
  timestamp: { fontSize: typography.fontSize.xs, color: colors.gray[400] },
});
