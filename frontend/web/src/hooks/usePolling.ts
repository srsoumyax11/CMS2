import { useEffect, useRef, useCallback } from 'react';
import { APP_CONSTANTS } from '@/config/constants';

interface UsePollingOptions {
  enabled?: boolean;
  intervalMs?: number;
  onError?: (error: unknown) => void;
}

export function usePolling(
  callback: () => Promise<void> | void,
  options: UsePollingOptions = {},
) {
  const {
    enabled = true,
    intervalMs = APP_CONSTANTS.TOKEN_REFRESH_INTERVAL_MS,
    onError,
  } = options;

  const savedCallback = useRef(callback);
  const backoffCountRef = useRef(0);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const executePoll = useCallback(async () => {
    if (document.hidden) return; // Pause polling when tab is hidden

    try {
      await savedCallback.current();
      backoffCountRef.current = 0; // Reset backoff on success
    } catch (err) {
      backoffCountRef.current += 1;
      if (onError) onError(err);
    }
  }, [onError]);

  useEffect(() => {
    if (!enabled) return;

    // Calculate effective interval with exponential backoff on errors (capped at 5x)
    const backoffMultiplier = Math.min(Math.pow(1.5, backoffCountRef.current), 5);
    const effectiveInterval = intervalMs * backoffMultiplier;

    const timer = setInterval(() => {
      executePoll();
    }, effectiveInterval);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        executePoll(); // Immediate poll when tab becomes visible
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, intervalMs, executePoll]);
}
