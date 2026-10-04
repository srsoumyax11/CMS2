import { z } from 'zod';
import type { ApiClient } from './client';

export interface StorageAdapter {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
}

export class InMemoryQueueStorage implements StorageAdapter {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

export interface QueuedAction {
  id: string;
  idempotencyKey: string;
  type: 'attendance' | 'rollcall' | 'check_in' | 'sos' | 'complaint';
  endpoint: string;
  payload: Record<string, unknown>;
  createdAt: string;
  status: 'pending' | 'failed' | 'synced';
  error?: string;
}

const QUEUE_STORAGE_KEY = 'campus_offline_queue_v1';

export class OfflineQueueManager {
  private queue: QueuedAction[] = [];
  private storage: StorageAdapter;

  constructor(storage?: StorageAdapter) {
    this.storage = storage || new InMemoryQueueStorage();
  }

  public async loadFromStorage(): Promise<QueuedAction[]> {
    try {
      const raw = await this.storage.getItem(QUEUE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as QueuedAction[];
        if (Array.isArray(parsed)) {
          this.queue = parsed;
        }
      }
    } catch {
      this.queue = [];
    }
    return this.getQueue();
  }

  public async saveToStorage(): Promise<void> {
    try {
      await this.storage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // Ignore storage write errors
    }
  }

  public async enqueue(
    item: {
      type: 'attendance' | 'rollcall' | 'check_in' | 'sos' | 'complaint';
      endpoint: string;
      payload: Record<string, unknown>;
      idempotencyKey?: string;
    }
  ): Promise<QueuedAction> {
    await this.loadFromStorage();

    const idempotencyKey =
      item.idempotencyKey || `idemp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // Check if an action with the exact same idempotency key already exists
    const existing = this.queue.find((q) => q.idempotencyKey === idempotencyKey);
    if (existing) {
      return existing;
    }

    const action: QueuedAction = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      idempotencyKey,
      type: item.type,
      endpoint: item.endpoint,
      payload: item.payload,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    this.queue.push(action);
    await this.saveToStorage();
    return action;
  }

  public getQueue(): QueuedAction[] {
    return [...this.queue];
  }

  public getPendingAndFailed(): QueuedAction[] {
    return this.queue.filter((q) => q.status === 'pending' || q.status === 'failed');
  }

  public async processSync(apiClient: ApiClient): Promise<{ success: string[]; failed: string[] }> {
    await this.loadFromStorage();
    const success: string[] = [];
    const failed: string[] = [];

    for (const item of this.queue) {
      if (item.status === 'synced') continue;

      try {
        await apiClient.post(item.endpoint, z.any(), item.payload, {
          idempotencyKey: item.idempotencyKey,
        });
        item.status = 'synced';
        item.error = undefined;
        success.push(item.idempotencyKey);
      } catch (err: any) {
        item.status = 'failed';
        item.error = err?.message || 'Sync failed';
        failed.push(item.idempotencyKey);
      }
    }

    await this.saveToStorage();
    return { success, failed };
  }

  public async retryItem(id: string, apiClient: ApiClient): Promise<boolean> {
    await this.loadFromStorage();
    const item = this.queue.find((q) => q.id === id || q.idempotencyKey === id);
    if (!item) return false;

    try {
      await apiClient.post(item.endpoint, z.any(), item.payload, {
        idempotencyKey: item.idempotencyKey,
      });
      item.status = 'synced';
      item.error = undefined;
      await this.saveToStorage();
      return true;
    } catch (err: any) {
      item.status = 'failed';
      item.error = err?.message || 'Retry failed';
      await this.saveToStorage();
      return false;
    }
  }

  public async clearSynced(): Promise<void> {
    this.queue = this.queue.filter((q) => q.status !== 'synced');
    await this.saveToStorage();
  }
}
