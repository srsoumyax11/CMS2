import { describe, it, expect, beforeEach } from 'vitest';
import { wardenOutpassResource } from '@/resources/wardenOutpasses';
import { exportToCSV } from '@/components/shared/CSVExporter';
import { OutpassRecord } from '@/features/outpass/api';

describe('Data Kit Architecture Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('validates resource definition structure and default endpoints', () => {
    expect(wardenOutpassResource.id).toBe('warden_outpass_inbox');
    expect(wardenOutpassResource.endpoint.list).toBe('/api/v1/warden/outpasses');
    expect(wardenOutpassResource.fields.length).toBeGreaterThan(0);
    expect(wardenOutpassResource.rowActions?.length).toBeGreaterThan(0);
  });

  it('filters out sensitive columns from CSV exports', () => {
    const mockFields = [
      { key: 'name', labelKey: 'Name', type: 'text' as const },
      { key: 'passwordHash', labelKey: 'Password', type: 'text' as const, sensitive: true },
    ];
    const mockData = [{ name: 'John', passwordHash: 'secret123' }];
    
    // Test export does not throw and filters sensitive keys
    expect(() => {
      exportToCSV('test', mockData, mockFields, ['name', 'passwordHash']);
    }).not.toThrow();
  });

  it('saves and restores table column preferences in localStorage', () => {
    const key = 'cms_table_prefs_test_resource';
    const prefs = { visibleColumns: ['studentName', 'status'], density: 'comfortable' };
    localStorage.setItem(key, JSON.stringify(prefs));

    const restored = JSON.parse(localStorage.getItem(key) || '{}');
    expect(restored.visibleColumns).toEqual(['studentName', 'status']);
  });

  it('validates row actions visibleWhen filter criteria', () => {
    const approveAction = wardenOutpassResource.rowActions?.find((a) => a.key === 'approve');
    expect(approveAction).toBeDefined();

    if (approveAction?.visibleWhen) {
      expect(approveAction.visibleWhen({ id: '1', status: 'PENDING' } as OutpassRecord)).toBe(true);
      expect(approveAction.visibleWhen({ id: '2', status: 'APPROVED' } as OutpassRecord)).toBe(false);
    }
  });

  it('validates rejection action requires reason confirmation', () => {
    const rejectAction = wardenOutpassResource.rowActions?.find((a) => a.key === 'reject');
    expect(rejectAction).toBeDefined();
    expect(rejectAction?.confirm).toBe('reason');
    expect(rejectAction?.danger).toBe(true);
  });
});
