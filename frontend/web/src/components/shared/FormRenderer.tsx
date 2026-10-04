import React from 'react';
import { FieldConfig } from '@/components/data/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { t } from '@/i18n';

interface FormRendererProps<T extends Record<string, unknown> = Record<string, unknown>> {
  fields: FieldConfig<T>[];
  initialValues?: Partial<T>;
  isSubmitting?: boolean;
  onSave: (values: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

export function FormRenderer<T extends Record<string, unknown>>({
  fields,
  initialValues = {},
  isSubmitting = false,
  onSave,
  onCancel,
}: FormRendererProps<T>) {
  const editableFields = fields.filter((f) => f.editable !== false);
  const [formData, setFormData] = React.useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    editableFields.forEach((f) => {
      init[f.key] = initialValues[f.key] ?? '';
    });
    return init;
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate using field zod schemas if provided
    for (const f of editableFields) {
      if (f.schema) {
        const result = f.schema.safeParse(formData[f.key]);
        if (!result.success) {
          const firstErr = result.error.issues[0]?.message || 'Invalid field value';
          newErrors[f.key] = firstErr;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {editableFields.map((field) => (
        <div key={field.key} className="space-y-1">
          <label className="text-xs font-semibold text-foreground">
            {t(field.labelKey)}
          </label>

          {field.type === 'textarea' ? (
            <textarea
              value={String(formData[field.key] ?? '')}
              onChange={(e) => handleChange(field.key, e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          ) : field.type === 'select' && field.filterOptions ? (
            <select
              value={String(formData[field.key] ?? '')}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select option...</option>
              {field.filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : field.type === 'boolean' ? (
            <input
              type="checkbox"
              checked={Boolean(formData[field.key])}
              onChange={(e) => handleChange(field.key, e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
          ) : (
            <Input
              type={
                field.type === 'number' || field.type === 'money'
                  ? 'number'
                  : field.type === 'date'
                  ? 'date'
                  : field.type === 'datetime'
                  ? 'datetime-local'
                  : 'text'
              }
              value={String(formData[field.key] ?? '')}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="text-xs"
            />
          )}

          {errors[field.key] && (
            <p className="text-[11px] text-red-500 font-medium">{errors[field.key]}</p>
          )}
        </div>
      ))}

      <div className="flex justify-end gap-2 pt-3 border-t">
        <Button variant="outline" size="sm" type="button" onClick={onCancel} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button size="sm" type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.loading') : t('common.save')}
        </Button>
      </div>
    </form>
  );
}
