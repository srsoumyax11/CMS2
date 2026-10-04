import { useState, useEffect } from 'react';
import { APP_CONSTANTS } from '@/config/constants';

export type TableDensity = 'compact' | 'comfortable' | 'expanded';

export interface TablePrefs {
  visibleColumns: string[];
  density: TableDensity;
}

export function useTablePrefs(resourceId: string, defaultColumns: string[]) {
  const storageKey = `${APP_CONSTANTS.TABLE_PREFS_STORAGE_PREFIX}${resourceId}`;

  const [prefs, setPrefs] = useState<TablePrefs>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.visibleColumns)) {
          return {
            visibleColumns: parsed.visibleColumns,
            density: parsed.density || 'comfortable',
          };
        }
      }
    } catch {
      // ignore
    }
    return {
      visibleColumns: defaultColumns,
      density: 'comfortable',
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [storageKey, prefs]);

  const toggleColumn = (key: string) => {
    setPrefs((prev) => {
      const isVisible = prev.visibleColumns.includes(key);
      const updated = isVisible
        ? prev.visibleColumns.filter((c) => c !== key)
        : [...prev.visibleColumns, key];
      return { ...prev, visibleColumns: updated };
    });
  };

  const setDensity = (density: TableDensity) => {
    setPrefs((prev) => ({ ...prev, density }));
  };

  const resetPrefs = () => {
    setPrefs({
      visibleColumns: defaultColumns,
      density: 'comfortable',
    });
  };

  return {
    visibleColumns: prefs.visibleColumns,
    density: prefs.density,
    toggleColumn,
    setDensity,
    resetPrefs,
  };
}
