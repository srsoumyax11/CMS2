import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from './Input';
import { Button } from './Button';
import { colors, spacing, typography, radius } from '@campus/design-tokens';
import { useForm, Controller, FieldValues, DefaultValues, Path, PathValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export type FieldType = 'text' | 'select' | 'date' | 'file' | 'textarea';

export interface OptionItem {
  label: string;
  value: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: OptionItem[];
  required?: boolean;
}

export interface FormRendererProps<T extends FieldValues> {
  fields: FieldConfig[];
  schema: z.ZodType<T>;
  onSubmit: (data: T) => void | Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
  defaultValues?: DefaultValues<T>;
}

export function FormRenderer<T extends FieldValues>({
  fields,
  schema,
  onSubmit,
  submitLabel = 'Submit',
  isLoading = false,
  defaultValues,
}: FormRendererProps<T>) {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <View style={styles.container}>
      {fields.map((field) => {
        const fieldName = field.name as Path<T>;
        const errorMsg = errors[field.name]?.message as string | undefined;

        if (field.type === 'select' && field.options) {
          const currentValue = watch(fieldName);
          return (
            <View key={field.name} style={styles.fieldGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <View style={styles.optionsRow}>
                {field.options.map((opt) => {
                  const isSelected = currentValue === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.optionChip, isSelected && styles.optionChipSelected]}
                      onPress={() => setValue(fieldName, opt.value as PathValue<T, Path<T>>)}
                      testID={`option-${field.name}-${opt.value}`}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
            </View>
          );
        }

        return (
          <Controller
            key={field.name}
            control={control}
            name={fieldName}
            render={({ field: { onChange, value } }) => (
              <Input
                label={field.label}
                placeholder={field.placeholder}
                value={value ? String(value) : ''}
                onChangeText={onChange}
                error={errorMsg}
                multiline={field.type === 'textarea'}
                numberOfLines={field.type === 'textarea' ? 4 : 1}
                testID={`input-${field.name}`}
              />
            )}
          />
        );
      })}

      <Button
        label={submitLabel}
        onPress={handleSubmit(onSubmit)}
        isLoading={isLoading}
        disabled={isLoading}
        testID="btn-form-submit"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  fieldGroup: {
    marginVertical: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'medium',
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.gray[200],
  },
  optionChipSelected: {
    backgroundColor: colors.primary[600],
  },
  optionText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[800],
  },
  optionTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.danger.main,
    marginTop: spacing.xs,
  },
});

