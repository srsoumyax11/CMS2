import { FieldConfig } from '@/components/data/types';
import { t } from '@/i18n';

export function exportToCSV<T extends Record<string, unknown>>(
  filename: string,
  records: T[],
  fields: FieldConfig<T>[],
  visibleColumnKeys: string[]
): void {
  // Filter visible columns that are NOT sensitive
  const exportableFields = fields.filter(
    (f) => visibleColumnKeys.includes(f.key) && !f.sensitive
  );

  if (exportableFields.length === 0 || records.length === 0) {
    return;
  }

  const headers = exportableFields.map((f) => `"${t(f.labelKey).replace(/"/g, '""')}"`);

  const rows = records.map((record) => {
    return exportableFields
      .map((f) => {
        const val = record[f.key];
        if (val === null || val === undefined) return '""';
        const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${strVal.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.toLowerCase().replace(/\s+/g, '_')}_export.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
