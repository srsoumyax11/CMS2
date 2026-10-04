import { ApiClient, InMemoryTokenStore } from '@campus/api-client';
import { OfflineQueueManager, InMemoryQueueStorage } from '@campus/api-client';

describe('Offline Queue & Idempotency Key Sync with Persistence', () => {
  let storage: InMemoryQueueStorage;
  let queueManager1: OfflineQueueManager;
  let mockApiClient: ApiClient;
  let postSpy: jest.SpyInstance;

  beforeEach(() => {
    storage = new InMemoryQueueStorage();
    queueManager1 = new OfflineQueueManager(storage);
    mockApiClient = new ApiClient('http://localhost:3000/api/v1', new InMemoryTokenStore());
    postSpy = jest.spyOn(mockApiClient, 'post').mockResolvedValue({ success: true });
  });

  it('queues action with automatic idempotencyKey and persists to storage', async () => {
    const action = await queueManager1.enqueue({
      type: 'attendance',
      endpoint: '/attendance/mark',
      payload: { courseId: 'CS101' },
    });

    expect(action.idempotencyKey).toBeDefined();
    expect(action.status).toBe('pending');
    expect(queueManager1.getPendingAndFailed().length).toBe(1);
  });

  it('re-creates queue from storage after app restart and syncs once with no duplicate', async () => {
    // Phase 1: Queue item in initial app session
    const action = await queueManager1.enqueue({
      type: 'sos',
      endpoint: '/sos/trigger',
      payload: { emergency: true },
      idempotencyKey: 'idemp_restart_123',
    });

    // Phase 2: Simulate App Restart -> instantiate new OfflineQueueManager sharing same storage
    const queueManager2 = new OfflineQueueManager(storage);
    const restoredQueue = await queueManager2.loadFromStorage();
    expect(restoredQueue.length).toBe(1);
    expect(restoredQueue[0].idempotencyKey).toBe('idemp_restart_123');

    // Phase 3: Process Sync
    const syncResults = await queueManager2.processSync(mockApiClient);

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith(
      '/sos/trigger',
      expect.anything(),
      { emergency: true },
      { idempotencyKey: 'idemp_restart_123' }
    );
    expect(syncResults.success).toEqual(['idemp_restart_123']);

    // Phase 4: Second sync attempt -> no duplicates sent
    const secondSyncResults = await queueManager2.processSync(mockApiClient);
    expect(postSpy).toHaveBeenCalledTimes(1); // Still 1 total call!
    expect(secondSyncResults.success).toEqual([]);
  });

  it('keeps failed items visible with retry capability', async () => {
    postSpy.mockRejectedValueOnce(new Error('Network error'));

    await queueManager1.enqueue({
      type: 'check_in',
      endpoint: '/gate/check-in',
      payload: { gate: 'Main' },
      idempotencyKey: 'idemp_fail_001',
    });

    const syncResults = await queueManager1.processSync(mockApiClient);
    expect(syncResults.failed).toEqual(['idemp_fail_001']);

    const pendingAndFailed = queueManager1.getPendingAndFailed();
    expect(pendingAndFailed.length).toBe(1);
    expect(pendingAndFailed[0].status).toBe('failed');
    expect(pendingAndFailed[0].error).toBe('Network error');

    // Test retry single item
    postSpy.mockResolvedValueOnce({ success: true });
    const retrySuccess = await queueManager1.retryItem('idemp_fail_001', mockApiClient);
    expect(retrySuccess).toBe(true);
    expect(queueManager1.getPendingAndFailed().length).toBe(0);
  });
});
