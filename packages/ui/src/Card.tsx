import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, radius } from '@campus/design-tokens';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({ children, style, testID }) => {
  return <View style={[styles.card, style]} testID={testID}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: spacing.md,
  },
});
