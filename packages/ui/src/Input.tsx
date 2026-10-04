import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TextStyle } from 'react-native';
import { colors, spacing, radius, typography, layout } from '@campus/design-tokens';

export interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  accessibilityLabel?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  accessibilityLabel,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={accessibilityLabel || label}
        placeholderTextColor={colors.gray[400]}
        style={[
          styles.input,
          error ? styles.inputError : styles.inputNormal,
          style,
        ]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as TextStyle['fontWeight'],
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  input: {
    minHeight: layout.touchTarget.minHeight, // 44px min touch target
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
  },
  inputNormal: {
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    color: colors.gray[900],
  },
  inputError: {
    borderColor: colors.danger.main,
    backgroundColor: colors.danger.light,
    color: colors.danger.dark,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.danger.main,
    marginTop: spacing.xs,
  },
});
