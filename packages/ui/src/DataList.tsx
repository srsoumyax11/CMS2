import React from 'react';
import { FlatList, View, ActivityIndicator, StyleSheet, FlatListProps } from 'react-native';
import { colors, spacing } from '@campus/design-tokens';
import { EmptyState } from './EmptyState';

export interface DataListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: (info: { item: T; index: number }) => React.ReactElement;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataList<T>({
  data,
  renderItem,
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no items to display at this time.',
  ...flatListProps
}: DataListProps<T>) {
  if (isLoading) {
    return (
      <View style={styles.center} testID="datalist-loading">
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Failed to load data"
        description={error}
        onRetry={(onRetry || flatListProps.onRefresh) ?? undefined}
        retryLabel="Retry"
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        onRetry={onRetry}
      />
    );
  }

  return (
    <FlatList<T>
      data={data}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      {...flatListProps}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    padding: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.md,
  },
});
