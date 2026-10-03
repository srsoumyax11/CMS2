import { describe, expect, it, beforeEach } from 'bun:test';
import { CacheService } from '../../src/services/cache.service';

describe('Phase 18 Unit Tests: In-Memory Reference Cache Service', () => {
  beforeEach(() => {
    CacheService.clearAll();
  });

  it('should compute & cache value on first access', async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      return ['dept1', 'dept2'];
    };

    const data1 = await CacheService.getOrSet('test:depts', 10, fetcher);
    expect(data1).toEqual(['dept1', 'dept2']);
    expect(callCount).toBe(1);

    // Second call should return cached value without invoking fetcher
    const data2 = await CacheService.getOrSet('test:depts', 10, fetcher);
    expect(data2).toEqual(['dept1', 'dept2']);
    expect(callCount).toBe(1);
  });

  it('should invalidate cache entry when explicit invalidation requested', async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      return ['item1'];
    };

    await CacheService.getOrSet('test:items', 10, fetcher);
    expect(callCount).toBe(1);

    CacheService.invalidate('test:items');

    await CacheService.getOrSet('test:items', 10, fetcher);
    expect(callCount).toBe(2);
  });
});
