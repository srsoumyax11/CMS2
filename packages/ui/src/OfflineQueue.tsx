import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing, typography, radius } from '@campus/design-tokens';
import type { QueuedAction } from '@campus/api-client';

export interface OfflineQueueProps {
  queue?: QueuedAction[];
  onSyncNow?: () => Promise<void>;
  onRetryItem?: (id: string) => Promise<void>;
}

export const OfflineQueue: React.FC<OfflineQueueProps> = ({
  queue = [],
  onSyncNow,
  onRetryItem,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const pendingOrFailed = queue.filter((q) => q.status === 'pending' || q.status === 'failed');

  if (pendingOrFailed.length === 0) return null;

  const handleSync = async () => {
    if (!onSyncNow || isSyncing) return;
    setIsSyncing(true);
    try {
      await onSyncNow();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRetrySingle = async (id: string) => {
    if (!onRetryItem || retryingId) return;
    setRetryingId(id);
    try {
      await onRetryItem(id);
    } finally {
      setRetryingId(null);
    }
  };

  const failedCount = pendingOrFailed.filter((q) => q.status === 'failed').length;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setExpanded(!expanded)}
        style={styles.badgeContainer}
        testID="offline-queue-badge"
      >
        <View style={[styles.badgeDot, failedCount > 0 && styles.badgeDotFailed]} />
        <Text style={styles.badgeText}>
          {isSyncing
            ? `Syncing (${pendingOrFailed.length})...`
            : `${pendingOrFailed.length} Offline Action${pendingOrFailed.length > 1 ? 's' : ''} (${failedCount} failed)`}
        </Text>
        <TouchableOpacity
          onPress={handleSync}
          disabled={isSyncing}
          style={styles.syncBtn}
          testID="btn-offline-sync-all"
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color={colors.warning.dark} />
          ) : (
            <Text style={styles.syncBtnText}>Sync All</Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.itemList} testID="offline-queue-expanded-list">
          {pendingOrFailed.map((item) => (
            <View key={item.id} style={styles.itemRow} testID={`queue-item-${item.id}`}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemType}>{item.type.toUpperCase()}</Text>
                <Text style={styles.itemMeta} numberOfLines={1}>
                  ID: {item.idempotencyKey.slice(0, 14)}... | Status: {item.status}
                </Text>
                {item.error && <Text style={styles.itemError}>{item.error}</Text>}
              </View>

              {item.status === 'failed' && onRetryItem && (
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => handleRetrySingle(item.id)}
                  disabled={retryingId === item.id}
                  testID={`btn-retry-${item.id}`}
                >
                  {retryingId === item.id ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.retryBtnText}>Retry</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginVertical: spacing.xs,
    width: '90%',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.warning.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeDot: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.warning.dark,
    marginRight: spacing.xs,
  },
  badgeDotFailed: {
    backgroundColor: colors.danger.main,
  },
  badgeText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.warning.dark,
  },
  syncBtn: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  syncBtnText: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.warning.dark,
  },
  itemList: {
    marginTop: spacing.xs,
    backgroundColor: colors.gray[100],
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.xs,
  },
  itemType: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  itemMeta: {
    fontSize: 10,
    color: colors.gray[600],
  },
  itemError: {
    fontSize: 10,
    color: colors.danger.main,
  },
  retryBtn: {
    backgroundColor: colors.danger.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  retryBtnText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
  },
});
