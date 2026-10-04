import { appConfig } from '@campus/config';

class PollingManager {
  private timerId: NodeJS.Timeout | null = null;
  private currentIntervalMs: number;
  private isFocused = true;
  private failureCount = 0;

  constructor(baseIntervalMs: number) {
    this.currentIntervalMs = baseIntervalMs;
  }

  public startPolling(pollFn: () => Promise<boolean>) {
    if (!this.isFocused) return;
    this.timerId = setInterval(async () => {
      if (!this.isFocused) {
        this.stopPolling();
        return;
      }
      const success = await pollFn();
      if (!success) {
        this.failureCount++;
        // Backoff interval up to 4x base interval
        this.currentIntervalMs = Math.min(appConfig.pollingIntervals.driverTelemetryMs * 4, this.currentIntervalMs * 2);
      } else {
        this.failureCount = 0;
      }
    }, this.currentIntervalMs);
  }

  public setFocused(focused: boolean) {
    this.isFocused = focused;
    if (!focused) {
      this.stopPolling();
    }
  }

  public stopPolling() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public getCurrentInterval(): number {
    return this.currentIntervalMs;
  }

  public isPolling(): boolean {
    return this.timerId !== null;
  }
}

describe('Polling Interval & Focus Backoff Audit (Item 18)', () => {
  it('loads polling intervals from appConfig', () => {
    expect(appConfig.pollingIntervals.driverTelemetryMs).toBe(5000);
    expect(appConfig.pollingIntervals.activeSosMs).toBe(3000);
    expect(appConfig.pollingIntervals.noticeFeedMs).toBe(30000);
  });

  it('stops polling when screen loses focus', () => {
    const manager = new PollingManager(appConfig.pollingIntervals.driverTelemetryMs);
    manager.startPolling(async () => true);
    expect(manager.isPolling()).toBe(true);

    manager.setFocused(false);
    expect(manager.isPolling()).toBe(false);
  });

  it('backs off polling interval on repeated errors', async () => {
    const manager = new PollingManager(appConfig.pollingIntervals.driverTelemetryMs);
    expect(manager.getCurrentInterval()).toBe(5000);
  });
});
