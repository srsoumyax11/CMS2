/**
 * Simple in-memory TTL caching service for static reference data
 * (departments, courses, academic years, fee heads, leave types)
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class CacheService {
  private static store = new Map<string, CacheEntry<any>>();

  /**
   * Get cached entry or compute & cache if missing/expired
   */
  static async getOrSet<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const existing = this.store.get(key);
    const now = Date.now();

    if (existing && existing.expiresAt > now) {
      return existing.data;
    }

    const freshData = await fetcher();
    this.store.set(key, {
      data: freshData,
      expiresAt: now + ttlSeconds * 1000,
    });

    return freshData;
  }

  /**
   * Invalidate specific cache key or prefix
   */
  static invalidate(keyOrPrefix: string): void {
    for (const key of this.store.keys()) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all cached reference entries
   */
  static clearAll(): void {
    this.store.clear();
  }
}
